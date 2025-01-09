import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsPauseFill, BsPlayFill, BsRecordFill, BsStopFill } from "react-icons/bs";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record";
import { checkRecordingExists, openDatabase, saveRecording } from "../../utils/databaseOperations";
import { sonnerErrorToast, sonnerSuccessToast } from "../../utils/sonnerCustomToast";
import { useTheme } from "../../utils/ThemeContext/useTheme";
import useWaveformTheme from "./useWaveformTheme";

const getSupportedMimeType = () => {
    const mimeTypes = ["audio/webm", "audio/ogg", "audio/wav", "audio/mpeg"];

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
    t,
}) => {
    const { theme } = useTheme();

    const waveformRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [recordedUrl, setRecordedUrl] = useState(null);
    const [wavesurfer, setWaveSurfer] = useState(null);
    const [recordPlugin, setRecordPlugin] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [, setRecordingTime] = useState(0);
    const recordingInterval = useRef(null);

    const waveformLight = "hsl(224.3 76.3% 48%)"; // Light mode waveform color
    const waveformDark = "hsl(213.1 93.9% 67.8%)"; // Dark mode waveform color
    const progressLight = "hsl(83.7 80.5% 44.3%)"; // Light mode progress color
    const progressDark = "hsl(82 84.5% 67.1%)"; // Dark mode progress color
    const cursorLight = "hsl(83.7 80.5% 44.3%)"; // Dark mode progress color
    const cursorDark = "hsl(82 84.5% 67.1%)"; // Dark mode progress color

    const { waveformColor, progressColor, cursorColor } = useWaveformTheme(
        theme,
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
            } else {
                console.log(`No recording found for key: ${wordKey}`);
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
        });

        return () => {
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
                setRecording(true);
                setRecordedUrl(null); // Clear previously recorded URL
                setRecordingTime(0); // Reset the recording time

                if (wavesurfer) {
                    wavesurfer.empty(); // Clear waveform for live input
                }

                //recordPlugin.renderMicStream();
                recordPlugin.startMic() && recordPlugin.startRecording(); // Start recording

                recordingInterval.current = setInterval(() => {
                    setRecordingTime((prevTime) => {
                        if (prevTime >= maxDuration) {
                            console.log("Max recording duration reached. Stopping...");
                            recordPlugin.stopRecording();
                            setRecording(false);
                            clearInterval(recordingInterval.current);
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

            <div className="flex w-full place-items-center justify-center space-x-4">
                <button
                    type="button"
                    id="record"
                    title={
                        recording
                            ? t("buttonConversationExam.stopRecordBtn")
                            : t("buttonConversationExam.recordBtn")
                    }
                    className="btn btn-circle btn-accent"
                    onClick={handleRecordClick}
                    disabled={disableControls || isPlaying}
                >
                    {recording ? (
                        <BsStopFill className="h-6 w-6" />
                    ) : (
                        <BsRecordFill className="h-6 w-6" />
                    )}
                </button>

                <button
                    type="button"
                    id="play"
                    className="btn btn-circle btn-primary"
                    onClick={handlePlayPause}
                    disabled={!recordedUrl || disableControls}
                    title={
                        wavesurfer?.isPlaying()
                            ? t("wordPage.pauseRecordingBtn")
                            : t("buttonConversationExam.playBtn")
                    }
                >
                    {wavesurfer?.isPlaying() ? (
                        <BsPauseFill className="h-6 w-6" />
                    ) : (
                        <BsPlayFill className="h-6 w-6" />
                    )}
                </button>
            </div>

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
};

export default RecordingWaveform;
