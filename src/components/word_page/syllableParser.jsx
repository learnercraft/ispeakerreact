export const parseIPA = (ipa) => {
    const syllables = [];
    let current = "";
    let primary = false;
    let secondary = false;

    for (const char of ipa) {
        if (char === "ˈ" || char === "ˌ" || char === "." || char === " ") {
            if (current) {
                syllables.push({ text: current, primary, secondary });
                current = "";
                primary = false;
                secondary = false;
            }

            if (char === "ˈ") primary = true;
            if (char === "ˌ") secondary = true;
        } else {
            current += char;
        }
    }

    if (current) {
        syllables.push({ text: current, primary, secondary });
    }

    return syllables;
};
