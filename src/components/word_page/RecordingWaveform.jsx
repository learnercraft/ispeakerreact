import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    BsPauseCircle,
    BsPlayCircle,
    BsRecordCircle,
    BsStopCircle,
    BsClipboard2Check,
} from "react-icons/bs";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record";
import {
    checkRecordingExists,
    openDatabase,
    playRecording,
    saveRecording,
} from "../../utils/databaseOperations";
import isElectron from "../../utils/isElectron";
import { sonnerErrorToast, sonnerSuccessToast } from "../../utils/sonnerCustomToast";
import useWaveformTheme from "./useWaveformTheme";
import PronunciationChecker from "./PronunciationChecker";

const getSupportedMimeType = () => {
    const mimeTypes = ["audio/webm", "audio/ogg", "audio/wav", "audio/mpeg", "audio/mp4"];

    for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }

    console.warn("No supported MIME type found. Defaulting to 'audio/wav'.");
    return "audio/wav"; // Fallback
};

const RecordingWaveform = ({
    wordKey,
    maxDuration,
    disableControls = false,
    onActivityChange = null,
    onRecordingSaved = null,
    isAudioLoading = false,
    displayPronunciation,
    t,
}) => {
    const waveformRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [recordedUrl, setRecordedUrl] = useState(null);
    const [wavesurfer, setWaveSurfer] = useState(null);
    const [recordPlugin, setRecordPlugin] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [, setRecordingTime] = useState(0);
    const recordingInterval = useRef(null);
    const [pronunciationLoading, setPronunciationLoading] = useState(false);

    const waveformLight = "hsl(224.3 76.3% 48%)"; // Light mode waveform color
    const waveformDark = "hsl(213.1 93.9% 67.8%)"; // Dark mode waveform color
    const progressLight = "hsl(83.7 80.5% 44.3%)"; // Light mode progress color
    const progressDark = "hsl(82 84.5% 67.1%)"; // Dark mode progress color
    const cursorLight = "hsl(83.7 80.5% 44.3%)"; // Dark mode progress color
    const cursorDark = "hsl(82 84.5% 67.1%)"; // Dark mode progress color

    const { waveformColor, progressColor, cursorColor } = useWaveformTheme(
        waveformLight,
        waveformDark,
        progressLight,
        progressDark,
        cursorLight,
        cursorDark
    );

    const notifyActivityChange = useCallback(
        (isActive) => {
            if (onActivityChange) {
                onActivityChange(isActive);
            }
        },
        [onActivityChange]
    );

    useEffect(() => {
        const wavesurferInstance = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: waveformColor,
            progressColor: progressColor,
            cursorColor: cursorColor,
            height: 80,
            cursorWidth: 2,
            autoScroll: true,
            hideScrollbar: true,
        });

        setWaveSurfer(wavesurferInstance);

        const getMimeType = getSupportedMimeType();
        // console.log("Using MIME type:", mimeType);

        const recordPluginInstance = RecordPlugin.create({
            renderRecordedAudio: true,
            continuousWaveform: true,
            continuousWaveformDuration: maxDuration,
            mimeType: getMimeType,
        });
        setRecordPlugin(recordPluginInstance);

        wavesurferInstance.registerPlugin(recordPluginInstance);

        recordPluginInstance.on("record-end", async (blob) => {
            const recordedUrl = URL.createObjectURL(blob);
            setRecordedUrl(recordedUrl);
            setTimeout(() => {
                wavesurferInstance.empty(); // Clear previous waveform
                wavesurferInstance.load(recordedUrl); // Load recorded audio
            }, 100); // Slight delay to ensure blob readiness

            try {
                await saveRecording(blob, wordKey, getMimeType);
                console.log("Recording saved successfully");
                if (onRecordingSaved) {
                    onRecordingSaved(); // Notify the parent
                }
                notifyActivityChange(false);
                sonnerSuccessToast(t("toast.recordingSuccess"));
            } catch (error) {
                console.error("Error saving recording:", error);
                sonnerErrorToast(`${t("toast.recordingFailed")} ${error.message}`);
            }
        });

        const loadExistingRecording = async () => {
            const exists = await checkRecordingExists(wordKey);
            if (exists) {
                if (isElectron()) {
                    await playRecording(
                        wordKey,
                        async (audio) => {
                            if (audio) {
                                const url = audio.src;
                                setRecordedUrl(url);
                                wavesurferInstance.load(url);
                                audio.pause(); // Pause the audio immediately after loading
                                audio.currentTime = 0;
                            }
                        },
                        (error) => {
                            console.error("Playback error:", error);
                            sonnerErrorToast(`${t("toast.playbackError")} ${error.message}`);
                        },
                        () => {
                            // console.log("Playback finished");
                            //notifyActivityChange(false);
                        }
                    );
                } else {
                    console.log(`Recording found for key: ${wordKey}`);
                    const db = await openDatabase();
                    const transaction = db.transaction(["recording_data"], "readonly");
                    const store = transaction.objectStore("recording_data");
                    const request = store.get(wordKey);

                    request.onsuccess = () => {
                        if (request.result) {
                            const { recording, mimeType } = request.result;
                            const blob = new Blob([recording], { type: mimeType });
                            const url = URL.createObjectURL(blob);
                            setRecordedUrl(url);
                            wavesurferInstance.load(url);
                        } else {
                            console.log(`No data found for key: ${wordKey}`);
                        }
                    };
                }
            }
        };

        loadExistingRecording();

        wavesurferInstance.on("play", () => {
            setIsPlaying(true);
        });

        wavesurferInstance.on("pause", () => {
            setIsPlaying(false);
        });

        wavesurferInstance.on("finish", () => {
            setIsPlaying(false);
            notifyActivityChange(false); // Notify parent when playback ends
            wavesurferInstance.seekTo(0);
        });

        return () => {
            if (recordingInterval) clearInterval(recordingInterval.current);

            if (wavesurferInstance) {
                wavesurferInstance.unAll();
                wavesurferInstance.destroy();
            }
        };
    }, [
        notifyActivityChange,
        onRecordingSaved,
        wordKey,
        maxDuration,
        cursorColor,
        progressColor,
        waveformColor,
        t,
    ]);

    const handleRecordClick = () => {
        if (recordPlugin) {
            if (recording) {
                recordPlugin.stopRecording(); // Stop recording
                setRecording(false);
                clearInterval(recordingInterval.current); // Clear the interval
            } else {
                if (wavesurfer) {
                    wavesurfer.empty(); // Clear waveform for live input
                }

                setRecordedUrl(null); // Clear previously recorded URL
                setRecordingTime(0); // Reset the recording time

                recordPlugin.startRecording(); // Start recording
                setRecording(true);

                recordingInterval.current = setInterval(() => {
                    setRecordingTime((prevTime) => {
                        if (prevTime >= maxDuration) {
                            console.log("Max recording duration reached. Stopping...");
                            recordPlugin.stopRecording();
                            setRecording(false);
                            clearInterval(recordingInterval.current);
                            setRecordingTime(0);
                            return prevTime;
                        }
                        return prevTime + 1;
                    });
                }, 1000);
            }
        }
    };

    const handlePlayPause = () => {
        if (wavesurfer) {
            try {
                wavesurfer.playPause();
            } catch (error) {
                console.error("Playback error:", error);
                sonnerErrorToast(`${t("toast.playbackError")} ${error.message}`);
            }
        }
    };

    return (
        <div className="my-4">
            <div className="mb-4 w-full">
                <div
                    ref={waveformRef}
                    className={`waveform-container ${recording ? "recording" : ""}`}
                ></div>
            </div>

            <div className="flex w-full flex-wrap place-items-center justify-center gap-4 md:gap-2">
                <button
                    type="button"
                    id="record"
                    className="btn btn-accent"
                    onClick={handleRecordClick}
                    disabled={
                        disableControls || isPlaying || isAudioLoading || pronunciationLoading
                    }
                >
                    {recording ? (
                        <>
                            <BsStopCircle className="h-5 w-5" />{" "}
                            {t("buttonConversationExam.stopRecordBtn")}
                        </>
                    ) : (
                        <>
                            <BsRecordCircle className="h-5 w-5" />{" "}
                            {t("buttonConversationExam.recordBtn")}
                        </>
                    )}
                </button>

                <button
                    type="button"
                    id="play"
                    className="btn btn-primary"
                    onClick={handlePlayPause}
                    disabled={!recordedUrl || disableControls || isAudioLoading}
                >
                    {wavesurfer?.isPlaying() ? (
                        <>
                            <BsPauseCircle className="h-5 w-5" /> {t("wordPage.pauseRecordingBtn")}
                        </>
                    ) : (
                        <>
                            <BsPlayCircle className="h-5 w-5" />{" "}
                            {t("buttonConversationExam.playBtn")}
                        </>
                    )}
                </button>
            </div>

            <PronunciationChecker
                disabled={!recordedUrl || disableControls || isAudioLoading}
                icon={<BsClipboard2Check className="h-5 w-5" />}
                wordKey={wordKey}
                displayPronunciation={displayPronunciation}
                onLoadingChange={setPronunciationLoading}
            />

            {/*recordedUrl && (
                <a
                    href={recordedUrl}
                    download="recording.webm"
                    style={{ display: "block", marginTop: "1rem" }}
                >
                    Download recording
                </a>
            )*/}
        </div>
    );
};

RecordingWaveform.propTypes = {
    wordKey: PropTypes.string.isRequired,
    maxDuration: PropTypes.number.isRequired,
    disableControls: PropTypes.bool,
    onActivityChange: PropTypes.func,
    t: PropTypes.func.isRequired,
    onRecordingSaved: PropTypes.func,
    isAudioLoading: PropTypes.bool,
    displayPronunciation: PropTypes.string,
};

export default RecordingWaveform;
