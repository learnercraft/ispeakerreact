import { useEffect, useRef, useState } from "react";
import { BsFloppy, BsPlayCircle, BsRecordCircle, BsStopCircle, BsTrash } from "react-icons/bs";
import PropTypes from "prop-types";

import { useTranslation } from "react-i18next";
import {
    checkRecordingExists,
    openDatabase,
    playRecording,
    saveRecording,
} from "../../utils/databaseOperations";
import isElectron from "../../utils/isElectron";
import {
    sonnerErrorToast,
    sonnerSuccessToast,
    sonnerWarningToast,
} from "../../utils/sonnerCustomToast";

const PracticeTab = ({ accent, conversationId, dialog = [] }) => {
    const { t } = useTranslation();

    // Role play state
    const [rolePlayPart, setRolePlayPart] = useState(1); // 1 or 2
    const [userInputs, setUserInputs] = useState({}); // {index: {blankIndex: value}}
    const [mediaRecorderFree, setMediaRecorderFree] = useState(null);
    const [isRecordingFree, setIsRecordingFree] = useState(false);
    const textAreaRef = useRef(null);

    // Existing practice state
    const [textValue, setTextValue] = useState("");

    const textKey = `${accent}-${conversationId}-text`;

    // Add this for roleplay recorder state:
    const [mediaRecorderRoleplay, setMediaRecorderRoleplay] = useState(null);

    // Add state for recording streams
    const [mediaStreamFree, setMediaStreamFree] = useState(null);
    const [mediaStreamRoleplay, setMediaStreamRoleplay] = useState(null);

    // --- Centralized Playback State ---
    const audioRef = useRef(null);
    const sourceRef = useRef(null);
    const [playback, setPlayback] = useState({ type: null, index: null, playing: false });

    const [recordingExists, setRecordingExists] = useState(false);

    // --- Non-user-turn audio playback state ---
    const [nonUserAudioIndex, setNonUserAudioIndex] = useState(null);
    const nonUserAudioRef = useRef(null);

    function stopNonUserAudio() {
        if (nonUserAudioRef.current) {
            try {
                nonUserAudioRef.current.pause();
                nonUserAudioRef.current.currentTime = 0;
            } catch {
                /* ignore */
            }
            nonUserAudioRef.current = null;
        }
        setNonUserAudioIndex(null);
    }

    function stopAllPlayback() {
        if (audioRef.current) {
            try {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            } catch {
                /* ignore */
            }
            audioRef.current = null;
        }
        if (sourceRef.current) {
            try {
                sourceRef.current.stop();
            } catch {
                /* ignore */
            }
            sourceRef.current = null;
        }
        setPlayback({ type: null, index: null, playing: false });
        stopNonUserAudio();
    }

    function playRoleplayRecording(idx, key) {
        stopAllPlayback();
        setPlayback({ type: "roleplay", index: idx, playing: true });
        playRecording(
            key,
            (audio, audioSource) => {
                if (audioSource) sourceRef.current = audioSource;
                else audioRef.current = audio;
            },
            () => stopAllPlayback(),
            () => stopAllPlayback()
        );
    }

    function playFreePracticeRecording(key) {
        stopAllPlayback();
        setPlayback({ type: "free", index: null, playing: true });
        playRecording(
            key,
            (audio, audioSource) => {
                if (audioSource) sourceRef.current = audioSource;
                else audioRef.current = audio;
            },
            () => stopAllPlayback(),
            () => stopAllPlayback()
        );
    }

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

            request.onsuccess = () => {
                if (request.result && request.result.text) {
                    setTextValue(request.result.text);
                }
            };
        };
        loadText();
    }, [textKey]);

    useEffect(() => {
        const checkRoleplayRecordings = async () => {
            const existsObj = {};
            for (let idx = 0; idx < dialog.length; idx++) {
                // Only check for user-turn lines
                const isUserTurn =
                    (rolePlayPart === 1 && idx % 2 === 1) || (rolePlayPart === 2 && idx % 2 === 0);
                if (isUserTurn) {
                    const key = `${accent}-conversation-${conversationId}-roleplay-part${rolePlayPart}-index${idx}`;
                    existsObj[idx] = await checkRecordingExists(key);
                }
            }
            setRoleplayRecordingExists(existsObj);
        };
        checkRoleplayRecordings();
    }, [rolePlayPart, accent, conversationId, dialog.length]);

    useEffect(() => {
        const checkIfRecordingExists = async () => {
            const freePracticeKey = `${accent}-conversation-${conversationId}-freePractice`;
            const exists = await checkRecordingExists(freePracticeKey);
            setRecordingExists(exists);
        };
        checkIfRecordingExists();
    }, [accent, conversationId]);

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

    // --- Recording Logic (Reusable) ---
    const startRecordingWithKey = (
        recordingKey,
        setMediaRecorderFn,
        setIsRecordingFn,
        setMediaStreamFn,
        onSaved
    ) => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const recordOptions = {
                    audioBitsPerSecond: 128000,
                };
                const mediaRecorder = new MediaRecorder(stream, recordOptions);
                let audioChunks = [];
                mediaRecorder.start();
                setIsRecordingFn(true);
                setMediaRecorderFn(mediaRecorder);
                setMediaStreamFn(stream);

                mediaRecorder.addEventListener("dataavailable", (event) => {
                    audioChunks.push(event.data);
                    if (mediaRecorder.state === "inactive") {
                        const audioBlob = new Blob(audioChunks, { type: event.data.type });
                        saveRecording(audioBlob, recordingKey, event.data.type);
                        sonnerSuccessToast(t("toast.recordingSuccess"));
                        isElectron() &&
                            window.electron.log("log", `Recording saved: ${recordingKey}`);
                        if (onSaved) onSaved();
                        audioChunks = [];
                    }
                });

                setTimeout(
                    () => {
                        if (mediaRecorder.state !== "inactive") {
                            mediaRecorder.stop();
                            stream.getTracks().forEach((track) => track.stop());
                            setIsRecordingFn(false);
                            setMediaStreamFn(null);
                        }
                    },
                    15 * 60 * 1000
                );
            })
            .catch((error) => {
                sonnerErrorToast(t("toast.recordingFailed") + error.message);
                isElectron() && window.electron.log("error", `Recording failed: ${error}`);
            });
    };

    // --- Free Practice Recording ---
    const handleRecording = () => {
        const freePracticeKey = `${accent}-conversation-${conversationId}-freePractice`;
        if (!isRecordingFree) {
            startRecordingWithKey(
                freePracticeKey,
                setMediaRecorderFree,
                setIsRecordingFree,
                setMediaStreamFree,
                () => setRecordingExists(true)
            );
        } else if (mediaRecorderFree) {
            mediaRecorderFree.stop();
            if (mediaStreamFree) {
                mediaStreamFree.getTracks().forEach((track) => track.stop());
                setMediaStreamFree(null);
            }
            setIsRecordingFree(false);
        }
    };

    // --- Roleplay Recording ---
    const [roleplayRecordingIndex, setRoleplayRecordingIndex] = useState(null);
    const [roleplayIsRecording, setIsRecordingRoleplay] = useState(false);
    const [roleplayRecordingExists, setRoleplayRecordingExists] = useState({});

    const handleRoleplayStartRecording = (idx) => {
        const key = `${accent}-conversation-${conversationId}-roleplay-part${rolePlayPart}-index${idx}`;
        setRoleplayRecordingIndex(idx);
        setIsRecordingRoleplay(true);
        startRecordingWithKey(
            key,
            setMediaRecorderRoleplay,
            setIsRecordingRoleplay,
            setMediaStreamRoleplay,
            async () => {
                setIsRecordingRoleplay(false);
                setRoleplayRecordingIndex(null);
                setRoleplayRecordingExists((prev) => ({ ...prev, [idx]: true }));
                if (mediaStreamRoleplay) {
                    mediaStreamRoleplay.getTracks().forEach((track) => track.stop());
                    setMediaStreamRoleplay(null);
                }
            }
        );
    };
    const handleRoleplayStopRecording = () => {
        if (mediaRecorderRoleplay) {
            mediaRecorderRoleplay.stop();
            if (mediaStreamRoleplay) {
                mediaStreamRoleplay.getTracks().forEach((track) => track.stop());
                setMediaStreamRoleplay(null);
            }
            setIsRecordingRoleplay(false);
            setRoleplayRecordingIndex(null);
        }
    };
    const handleRoleplayPlayRecording = (idx) => {
        const key = `${accent}-conversation-${conversationId}-roleplay-part${rolePlayPart}-index${idx}`;
        if (playback.playing && playback.type === "roleplay" && playback.index === idx) {
            stopAllPlayback();
            return;
        }
        playRoleplayRecording(idx, key);
    };

    // Play audio for audio part
    const handlePlayAudio = (audioSrc, idx) => {
        if (nonUserAudioIndex === idx) {
            stopNonUserAudio();
            return;
        }
        stopNonUserAudio();
        if (!audioSrc) return;
        const url = `${import.meta.env.BASE_URL}media/conversation/mp3/roleplay/${audioSrc}.mp3`;
        const audio = new Audio(url);
        nonUserAudioRef.current = audio;
        setNonUserAudioIndex(idx);
        audio.onended = stopNonUserAudio;
        audio.onerror = stopNonUserAudio;
        audio.play();
    };

    // --- Free Practice Play/Stop Button Logic ---
    const handlePlayRecording = async () => {
        const freePracticeKey = `${accent}-conversation-${conversationId}-freePractice`;
        if (playback.playing && playback.type === "free") {
            stopAllPlayback();
        } else {
            playFreePracticeRecording(freePracticeKey);
        }
    };

    // --- Cleanup on unmount/part change ---
    useEffect(() => {
        return () => {
            stopAllPlayback();
            stopNonUserAudio();
            // Cleanup recording streams
            if (mediaStreamFree) {
                mediaStreamFree.getTracks().forEach((track) => track.stop());
                setMediaStreamFree(null);
            }
            if (mediaStreamRoleplay) {
                mediaStreamRoleplay.getTracks().forEach((track) => track.stop());
                setMediaStreamRoleplay(null);
            }
            // Stop any active recorders
            if (mediaRecorderFree && mediaRecorderFree.state !== "inactive") {
                mediaRecorderFree.stop();
            }
            if (mediaRecorderRoleplay && mediaRecorderRoleplay.state !== "inactive") {
                mediaRecorderRoleplay.stop();
            }
        };
    }, []);

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
                                            {isUserTurn ? (
                                                <>
                                                    <textarea
                                                        className="textarea textarea-bordered min-h-[2.5rem] w-full"
                                                        value={userInputs[idx]?.[0] || ""}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                idx,
                                                                0,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <div className="mt-1 flex gap-1">
                                                        {roleplayRecordingIndex === idx &&
                                                        roleplayIsRecording ? (
                                                            <button
                                                                className="btn btn-xs btn-error"
                                                                onClick={
                                                                    handleRoleplayStopRecording
                                                                }
                                                                disabled={
                                                                    playback.playing &&
                                                                    playback.type === "roleplay" &&
                                                                    playback.index === idx
                                                                }
                                                            >
                                                                <BsStopCircle /> Stop
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn btn-xs btn-accent"
                                                                onClick={() =>
                                                                    handleRoleplayStartRecording(
                                                                        idx
                                                                    )
                                                                }
                                                                disabled={
                                                                    playback.playing &&
                                                                    playback.type === "roleplay" &&
                                                                    playback.index === idx
                                                                }
                                                            >
                                                                <BsRecordCircle /> Record
                                                            </button>
                                                        )}
                                                        {playback.playing &&
                                                        playback.type === "roleplay" &&
                                                        playback.index === idx ? (
                                                            <button
                                                                className="btn btn-xs btn-info"
                                                                onClick={stopAllPlayback}
                                                                disabled={
                                                                    roleplayIsRecording ||
                                                                    !roleplayRecordingExists[idx]
                                                                }
                                                            >
                                                                <BsStopCircle /> Stop
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn btn-xs btn-info"
                                                                onClick={() =>
                                                                    handleRoleplayPlayRecording(idx)
                                                                }
                                                                disabled={
                                                                    roleplayIsRecording ||
                                                                    !roleplayRecordingExists[idx]
                                                                }
                                                            >
                                                                <BsPlayCircle /> Play
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            ) : blanks ? (
                                                blanks.map((b, bIdx) => (
                                                    <span key={bIdx}>
                                                        {b.before && (
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: b.before,
                                                                }}
                                                            />
                                                        )}
                                                        <span>{b.blank}</span>
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
                                            {isUserTurn
                                                ? null
                                                : line.audioSrc &&
                                                  (nonUserAudioIndex === idx ? (
                                                      <button
                                                          className="btn btn-xs btn-primary"
                                                          onClick={() =>
                                                              handlePlayAudio(line.audioSrc, idx)
                                                          }
                                                      >
                                                          <BsStopCircle /> Stop
                                                      </button>
                                                  ) : (
                                                      <button
                                                          className="btn btn-xs btn-primary"
                                                          onClick={() =>
                                                              handlePlayAudio(line.audioSrc, idx)
                                                          }
                                                      >
                                                          <BsPlayCircle /> Play
                                                      </button>
                                                  ))}
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
                                    disabled={playback.playing && playback.type === "free"}
                                >
                                    {isRecordingFree ? (
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
                                    disabled={!recordingExists || isRecordingFree}
                                >
                                    {playback.playing && playback.type === "free" ? (
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
