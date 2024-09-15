import { useEffect, useState } from "react";
import { isElectron } from "../../utils/isElectron";

export function useSoundVideoMapping(type, accent, soundsData, phonemeIndex) {
    const [videoUrl, setVideoUrl] = useState(null);
    const [videoUrls, setVideoUrls] = useState([]);
    const [videoLoading, setVideoLoading] = useState(true);

    useEffect(() => {
        const fetchVideoUrls = async () => {
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

            const inElectron = isElectron();

            const videoItems = videoArray.slice(videoBlockStartIndex, videoBlockStartIndex + 5);

            const accentFile = accent === "british" ? "GB" : "US";
            const folderName = `iSpeakerReact_SoundVideos_${accentFile}`;

            // Function to check if the video file exists and return the video URL accordingly
            const checkVideoFile = async (fileName, onlineUrl) => {
                if (inElectron && fileName) {
                    const videoStreamUrl = `http://localhost:8998/video/${folderName}/${fileName}`;
                    try {
                        // Make a HEAD request to check if the local video file exists
                        const response = await fetch(videoStreamUrl, { method: "HEAD" });
                        if (response.ok) {
                            return videoStreamUrl; // Return the local file URL if it exists
                        }
                    } catch (error) {
                        console.warn("Local video not found, falling back to online:", error);
                    }
                }
                return onlineUrl; // Fallback to online URL if the local file is not available
            };

            // Find and set the first video URL (local or online)
            if (videoItems.length > 0) {
                const firstVideo = videoItems[0];
                const localVideoUrl = firstVideo.file_name;
                const onlineVideoUrl = firstVideo.value;

                const finalVideoUrl = await checkVideoFile(localVideoUrl, onlineVideoUrl);
                setVideoUrl({ value: finalVideoUrl, isLocal: !!localVideoUrl });
            }

            // Handle all available videos for practice part (with fallback for each video)
            const allVideoUrls = await Promise.all(
                videoItems.map(async (video) => {
                    const localVideoUrl = video.file_name;
                    const onlineVideoUrl = video.value;

                    return await checkVideoFile(localVideoUrl, onlineVideoUrl);
                })
            );
            setVideoUrls(allVideoUrls);

            setVideoLoading(false);
        };

        fetchVideoUrls();
    }, [type, accent, soundsData, phonemeIndex]);

    return { videoUrls, videoUrl, videoLoading };
}
