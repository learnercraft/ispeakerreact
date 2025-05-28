import he from "he";
import { useEffect, useRef, useState } from "react";
import { MdMic, MdPlayArrow, MdStop } from "react-icons/md";
import { checkRecordingExists, playRecording, saveRecording } from "../../utils/databaseOperations.js";
import isElectron from "../../utils/isElectron.js";
import {
    sonnerErrorToast,
    sonnerSuccessToast,
    sonnerWarningToast,
} from "../../utils/sonnerCustomToast.js";

// Types
export type TongueTwisterLine = string;

export interface TongueTwisterItem {
    text?: string;
    title?: string;
    lines?: TongueTwisterLine[];
}

export type SoundType = "consonants" | "vowels" | "diphthongs";

export interface Sound {
    type: SoundType;
    id: number;
}

export type Accent = "british" | "american";

export interface TongueTwisterProps {
    tongueTwisters: TongueTwisterItem[];
    t: (key: string) => string;
    sound: Sound;
    accent: Accent;
}

const MAX_RECORDING_DURATION_MS = 2 * 60 * 1000; // 2 minutes

const TongueTwister = ({ tongueTwisters, t, sound, accent }: TongueTwisterProps) => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [hasRecording, setHasRecording] = useState<boolean[]>([]);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingStartTimeRef = useRef<number | null>(null);
    const [currentAudioSource, setCurrentAudioSource] = useState<AudioBufferSourceNode | null>(null);
    const [currentAudioElement, setCurrentAudioElement] = useState<HTMLAudioElement | null>(null);

    // Check if recordings exist for each tongue twister
    useEffect(() => {
        const checkRecordings = async () => {
            const existsArray = await Promise.all(
                tongueTwisters.map((_, index) => {
                    const recordingKey = `${sound.type === "consonants" ? "constant" : sound.type === "vowels" ? "vowel" : "dipthong"}-${accent}-${sound.id}-tt-${index}`;
                    return checkRecordingExists(recordingKey);
                })
            );
            setHasRecording(existsArray);
        };

        if (tongueTwisters) {
            checkRecordings();
        }
    }, [tongueTwisters, sound, accent]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Cleanup recording resources
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }

            // Cleanup audio playback resources
            if (currentAudioSource) {
                currentAudioSource.stop();
            }
            if (currentAudioElement) {
                currentAudioElement.pause();
                currentAudioElement.currentTime = 0;
            }

            // Cleanup any active media streams
            if (mediaRecorderRef.current?.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            }
        };
    }, [currentAudioSource, currentAudioElement]);

    const startRecording = async (index: number) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeTypes = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];
            const supportedMimeType =
                mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "audio/webm";

            const recordOptions = {
                audioBitsPerSecond: 128000,
                mimeType: supportedMimeType,
            };

            const mediaRecorder = new MediaRecorder(stream, recordOptions);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            recordingStartTimeRef.current = Date.now();

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: supportedMimeType });
                const recordingKey = `${sound.type === "consonants" ? "constant" : sound.type === "vowels" ? "vowel" : "dipthong"}-${accent}-${sound.id}-tt-${index}`;
                await saveRecording(audioBlob, recordingKey, supportedMimeType);
                setHasRecording((prev) => {
                    const updated = [...prev];
                    updated[index] = true;
                    return updated;
                });
                stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                sonnerSuccessToast(t("toast.recordingSuccess"));
            };

            mediaRecorder.start();
            setIsRecording(true);
            setCurrentPlayingIndex(index);

            setTimeout(() => {
                if (mediaRecorder.state !== "inactive") {
                    mediaRecorder.stop();
                    sonnerWarningToast(t("toast.recordingExceeded"));
                    setIsRecording(false);
                    setCurrentPlayingIndex(null);
                }
            }, MAX_RECORDING_DURATION_MS);
        } catch (error: unknown) {
            console.error("Error starting recording:", error);
            if (isElectron()) {
                window.electron.log("error", `Error accessing the microphone: ${error}`);
            }
            sonnerErrorToast(`${t("toast.recordingFailed")} ${(error instanceof Error ? error.message : String(error))}`);
            setIsRecording(false);
            setCurrentPlayingIndex(null);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            const recordingDuration = Date.now() - (recordingStartTimeRef.current ?? 0);
            if (recordingDuration > MAX_RECORDING_DURATION_MS) {
                sonnerWarningToast(t("toast.recordingExceeded"));
            }
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setCurrentPlayingIndex(null);
        }
    };

    const handlePlayRecording = async (index: number) => {
        if (isPlaying && currentPlayingIndex === index) {
            if (currentAudioSource) {
                currentAudioSource.stop();
                setCurrentAudioSource(null);
            }
            if (currentAudioElement) {
                currentAudioElement.pause();
                currentAudioElement.currentTime = 0;
                setCurrentAudioElement(null);
            }
            setIsPlaying(false);
            setCurrentPlayingIndex(null);
            return;
        }

        setIsPlaying(true);
        setCurrentPlayingIndex(index);
        const recordingKey = `${sound.type === "consonants" ? "constant" : sound.type === "vowels" ? "vowel" : "dipthong"}-${accent}-${sound.id}-tt-${index}`;

        await playRecording(
            recordingKey,
            (audio: HTMLAudioElement | null, audioSource: AudioBufferSourceNode | null) => {
                if (audioSource) {
                    setCurrentAudioSource(audioSource);
                } else if (audio) {
                    setCurrentAudioElement(audio);
                }
            },
            (error: unknown) => {
                console.error("Error playing recording:", error);
                sonnerErrorToast(t("toast.playbackFailed"));
                setIsPlaying(false);
                setCurrentPlayingIndex(null);
            },
            () => {
                setIsPlaying(false);
                setCurrentAudioSource(null);
                setCurrentAudioElement(null);
                setCurrentPlayingIndex(null);
            }
        );
    };

    if (!tongueTwisters || tongueTwisters.length === 0) {
        return null;
    }

    return (
        <div className="my-6">
            <div className="divider divider-secondary"></div>
            <h4 className="my-2 text-2xl font-semibold">{t("sound_page.tongueTwister")}</h4>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
                {t("sound_page.tongueTwisterInstructions")}
            </p>
            <div className="space-y-4">
                {tongueTwisters.map((twister, index) => (
                    <div key={index} className="card bg-base-200">
                        <div className="card-body text-base">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex-1">
                                    {twister.title && (
                                        <h5 className="mb-1 font-semibold">{twister.title}</h5>
                                    )}
                                    {twister.lines ? (
                                        <div className="space-y-1">
                                            {twister.lines.map((line, lineIndex) => (
                                                <p key={lineIndex} className="italic" lang="en">
                                                    {he.decode(line)}
                                                </p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="italic" lang="en">
                                            {he.decode(twister.text ?? "")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-end space-x-2 sm:justify-start">
                                    <button
                                        className={`btn btn-circle ${isRecording ? "btn-error" : "btn-primary"}`}
                                        onClick={
                                            isRecording
                                                ? stopRecording
                                                : () => startRecording(index)
                                        }
                                        disabled={
                                            isPlaying ||
                                            (isRecording && currentPlayingIndex !== index)
                                        }
                                    >
                                        {isRecording && currentPlayingIndex === index ? (
                                            <MdStop className="h-6 w-6" />
                                        ) : (
                                            <MdMic className="h-6 w-6" />
                                        )}
                                    </button>
                                    <button
                                        className="btn btn-primary btn-circle"
                                        onClick={() => handlePlayRecording(index)}
                                        disabled={
                                            !hasRecording[index] ||
                                            isRecording ||
                                            (isPlaying && currentPlayingIndex !== index)
                                        }
                                    >
                                        {isPlaying && currentPlayingIndex === index ? (
                                            <MdStop className="h-6 w-6" />
                                        ) : (
                                            <MdPlayArrow className="h-6 w-6" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TongueTwister;
