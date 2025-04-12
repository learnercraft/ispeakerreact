import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { saveRecording } from "../../../utils/databaseOperations";
import { isElectron } from "../../../utils/isElectron";
import {
    sonnerErrorToast,
    sonnerSuccessToast,
    sonnerWarningToast,
} from "../../../utils/sonnerCustomToast";

export function useRecordingFunction(
    activeRecordingCard,
    setActiveRecordingCard,
    setIsRecording,
    setMediaRecorder,
    setRecordingAvailability,
    isRecording,
    mediaRecorder,
    sound,
    accent,
    recordingAvailability,
    playingRecordings
) {
    const { t } = useTranslation();
    const MAX_RECORDING_DURATION_MS = 20 * 1000; // 20 seconds in milliseconds

    const getRecordingKey = useCallback(
        (cardIndex) => {
            return `${accent}-${sound.type}${sound.id}_${cardIndex}`;
        },
        [sound.type, sound.id, accent]
    );

    const handleRecording = useCallback(
        (cardIndex) => {
            const recordingDataIndex = getRecordingKey(cardIndex);
            // Determine if a recording is starting or stopping
            if (activeRecordingCard !== cardIndex) {
                setActiveRecordingCard(cardIndex);
                // Start the recording process
                navigator.mediaDevices
                    .getUserMedia({ audio: true })
                    .then((stream) => {
                        const recordOptions = {
                            audioBitsPerSecond: 128000,
                        };
                        const mediaRecorder = new MediaRecorder(stream, recordOptions);
                        let audioChunks = [];
                        let mimeType = "";
                        let recordingStartTime = Date.now();

                        mediaRecorder.start();
                        setIsRecording(true);
                        setMediaRecorder(mediaRecorder);
                        setActiveRecordingCard(cardIndex);

                        mediaRecorder.addEventListener("dataavailable", (event) => {
                            audioChunks.push(event.data);

                            if (!mimeType && event.data && event.data.type) {
                                mimeType = event.data.type;
                                console.log("Captured MIME type:", mimeType);
                            }

                            // Check if the recording duration exceeds the time limit
                            const recordingDuration = Date.now() - recordingStartTime;
                            if (recordingDuration > MAX_RECORDING_DURATION_MS) {
                                mediaRecorder.stop();
                                sonnerWarningToast(t("toast.recordingExceeded"));
                                setIsRecording(false);
                                setActiveRecordingCard(null);
                            }

                            if (mediaRecorder.state === "inactive") {
                                const audioBlob = new Blob(audioChunks, { type: mimeType });
                                saveRecording(audioBlob, recordingDataIndex, mimeType);
                                sonnerSuccessToast(t("toast.recordingSuccess"));
                                setRecordingAvailability((prev) => ({
                                    ...prev,
                                    [recordingDataIndex]: true,
                                }));
                                audioChunks = [];
                            }
                        });

                        // Automatically stop recording after 10 minutes if not already stopped
                        setTimeout(() => {
                            if (mediaRecorder.state !== "inactive") {
                                mediaRecorder.stop();
                                sonnerWarningToast(t("toast.recordingExceeded"));
                                setIsRecording(false);
                                setActiveRecordingCard(null);
                            }
                        }, MAX_RECORDING_DURATION_MS);
                    })
                    .catch((err) => {
                        console.error("Error accessing the microphone.", err);
                        isElectron() &&
                            window.electron.log("error", `Error accessing the microphone: ${err}`);
                        sonnerErrorToast(`${t("toast.recordingFailed")} ${err.message}`);
                        setIsRecording(false);
                        setActiveRecordingCard(null);
                    });
            } else {
                // Stop recording if this cardIndex was already recording
                setActiveRecordingCard(null);
                // Stop the recording process
                if (isRecording) {
                    if (mediaRecorder) {
                        mediaRecorder.stop();
                        setIsRecording(false);
                        setActiveRecordingCard(null);
                    }
                }
            }
        },
        [
            MAX_RECORDING_DURATION_MS,
            activeRecordingCard,
            getRecordingKey,
            isRecording,
            mediaRecorder,
            setActiveRecordingCard,
            setIsRecording,
            setMediaRecorder,
            setRecordingAvailability,
            t,
        ]
    );

    const isRecordingAvailable = useCallback(
        (cardIndex) => {
            const recordingKey = getRecordingKey(cardIndex);
            return recordingAvailability[recordingKey];
        },
        [getRecordingKey, recordingAvailability]
    );

    const isRecordingPlayingActive = useCallback(
        (cardIndex) => {
            const recordingKey = getRecordingKey(cardIndex);
            return !!playingRecordings[recordingKey];
        },
        [getRecordingKey, playingRecordings]
    );

    return { getRecordingKey, isRecordingPlayingActive, isRecordingAvailable, handleRecording };
}
