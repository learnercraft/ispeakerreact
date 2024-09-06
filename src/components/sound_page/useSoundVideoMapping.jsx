import { useMemo } from "react";

export function useSoundVideoMapping(type, accent, soundsData, phonemeIndex) {
    return useMemo(() => {
        const videoArrayKey =
            type === "consonant"
                ? accent === "british"
                    ? "consonants_b"
                    : "consonants_a"
                : accent === "british"
                ? "vowels_b"
                : "vowels_a";

        const videoArray = soundsData[videoArrayKey];
        const videoBlockStartIndex = phonemeIndex * 5;

        // Find the first non-empty video URL in this phoneme's video block
        const videoUrl = videoArray
            .slice(videoBlockStartIndex, videoBlockStartIndex + 5)
            .find((video) => video.value)?.value;

        // Video url for practice part
        const videoUrls = videoArray
            .slice(videoBlockStartIndex, videoBlockStartIndex + 5)
            .filter((video) => video.value)
            .map((video) => video.value);

        return { videoUrls, videoUrl };
    }, [type, accent, soundsData, phonemeIndex]);
}
