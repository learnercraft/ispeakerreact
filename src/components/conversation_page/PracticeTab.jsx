import { useEffect, useRef, useState } from "react";
import {
    BsFloppy,
    BsPlayCircle,
    BsRecordCircle,
    BsStopCircle,
    BsTrash,
    BsFillMicFill,
} from "react-icons/bs";
import PropTypes from "prop-types";

import { useTranslation } from "react-i18next";
import {
    checkRecordingExists,
    openDatabase,
    playRecording,
    saveRecording,
} from "../../utils/databaseOperations";
import { isElectron } from "../../utils/isElectron";
import {
    sonnerErrorToast,
    sonnerSuccessToast,
    sonnerWarningToast,
} from "../../utils/sonnerCustomToast";

const PracticeTab = ({ accent, conversationId, dialog = [] }) => {
    const { t } = useTranslation();

    // Role play state
    const [rolePlayPart, setRolePlayPart] = useState(1); // 1 or 2
    const [userRecordings, setUserRecordings] = useState({}); // {index: blobUrl}
    const [userInputs, setUserInputs] = useState({}); // {index: {blankIndex: value}}
    const [recordingIndex, setRecordingIndex] = useState(null); // which line is being recorded
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isRecordingPlaying, setIsRecordingPlaying] = useState(false);
    const [recordingExists, setRecordingExists] = useState(false);
    const [currentAudioSource, setCurrentAudioSource] = useState(null); // For AudioContext source node
    const [currentAudioElement, setCurrentAudioElement] = useState(null); // For Audio element (fallback)
    const textAreaRef = useRef(null);

    // Existing practice state
    const [textValue, setTextValue] = useState("");

    const textKey = `${accent}-${conversationId}-text`;
    const recordingKey = `${accent}-conversation-${conversationId}`;

    // --- Role Play Logic ---
    // Helper: parse blanks from speech
    function parseBlanks(speech) {
        // Returns array of {before, blank, after, highlightNum}
        // Only supports one blank per highlight span
        const regex = /<span class="highlight-dialog-(\d+)">(.*?)<\/span>/g;
        let result = [];
        let lastIndex = 0;
        let match;
        let i = 0;
        while ((match = regex.exec(speech))) {
            const before = speech.slice(lastIndex, match.index);
            const blank = match[2];
            const highlightNum = match[1];
            lastIndex = regex.lastIndex;
            result.push({ before, blank, after: null, highlightNum, i });
            i++;
        }
        // Add trailing text
        if (result.length > 0) {
            result[result.length - 1].after = speech.slice(lastIndex);
        }
        return result.length > 0 ? result : null;
    }

    // --- Role Play Handlers ---
    // Recording for a specific dialog line
    const handleStartRecording = (index) => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const mr = new window.MediaRecorder(stream);
            let chunks = [];
            mr.ondataavailable = (e) => chunks.push(e.data);
            mr.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                setUserRecordings((prev) => ({ ...prev, [index]: url }));
                setRecordingIndex(null);
                setMediaRecorder(mr);
                mr.start();
            };
            setRecordingIndex(index);
            setMediaRecorder(mr);
            mr.start();
        });
    };
    const handleStopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    };
    const handlePlayUserRecording = (index) => {
        const url = userRecordings[index];
        if (url) {
            const audio = new Audio(url);
            audio.play();
        }
    };
    const handlePlayAudio = (audioSrc) => {
        if (!audioSrc) return;
        const url = `${import.meta.env.BASE_URL}media/conversation/mp3/roleplay/${audioSrc}.mp3`;
        const audio = new Audio(url);
        audio.play();
    };
    // Input for blanks
    const handleInputChange = (lineIdx, blankIdx, value) => {
        setUserInputs((prev) => ({
            ...prev,
            [lineIdx]: { ...prev[lineIdx], [blankIdx]: value },
        }));
    };

    // --- Existing PracticeTab logic (text/recording box) ---
    useEffect(() => {
        // Load saved text data if exists
        const loadText = async () => {
            const db = await openDatabase();
            const transaction = db.transaction(["conversation_data"]);
            const store = transaction.objectStore("conversation_data");
            const request = store.get(textKey);

            request.onsuccess = function () {
                if (request.result && request.result.text) {
                    setTextValue(request.result.text);
                }
            };
        };
        loadText();
    }, [textKey]);

    useEffect(() => {
        const checkIfRecordingExists = async () => {
            const exists = await checkRecordingExists(recordingKey);
            setRecordingExists(exists);
        };
        checkIfRecordingExists();
    }, [recordingKey]);

    const autoExpand = () => {
        const textArea = textAreaRef.current;
        if (textArea) {
            textArea.style.height = "auto";
            textArea.style.height = `${textArea.scrollHeight}px`;
        }
    };
    useEffect(() => {
        autoExpand();
    }, [textValue]);

    const handleSaveText = async () => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction(["conversation_data"], "readwrite");
            const store = transaction.objectStore("conversation_data");
            const request = store.put({ id: textKey, text: textValue });

            request.onsuccess = () => {
                sonnerSuccessToast(t("toast.textSaveSuccess"));
            };
            request.onerror = (error) => {
                isElectron() && window.electron.log("error", `Error saving text: ${error}`);
                sonnerErrorToast(t("toast.textSaveFailed") + error.message);
            };
        } catch (error) {
            console.error("Error saving text: ", error);
            isElectron() && window.electron.log("error", `Error saving text: ${error}`);
        }
    };
    const handleClearText = async () => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction(["conversation_data"], "readwrite");
            const store = transaction.objectStore("conversation_data");
            const request = store.delete(textKey);

            request.onsuccess = () => {
                setTextValue("");
                sonnerSuccessToast(t("toast.textClearSuccess"));
            };
            request.onerror = (error) => {
                sonnerErrorToast(t("toast.textClearFailed") + error.message);
                isElectron() && window.electron.log("error", `Error clearing text: ${error}`);
            };
        } catch (error) {
            console.error("Error clearing text: ", error);
            isElectron() && window.electron.log("error", `Error clearing text: ${error}`);
            sonnerErrorToast(t("toast.textClearFailed") + error.message);
        }
    };
    // Handle recording (existing)
    const handleRecording = () => {
        if (!isRecording) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    const recordOptions = {
                        audioBitsPerSecond: 128000,
                    };
                    const mediaRecorder = new MediaRecorder(stream, recordOptions);
                    let audioChunks = [];
                    mediaRecorder.start();
                    setIsRecording(true);
                    setMediaRecorder(mediaRecorder);

                    mediaRecorder.addEventListener("dataavailable", (event) => {
                        audioChunks.push(event.data);
                        if (mediaRecorder.state === "inactive") {
                            const audioBlob = new Blob(audioChunks, { type: event.data.type });
                            saveRecording(audioBlob, recordingKey, event.data.type);
                            sonnerSuccessToast(t("toast.recordingSuccess"));
                            isElectron() &&
                                window.electron.log("log", `Recording saved: ${recordingKey}`);

                            setRecordingExists(true);
                            audioChunks = [];
                        }
                    });

                    setTimeout(
                        () => {
                            if (mediaRecorder.state !== "inactive") {
                                mediaRecorder.stop();
                                sonnerWarningToast(t("toast.recordingExceeded"));
                                setIsRecording(false);
                            }
                        },
                        15 * 60 * 1000
                    );
                })
                .catch((error) => {
                    sonnerErrorToast(t("toast.recordingFailed") + error.message);
                    isElectron() && window.electron.log("error", `Recording failed: ${error}`);
                });
        } else {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };
    // Handle playback (existing)
    const handlePlayRecording = async () => {
        if (isRecordingPlaying) {
            if (currentAudioSource) {
                currentAudioSource.stop();
                setCurrentAudioSource(null);
            }
            if (currentAudioElement) {
                currentAudioElement.pause();
                currentAudioElement.currentTime = 0;
                setCurrentAudioElement(null);
            }
            setIsRecordingPlaying(false);
        } else {
            playRecording(
                recordingKey,
                (audio, audioSource) => {
                    setIsRecordingPlaying(true);
                    if (audioSource) {
                        setCurrentAudioSource(audioSource);
                    } else {
                        setCurrentAudioElement(audio);
                    }
                },
                (error) => {
                    sonnerErrorToast(t("toast.playbackError") + error.message);
                    isElectron() && window.electron.log("error", `Error saving text: ${error}`);
                    setIsRecordingPlaying(false);
                },
                () => {
                    setIsRecordingPlaying(false);
                    setCurrentAudioSource(null);
                    setCurrentAudioElement(null);
                }
            );
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 justify-center gap-4 md:grid-cols-2 lg:flex-nowrap">
                {/* Role Play Section */}
                <div className="card card-lg card-border flex shadow-2xs dark:border-slate-600">
                    <div className="card-body p-4">
                        <div className="mb-4 flex gap-2">
                            <button
                                className={`btn btn-sm ${rolePlayPart === 1 ? "btn-primary" : "btn-outline"}`}
                                onClick={() => setRolePlayPart(1)}
                            >
                                Part 1
                            </button>
                            <button
                                className={`btn btn-sm ${rolePlayPart === 2 ? "btn-primary" : "btn-outline"}`}
                                onClick={() => setRolePlayPart(2)}
                            >
                                Part 2
                            </button>
                        </div>
                        <div className="space-y-4">
                            {dialog.map((line, idx) => {
                                const isUserTurn =
                                    (rolePlayPart === 1 && idx % 2 === 1) ||
                                    (rolePlayPart === 2 && idx % 2 === 0);
                                const blanks = parseBlanks(line.speech);
                                return (
                                    <div key={idx} className="flex flex-wrap items-center gap-2">
                                        <div className="w-6 flex-shrink-0 font-bold">
                                            {line.speaker}:
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            {/* Render speech with blanks as input only for user part */}
                                            {blanks ? (
                                                blanks.map((b, bIdx) => (
                                                    <span key={bIdx}>
                                                        {b.before && (
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: b.before,
                                                                }}
                                                            />
                                                        )}
                                                        {isUserTurn ? (
                                                            <input
                                                                type="text"
                                                                className="input mx-1"
                                                                style={{
                                                                    width: Math.max(
                                                                        60,
                                                                        b.blank.length * 10
                                                                    ),
                                                                }}
                                                                value={
                                                                    userInputs[idx]?.[bIdx] || ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        idx,
                                                                        bIdx,
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            <span>{b.blank}</span>
                                                        )}
                                                        {bIdx === blanks.length - 1 && b.after && (
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: b.after,
                                                                }}
                                                            />
                                                        )}
                                                    </span>
                                                ))
                                            ) : (
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: line.speech,
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="ms-auto flex flex-col items-end justify-end gap-1 sm:flex-row sm:items-center">
                                            {isUserTurn ? (
                                                <>
                                                    {recordingIndex === idx ? (
                                                        <button
                                                            className="btn btn-xs btn-error"
                                                            onClick={handleStopRecording}
                                                        >
                                                            <BsStopCircle /> Stop
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-xs btn-accent"
                                                            onClick={() =>
                                                                handleStartRecording(idx)
                                                            }
                                                        >
                                                            <BsFillMicFill /> Record
                                                        </button>
                                                    )}
                                                    {userRecordings[idx] && (
                                                        <button
                                                            className="btn btn-xs btn-info"
                                                            onClick={() =>
                                                                handlePlayUserRecording(idx)
                                                            }
                                                        >
                                                            <BsPlayCircle /> Play
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                line.audioSrc && (
                                                    <button
                                                        className="btn btn-xs btn-primary"
                                                        onClick={() =>
                                                            handlePlayAudio(line.audioSrc)
                                                        }
                                                    >
                                                        <BsPlayCircle /> Play
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Existing free practice section */}
                <div className="card card-lg card-border flex shadow-2xs dark:border-slate-600">
                    <div className="card-body p-4">
                        {t("tabConversationExam.practiceConversationText", {
                            returnObjects: true,
                        }).map((text, index) => (
                            <p className="mb-2" key={index}>
                                {text}
                            </p>
                        ))}

                        <fieldset className="fieldset my-4">
                            <legend className="fieldset-legend text-sm">
                                {t("tabConversationExam.practiceConversationBox")}
                            </legend>
                            <textarea
                                className="textarea w-full text-base"
                                ref={textAreaRef}
                                value={textValue}
                                onChange={(e) => setTextValue(e.target.value)}
                                onInput={autoExpand}
                            ></textarea>
                        </fieldset>

                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSaveText}
                                disabled={!textValue}
                            >
                                <BsFloppy className="h-5 w-5" />{" "}
                                {t("buttonConversationExam.saveBtn")}
                            </button>
                            <button
                                type="button"
                                className="btn btn-error"
                                onClick={handleClearText}
                                disabled={!textValue}
                            >
                                <BsTrash className="h-5 w-5" />{" "}
                                {t("buttonConversationExam.clearBtn")}
                            </button>
                        </div>

                        <div className="divider"></div>

                        <div className="mt-4">
                            <p className="mb-4">{t("tabConversationExam.recordSectionText")}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleRecording}
                                    disabled={isRecordingPlaying}
                                >
                                    {isRecording ? (
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
                                    className="btn btn-accent"
                                    onClick={handlePlayRecording}
                                    disabled={!recordingExists || isRecording}
                                >
                                    {isRecordingPlaying ? (
                                        <>
                                            <BsStopCircle className="h-5 w-5" />{" "}
                                            {t("buttonConversationExam.stopPlayBtn")}
                                        </>
                                    ) : (
                                        <>
                                            <BsPlayCircle className="h-5 w-5" />{" "}
                                            {t("buttonConversationExam.playBtn")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

PracticeTab.propTypes = {
    accent: PropTypes.string.isRequired,
    conversationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dialog: PropTypes.array,
};

export default PracticeTab;
