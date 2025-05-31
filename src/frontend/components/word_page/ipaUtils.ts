// IPA normalization and fuzzy matching utilities

// Map of IPA variants to canonical forms
const IPA_NORMALIZATION_MAP: Record<string, string> = {
    // Length markers
    ɑː: "ɑ",
    iː: "i",
    uː: "u",
    ɔː: "ɔ",
    // Alternative forms
    ɡ: "g",
    r: "ɹ",
    ɾ: "ɹ",
    ɻ: "ɹ",
    ɽ: "ɹ",
    ɺ: "ɹ",
    // Diphthongs
    əʊ: "oʊ",
    ou: "oʊ",
    ei: "eɪ",
    ai: "aɪ",
    au: "aʊ",
    oi: "ɔɪ",
    // Affricates
    ʧ: "t͡ʃ",
    ʤ: "d͡ʒ",
    tʃ: "t͡ʃ",
    dʒ: "d͡ʒ",
    // Rhoticity
    ɚ: "ər",
    ɜr: "ər",
    er: "ər",
};

// Common learner substitutions that should be treated as very close matches
const LEARNER_SUBSTITUTIONS: [string, string][] = [
    ["ʊ", "u"],
    ["ɪ", "i"],
    ["ɑ", "a"],
    ["ɔ", "o"],
    ["ə", "ʌ"], // schwa confusion
    ["θ", "s"], // th -> s
    ["ð", "z"], // th -> z
    ["v", "w"], // common L2 substitution
    ["l", "ɹ"], // l/r confusion
];

// Fuzzy phoneme groups (each array contains close phonemes)
const FUZZY_PHONEME_GROUPS: string[][] = [
    ["ɑ", "a", "ɑː"],
    ["ə", "ʌ"],
    ["oʊ", "ou", "əʊ", "o"],
    ["eɪ", "ei", "e"],
    ["aɪ", "ai"],
    ["aʊ", "au"],
    ["ɔɪ", "oi"],
    ["t͡ʃ", "ʧ", "tʃ"],
    ["d͡ʒ", "ʤ", "dʒ"],
    ["g", "ɡ"],
    ["ɹ", "r", "ɾ", "ɻ", "ɽ", "ɺ"],
    ["ɛ", "e"],
    ["ɪ", "i", "iː"],
    ["ʊ", "u", "uː"],
    ["ɔ", "o", "ɔː"],
    // Fricatives that might be confused
    ["s", "ʃ"],
    ["z", "ʒ"],
    ["f", "θ"],
    ["v", "ð"],
];

