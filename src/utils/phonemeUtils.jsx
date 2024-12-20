export const findPhonemeDetails = (phoneme, soundsData) => {
    let phonemeIndex = soundsData.consonants.findIndex((p) => p.phoneme === phoneme);
    if (phonemeIndex !== -1) return { index: phonemeIndex, type: "consonant" };

    phonemeIndex = soundsData.vowels_n_diphthongs.findIndex((p) => p.phoneme === phoneme);
    if (phonemeIndex !== -1) return { index: phonemeIndex, type: "vowel" };

    return { index: -1, type: null }; // Not found
};
