import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { MdMic, MdOutlineOndemandVideo, MdPlayArrow, MdStop } from "react-icons/md";
import { checkRecordingExists, playRecording, saveRecording } from "../../utils/databaseOperations";
import isElectron from "../../utils/isElectron";
import {
    sonnerErrorToast,
    sonnerSuccessToast,
    sonnerWarningToast,
} from "../../utils/sonnerCustomToast";
import { useSoundVideoDialog } from "./hooks/useSoundVideoDialogContext";

const MAX_RECORDING_DURATION_MS = 2 * 60 * 1000; // 2 minutes

const SoundPracticeCard = ({
    textContent,
    videoUrl,
    offlineVideo,
    accent,
    t,
    phoneme,
    phonemeId,
    index,
    type,
    shouldShowPhoneme = true,
}) => {
    const [localVideoUrl, setLocalVideoUrl] = useState(null);
    const [useOnlineVideo, setUseOnlineVideo] = useState(false);
    const [iframeLoadingStates, setIframeLoadingStates] = useState({
        modalIframe: true,
    });
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingStartTimeRef = useRef(null);
    const [currentAudioSource, setCurrentAudioSource] = useState(null);
    const [currentAudioElement, setCurrentAudioElement] = useState(null);

    const { showDialog, isAnyCardActive, setCardActive } = useSoundVideoDialog();

    const recordingKey = `${type}-${accent}-${phonemeId}-${index}`;
    const cardId = `${type}-${accent}-${phonemeId}-${index}`;

    useEffect(() => {
        // Check if recording exists when component mounts
        const checkExistingRecording = async () => {
            const exists = await checkRecordingExists(recordingKey);
            setHasRecording(exists);
        };
        checkExistingRecording();
    }, [recordingKey]);

    const startRecording = async () => {
        try {
            setCardActive(cardId, true);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Get supported MIME types
            const mimeTypes = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];

            // Find the first supported MIME type
            const supportedMimeType =
                mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "audio/webm"; // Fallback to webm if none supported

            const recordOptions = {
                audioBitsPerSecond: 128000,
                mimeType: supportedMimeType,
            };

            const mediaRecorder = new MediaRecorder(stream, recordOptions);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            recordingStartTimeRef.current = Date.now();

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: supportedMimeType });
                await saveRecording(audioBlob, recordingKey, supportedMimeType);
                setHasRecording(true);
                stream.getTracks().forEach((track) => track.stop());
                sonnerSuccessToast(t("toast.recordingSuccess"));
            };

            // Start recording
            mediaRecorder.start();
            setIsRecording(true);

            // Automatically stop recording after time limit
            setTimeout(() => {
                if (mediaRecorder.state !== "inactive") {
                    mediaRecorder.stop();
                    sonnerWarningToast(t("toast.recordingExceeded"));
                    setIsRecording(false);
                }
            }, MAX_RECORDING_DURATION_MS);
        } catch (error) {
            console.error("Error starting recording:", error);
            if (isElectron()) {
                window.electron.log("error", `Error accessing the microphone: ${error}`);
            }
            sonnerErrorToast(`${t("toast.recordingFailed")} ${error.message}`);
            setIsRecording(false);
            setCardActive(cardId, false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            const recordingDuration = Date.now() - recordingStartTimeRef.current;
            if (recordingDuration > MAX_RECORDING_DURATION_MS) {
                sonnerWarningToast(t("toast.recordingExceeded"));
            }
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setCardActive(cardId, false);
        }
    };

    const handlePlayRecording = async () => {
        if (isPlaying) {
            // Stop playback
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
            setCardActive(cardId, false);
            return;
        }

        setIsPlaying(true);
        setCardActive(cardId, true);
        await playRecording(
            recordingKey,
            (audio, audioSource) => {
                if (audioSource) {
                    setCurrentAudioSource(audioSource);
                } else {
                    setCurrentAudioElement(audio);
                }
            },
            (error) => {
                console.error("Error playing recording:", error);
                sonnerErrorToast(t("toast.playbackFailed"));
                setIsPlaying(false);
                setCardActive(cardId, false);
            },
            () => {
                setIsPlaying(false);
                setCurrentAudioSource(null);
                setCurrentAudioElement(null);
                setCardActive(cardId, false);
            }
        );
    };

    const imgPhonemeThumbSrc =
        accent === "american"
            ? `${import.meta.env.BASE_URL}images/ispeaker/sound_images/sounds_american.webp`
            : `${import.meta.env.BASE_URL}images/ispeaker/sound_images/sounds_british.webp`;

    const handleIframeLoad = (iframeKey) => {
        setIframeLoadingStates((prevStates) => ({
            ...prevStates,
            [iframeKey]: false,
        }));
    };

    const handleShow = () => {
        showDialog({
            videoUrl: isElectron() && !useOnlineVideo ? localVideoUrl : videoUrl,
            title: textContent.split(" - ")[0],
            phoneme,
            isLocalVideo: localVideoUrl && !useOnlineVideo,
            onIframeLoad: () => handleIframeLoad("modalIframe"),
            iframeLoading: iframeLoadingStates.modalIframe,
            showOnlineVideoAlert: isElectron() && useOnlineVideo,
            t,
        });
    };

    useEffect(() => {
        const checkLocalVideo = async () => {
            if (isElectron() && offlineVideo) {
                try {
                    const currentPort = await window.electron.ipcRenderer.invoke("get-port");
                    const folderName = `iSpeakerReact_SoundVideos_${accent === "british" ? "GB" : "US"}`;
                    const localUrl = `http://localhost:${currentPort}/video/${folderName}/${offlineVideo}`;

                    // Check if the video exists
                    const response = await fetch(localUrl, { method: "HEAD" });
                    if (response.ok) {
                        setLocalVideoUrl(localUrl);
                        setUseOnlineVideo(false);
                    } else {
                        setUseOnlineVideo(true);
                    }
                } catch (error) {
                    console.error("Error checking local video:", error);
                    setUseOnlineVideo(true);
                }
            } else {
                setUseOnlineVideo(true);
            }
        };

        checkLocalVideo();
    }, [offlineVideo, accent]);

    // Add cleanup effect
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
                mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [currentAudioSource, currentAudioElement]);

    if (!shouldShowPhoneme) {
        return null;
    }

    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="avatar">
                            <div className="w-12 rounded-full">
                                <img
                                    src={imgPhonemeThumbSrc}
                                    alt="Phoneme thumbnail"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                        <div>
                            <p
                                lang="en"
                                className="text-base"
                                dangerouslySetInnerHTML={{ __html: textContent }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            className="btn btn-primary btn-circle"
                            onClick={handleShow}
                            disabled={isAnyCardActive || isRecording || isPlaying}
                        >
                            <MdOutlineOndemandVideo className="h-6 w-6" />
                        </button>
                        <button
                            className={`btn btn-circle ${isRecording ? "btn-error" : "btn-primary"}`}
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={(!isRecording && isAnyCardActive) || isPlaying}
                        >
                            {isRecording ? (
                                <MdStop className="h-6 w-6" />
                            ) : (
                                <MdMic className="h-6 w-6" />
                            )}
                        </button>
                        <button
                            className="btn btn-primary btn-circle"
                            onClick={handlePlayRecording}
                            disabled={
                                !hasRecording || (!isPlaying && isAnyCardActive) || isRecording
                            }
                        >
                            {isPlaying ? (
                                <MdStop className="h-6 w-6" />
                            ) : (
                                <MdPlayArrow className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

SoundPracticeCard.propTypes = {
    textContent: PropTypes.string.isRequired,
    videoUrl: PropTypes.string.isRequired,
    offlineVideo: PropTypes.string.isRequired,
    accent: PropTypes.oneOf(["british", "american"]).isRequired,
    t: PropTypes.func.isRequired,
    phoneme: PropTypes.string.isRequired,
    phonemeId: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    type: PropTypes.oneOf(["constant", "vowel", "dipthong"]).isRequired,
    shouldShowPhoneme: PropTypes.bool,
};

export default SoundPracticeCard;
