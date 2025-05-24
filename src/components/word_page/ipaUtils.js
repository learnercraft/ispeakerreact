// IPA normalization and fuzzy matching utilities

// Map of IPA variants to canonical forms
const IPA_NORMALIZATION_MAP = {
    ɑː: "ɑ",
    ɡ: "g",
    r: "ɹ",
    ɾ: "ɹ",
    ɻ: "ɹ",
    ɽ: "ɹ",
    ɺ: "ɹ",
    əʊ: "oʊ",
    ou: "oʊ",
    ei: "eɪ",
    ai: "aɪ",
    au: "aʊ",
    oi: "ɔɪ",
    ʧ: "t͡ʃ",
    ʤ: "d͡ʒ",
    ɚ: "ə",
    ʃ: "ʃ",
    ʒ: "ʒ",
    ŋ: "ŋ",
    er: "ɚ",
    ər: "ɚ",
    ɜr: "ɚ",
    // Add more as needed
};

// Common learner substitutions that should be treated as very close matches
const LEARNER_SUBSTITUTIONS = [
    ["ʊ", "u"],
    ["i", "ɪ"],
    ["ɑ", "a"],
    ["ɔ", "o"],
];

// Fuzzy phoneme groups (each array contains close phonemes)
const FUZZY_PHONEME_GROUPS = [
    ["ɑ", "ɑː"],
    ["ə", "ɚ"],
    ["oʊ", "ou", "əʊ"],
    ["eɪ", "ei"],
    ["aɪ", "ai"],
    ["aʊ", "au"],
    ["ɔɪ", "oi"],
    ["t͡ʃ", "ʧ"],
    ["d͡ʒ", "ʤ"],
    ["g", "ɡ"],
    ["ɹ", "r", "ɾ", "ɻ", "ɽ", "ɺ"],
    ["ŋ", "ŋ"],
    ["ɛ", "e"],
    // Add more as needed
];

// Normalize a single IPA token
const normalizeIPAToken = (token) => IPA_NORMALIZATION_MAP[token] || token;

// Normalize a full IPA string (tokenized by space)
const normalizeIPAString = (str) => {
    if (!str) return "";
    return str
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map(normalizeIPAToken)
        .join(" ");
};

// Check if two IPA tokens are fuzzy matches (close enough)
const arePhonemesClose = (a, b) => {
    // Ignore the long mark ː in comparison
    if (a === "ː" || b === "ː") return true;
    a = normalizeIPAToken(a.replace(/ː/gu, ""));
    b = normalizeIPAToken(b.replace(/ː/gu, ""));
    if (a === b) return true;
    for (const group of FUZZY_PHONEME_GROUPS) {
        if (group.includes(a) && group.includes(b)) return true;
    }
    return false;
};

// Character-based Levenshtein with fuzzy matching
const charLevenshtein = (a, b) => {
    const dp = Array(a.length + 1)
        .fill(null)
        .map(() => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (arePhonemesClose(a[i - 1], b[j - 1])) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1, // deletion
                    dp[i][j - 1] + 1, // insertion
                    dp[i - 1][j - 1] + 1 // substitution
                );
            }
        }
    }
    return dp[a.length][b.length];
};

// Format model output to match official phoneme's spacing
const formatToOfficialSpacing = (modelStr, officialStr) => {
    // Remove spaces from both
    const model = modelStr.replace(/ /g, "");
    const official = officialStr.trim().split(/\s+/);
    let idx = 0;
    const groups = official.map((syll) => {
        const group = model.slice(idx, idx + syll.length);
        idx += syll.length;
        return group;
    });
    // Add any extra phonemes from the model output
    if (idx < model.length) {
        groups.push(model.slice(idx));
    }
    return groups.join(" ");
};

// Check if two phonemes are common learner substitutions
const isLearnerSubstitution = (a, b) => {
    return LEARNER_SUBSTITUTIONS.some(
        ([p1, p2]) => (a === p1 && b === p2) || (a === p2 && b === p1)
    );
};

export {
    arePhonemesClose,
    charLevenshtein,
    formatToOfficialSpacing,
    isLearnerSubstitution,
    normalizeIPAString,
    normalizeIPAToken,
};
