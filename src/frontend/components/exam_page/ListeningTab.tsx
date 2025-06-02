import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoVolumeHigh, IoVolumeHighOutline } from "react-icons/io5";
import { sonnerErrorToast } from "../../utils/sonnerCustomToast.js";
import { ListeningTabProps } from "./types.js";

const ListeningTab = ({ subtopicsBre, subtopicsAme, currentAccent }: ListeningTabProps) => {
    const { t } = useTranslation();

    const [playingIndex, setPlayingIndex] = useState<string | null>(null);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [loadingIndex, setLoadingIndex] = useState<string | null>(null);

    const subtopics = currentAccent === "american" ? subtopicsAme : subtopicsBre;

    const handlePlayPause = (index: string, audioSrc: string) => {
        if (loadingIndex === index) {
            // Cancel the loading process if clicked again
            if (abortController.current) {
                abortController.current.abort();
            }
            setLoadingIndex(null);
            return;
        }

        if (playingIndex === index) {
            // Stop current audio if the same index is clicked
            if (currentAudio) {
                currentAudio.pause();
                setPlayingIndex(null);
                setCurrentAudio(null);
            }
        } else {
            // Stop any currently playing audio
            if (currentAudio) {
                currentAudio.pause();
            }

            // Set loading state
            setLoadingIndex(index);

            // AbortController to manage cancellation
            const controller = new AbortController();
            abortController.current = controller;
            const signal = controller.signal;

            // Fetch the audio file
            fetch(`${import.meta.env.BASE_URL}media/exam/mp3/${audioSrc}.mp3`, { signal })
                .then((response) => response.blob())
                .then((audioBlob) => {
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);

                    // Explicitly load the audio (for iOS < 17)
                    audio.load();

                    audio.oncanplaythrough = () => {
                        setLoadingIndex(null);
                        setCurrentAudio(audio);
                        setPlayingIndex(index);
                        audio.play();
                    };

                    audio.onended = () => {
                        setCurrentAudio(null);
                        setPlayingIndex(null);
                        URL.revokeObjectURL(audioUrl);
                    };

                    audio.onerror = () => {
                        setLoadingIndex(null);
                        setCurrentAudio(null);
                        setPlayingIndex(null);
                        console.log("Audio loading error");
                        sonnerErrorToast(t("toast.audioPlayFailed"));
                    };

                    setCurrentAudio(audio);
                })
                .catch((error) => {
                    if (error.name === "AbortError") {
                        console.log("Audio loading aborted");
                    } else {
                        console.error("Error loading audio:", error);
                        sonnerErrorToast(t("toast.audioPlayFailed"));
                    }
                    setLoadingIndex(null);
                    setCurrentAudio(null);
                    setPlayingIndex(null);
                });
        }
    };

    const abortController = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
            if (currentAudio) {
                currentAudio.pause();
                setCurrentAudio(null);
            }
        };
    }, [currentAudio]);

    return (
        <>
            <div className="flex flex-wrap justify-center gap-4">
                {subtopics.map((subtopic, topicIndex) => (
                    <div
                        key={topicIndex}
                        className="card card-lg card-border w-full shadow-md md:w-2/5 lg:w-[30%] dark:border-slate-600"
                    >
                        <div className="card-body px-4 md:px-8">
                            <div className="card-title font-semibold">{t(subtopic.title)}</div>
                            <div className="divider divider-secondary m-0"></div>

                            <ul
                                role="list"
                                className="divide-y divide-gray-300 dark:divide-gray-600"
                            >
                                {subtopic.sentences.map((sentenceObj, sentenceIndex) => {
                                    const uniqueIndex = `${topicIndex}-${sentenceIndex}`;
                                    return (
                                        <li
                                            lang="en"
                                            className={`flex cursor-pointer justify-between gap-x-6 py-3 ${playingIndex === uniqueIndex ? "bg-secondary text-secondary-content" : ""}`}
                                            key={uniqueIndex}
                                            onClick={() =>
                                                handlePlayPause(uniqueIndex, sentenceObj.audioSrc)
                                            }
                                        >
                                            <div className="flex min-w-0 gap-x-4">
                                                <div className="min-w-0 flex-auto">
                                                    <p
                                                        className="italic"
                                                        dangerouslySetInnerHTML={{
                                                            __html: sentenceObj.sentence,
                                                        }}
                                                    ></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-x-2">
                                                {loadingIndex === uniqueIndex ? (
                                                    <span className="loading loading-spinner loading-md"></span>
                                                ) : playingIndex === uniqueIndex ? (
                                                    <IoVolumeHigh className="h-6 w-6" />
                                                ) : (
                                                    <IoVolumeHighOutline className="h-6 w-6" />
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ListeningTab;
