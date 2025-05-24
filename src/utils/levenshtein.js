const levenshtein = (a, b) => {
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, // deletion
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j - 1] + 1 // substitution
                );
            }
        }
    }
    return matrix[a.length][b.length];
};

const getCharacterDiff = (a, b) => {
    // Simple character diff using dynamic programming
    const m = a.length,
        n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    // Backtrack to get the diff
    let i = m,
        j = n,
        res = [];
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
            res.unshift({ char: a[i - 1], type: "same" });
            i--;
            j--;
        } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
            res.unshift({ char: b[j - 1], type: "replace" });
            i--;
            j--;
        } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
            res.unshift({ char: b[j - 1], type: "insert" });
            j--;
        } else {
            res.unshift({ char: a[i - 1], type: "delete" });
            i--;
        }
    }
    return res;
};

const alignPhonemes = (modelPhoneme, officialPhoneme) => {
    // Tokenize the official phoneme string
    const officialTokens = officialPhoneme.trim().split(/\s+/);

    // Remove all spaces from model output for easier matching
    let modelStr = modelPhoneme.replace(/\s+/g, "");
    let idx = 0;
    const aligned = [];

    for (const token of officialTokens) {
        // Try to match the next segment of modelStr to the current official token
        if (modelStr.substr(idx, token.length) === token) {
            aligned.push(token);
            idx += token.length;
        } else {
            // If not matching, try to find the best match (fallback: take the next N chars)
            aligned.push(modelStr.substr(idx, token.length));
            idx += token.length;
        }
    }
    // If there are leftovers in modelStr, add them as extra tokens
    if (idx < modelStr.length) {
        aligned.push(modelStr.substr(idx));
    }
    return aligned.join(" ");
};

export { alignPhonemes, getCharacterDiff, levenshtein };