// Tokenize IPA string into phonemes (handling multi-character sequences)
const tokenizeIPA = (str: string): string[] => {
    if (!str) return [];

    // First normalize common multi-character sequences
    let normalized = str;
    for (const [variant, canonical] of Object.entries(IPA_NORMALIZATION_MAP)) {
        if (variant.length > 1) {
            normalized = normalized.replace(new RegExp(variant, "g"), canonical);
        }
    }

    // Split by spaces first, then handle individual characters
    return normalized
        .split(/\s+/)
        .flatMap((syllable) => {
            const phonemes: string[] = [];
            let i = 0;
            while (i < syllable.length) {
                // Check for multi-character phonemes first
                let found = false;
                for (let len = 3; len >= 2; len--) {
                    const substr = syllable.slice(i, i + len);
                    if (
                        Object.keys(IPA_NORMALIZATION_MAP).includes(substr) ||
                        FUZZY_PHONEME_GROUPS.some((group) => group.includes(substr))
                    ) {
                        phonemes.push(substr);
                        i += len;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    if (syllable[i] && syllable[i].trim()) {
                        phonemes.push(syllable[i]);
                    }
                    i++;
                }
            }
            return phonemes;
        })
        .filter((p) => p && p !== " ");
};

// Normalize a single IPA token
const normalizeIPAToken = (token: string): string => {
    if (!token) return "";
    // Remove length markers first, then normalize
    const withoutLength = token.replace(/ː/g, "");
    return IPA_NORMALIZATION_MAP[withoutLength] || withoutLength;
};

// Normalize a full IPA string
const normalizeIPAString = (str: string): string => {
    if (!str) return "";
    return tokenizeIPA(str.toLowerCase().trim()).map(normalizeIPAToken).join(" ");
};

// Check if two IPA tokens are fuzzy matches (close enough)
const arePhonemesClose = (a: string, b: string): boolean => {
    if (!a || !b) return a === b;

    // Normalize both tokens
    const normA = normalizeIPAToken(a);
    const normB = normalizeIPAToken(b);

    // Exact match after normalization
    if (normA === normB) return true;

    // Check fuzzy groups
    for (const group of FUZZY_PHONEME_GROUPS) {
        if (group.includes(normA) && group.includes(normB)) return true;
    }

    // Check learner substitutions
    return isLearnerSubstitution(normA, normB);
};

// Phoneme-aware Levenshtein distance
const phonemeLevenshtein = (a: string, b: string): number => {
    const tokensA = tokenizeIPA(a);
    const tokensB = tokenizeIPA(b);

    const dp = Array(tokensA.length + 1)
        .fill(null)
        .map(() => Array(tokensB.length + 1).fill(0));

    // Initialize base cases
    for (let i = 0; i <= tokensA.length; i++) dp[i][0] = i;
    for (let j = 0; j <= tokensB.length; j++) dp[0][j] = j;

    // Fill the DP table
    for (let i = 1; i <= tokensA.length; i++) {
        for (let j = 1; j <= tokensB.length; j++) {
            if (arePhonemesClose(tokensA[i - 1], tokensB[j - 1])) {
                dp[i][j] = dp[i - 1][j - 1]; // No cost for close matches
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1, // deletion
                    dp[i][j - 1] + 1, // insertion
                    dp[i - 1][j - 1] + 1 // substitution
                );
            }
        }
    }

    return dp[tokensA.length][tokensB.length];
};

// Format model output to match official phoneme's spacing
const formatToOfficialSpacing = (modelStr: string, officialStr: string): string => {
    const modelTokens = tokenizeIPA(modelStr);
    const officialTokens = tokenizeIPA(officialStr);

    // If lengths match, use official spacing pattern
    if (modelTokens.length === officialTokens.length) {
        return modelTokens.join(" ");
    }

    // Otherwise, try to align based on syllable boundaries in official
    const officialSyllables = officialStr.trim().split(/\s+/);
    let tokenIndex = 0;
    const result: string[] = [];

    for (const syllable of officialSyllables) {
        const syllableTokens = tokenizeIPA(syllable);
        const modelSyllable = modelTokens.slice(tokenIndex, tokenIndex + syllableTokens.length);
        result.push(modelSyllable.join(""));
        tokenIndex += syllableTokens.length;
    }

    // Add any remaining tokens
    if (tokenIndex < modelTokens.length) {
        result.push(modelTokens.slice(tokenIndex).join(""));
    }

    return result.join(" ");
};

// Check if two phonemes are common learner substitutions
const isLearnerSubstitution = (a: string, b: string): boolean => {
    return LEARNER_SUBSTITUTIONS.some(
        ([p1, p2]) => (a === p1 && b === p2) || (a === p2 && b === p1)
    );
};

// Calculate similarity score (0-1, where 1 is perfect match)
const calculatePhonemesSimilarity = (str1: string, str2: string): number => {
    const tokens1 = tokenizeIPA(str1);
    const tokens2 = tokenizeIPA(str2);
    const maxLen = Math.max(tokens1.length, tokens2.length);

    if (maxLen === 0) return 1;

    const distance = phonemeLevenshtein(str1, str2);
    return Math.max(0, 1 - distance / maxLen);
};

export {
    arePhonemesClose,
    calculatePhonemesSimilarity,
    formatToOfficialSpacing,
    isLearnerSubstitution,
    normalizeIPAString,
    normalizeIPAToken,
    phonemeLevenshtein,
    tokenizeIPA,
};
