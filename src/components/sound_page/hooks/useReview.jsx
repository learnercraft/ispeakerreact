import { useState, useEffect, useCallback } from "react";

export const useReview = (sound, accent, index, soundsData) => {
    const findPhonemeDetails = useCallback(
        (phoneme) => {
            let phonemeIndex = soundsData.consonants.findIndex((p) => p.phoneme === phoneme);
            if (phonemeIndex !== -1) return { index: phonemeIndex, type: "consonant" };

            phonemeIndex = soundsData.vowels_n_diphthongs.findIndex((p) => p.phoneme === phoneme);
            if (phonemeIndex !== -1) return { index: phonemeIndex, type: "vowel" };

            return { index: -1, type: null };
        },
        [soundsData.consonants, soundsData.vowels_n_diphthongs]
    );

    const { index: phonemeIndex, type } = findPhonemeDetails(sound.phoneme);

    const reviewKey = `${type}${index + 1}`;
    const [review, setReview] = useState(null);

    const handleReviewClick = (newReview) => {
        setReview(newReview);

        const ispeakerData = JSON.parse(localStorage.getItem("ispeaker") || "{}");
        ispeakerData.soundReview = ispeakerData.soundReview || {};
        ispeakerData.soundReview[accent] = ispeakerData.soundReview[accent] || {};
        ispeakerData.soundReview[accent][reviewKey] = newReview;

        localStorage.setItem("ispeaker", JSON.stringify(ispeakerData));
    };

    useEffect(() => {
        const reviews = JSON.parse(localStorage.getItem("ispeaker") || "{}").soundReview || {};
        const soundReview = reviews[accent]?.[reviewKey];
        if (soundReview) setReview(soundReview);
    }, [accent, reviewKey]);

    return { review, handleReviewClick };
};
