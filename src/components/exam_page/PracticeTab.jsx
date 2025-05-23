import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsFloppy, BsPlayCircle, BsRecordCircle, BsStopCircle, BsTrash } from "react-icons/bs";
import { IoCheckmark, IoCloseOutline } from "react-icons/io5";
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

const PracticeTab = ({ accent, examId, taskData, tips }) => {
    const { t } = useTranslation();

    const [textValues, setTextValues] = useState(() => taskData.map(() => ""));
    const [isRecording, setIsRecording] = useState(false);
    const [isRecordingPlaying, setIsRecordingPlaying] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordingExists, setRecordingExists] = useState(() => taskData.map(() => false));
    const [currentAudioSource, setCurrentAudioSource] = useState(null);
    const [currentAudioElement, setCurrentAudioElement] = useState(null);
    const [activeTaskIndex, setActiveTaskIndex] = useState(null);
    const textAreaRefs = useRef([]);
    const imageModalRef = useRef(null);

    const [imageLoading, setImageLoading] = useState(false);
    const [modalImage, setModalImage] = useState("");

    // Load saved text from IndexedDB
    useEffect(() => {
        const loadTextData = async () => {
            const db = await openDatabase();
            taskData.forEach(async (_, index) => {
                const textKey = `${accent}-${examId}-text-${index}`;
                const transaction = db.transaction(["exam_data"], "readonly");
                const store = transaction.objectStore("exam_data");
                const request = store.get(textKey);

                request.onsuccess = () => {
                    if (request.result && request.result.text) {
                        setTextValues((prev) => {
                            const updated = [...prev];
                            updated[index] = request.result.text;
                            return updated;
                        });
                    }
                };
            });
        };
        loadTextData();
    }, [accent, examId, taskData]);

    // Check if recordings exist in IndexedDB
    useEffect(() => {
        taskData.forEach(async (_, index) => {
            const recordingKey = `${accent}-exam-${examId}-${index}`;
            const exists = await checkRecordingExists(recordingKey);
            setRecordingExists((prev) => {
                const updated = [...prev];
                updated[index] = exists;
                return updated;
            });
        });
    }, [accent, examId, taskData]);

    // Auto-expand textarea
    const autoExpand = (e) => {
        const textArea = textAreaRefs.current[e.target.id];
        if (textArea) {
            textArea.style.height = "auto"; // Reset height to calculate new height
            textArea.style.height = `${textArea.scrollHeight}px`; // Set height to the new calculated height
        }
    };

    // Save text to IndexedDB
    const handleSaveText = async (index) => {
        const textKey = `${accent}-${examId}-text-${index}`;
        try {
            const db = await openDatabase();
            const transaction = db.transaction(["exam_data"], "readwrite");
            const store = transaction.objectStore("exam_data");
            const request = store.put({ id: textKey, text: textValues[index] });

            request.onsuccess = () => {
                sonnerSuccessToast(t("toast.textSaveSuccess"));
            };
            request.onerror = (error) => {
                console.error("Error saving text: ", error);
                isElectron() && window.electron.log("error", `Error saving text: ${error}`);
                sonnerErrorToast(t("toast.textSaveFailed") + error.message);
            };
        } catch (error) {
            console.error("Error saving text: ", error);
            isElectron() && window.electron.log("error", `Error saving text: ${error}`);
        }
    };

    // Clear text from IndexedDB
    const handleClearText = async (index) => {
        const textKey = `${accent}-${examId}-text-${index}`;
        try {
            const db = await openDatabase();
            const transaction = db.transaction(["exam_data"], "readwrite");
            const store = transaction.objectStore("exam_data");
            const request = store.delete(textKey);

            request.onsuccess = () => {
                setTextValues((prev) => {
                    const updated = [...prev];
                    updated[index] = "";
                    return updated;
                });
                console.log("Text cleared successfully.");
                sonnerSuccessToast(t("toast.textClearSuccess"));
            };
            request.onerror = (error) => {
                console.error("Error clearing text: ", error);
                isElectron() && window.electron.log("error", `Error clearing text: ${error}`);
                sonnerErrorToast(t("toast.textClearFailed") + error.message);
            };
        } catch (error) {
            console.error("Error clearing text: ", error);
            isElectron() && window.electron.log("error", `Error clearing text: ${error}`);
            sonnerErrorToast(t("toast.textClearFailed") + error.message);
        }
    };

    const handleRecording = (index) => {
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
                    setActiveTaskIndex(index);

                    mediaRecorder.addEventListener("dataavailable", (event) => {
                        audioChunks.push(event.data);
                        if (mediaRecorder.state === "inactive") {
                            const audioBlob = new Blob(audioChunks, { type: event.data.type });
                            const recordingKey = `${accent}-exam-${examId}-${index}`;
                            saveRecording(audioBlob, recordingKey, event.data.type);
                            sonnerSuccessToast(t("toast.recordingSuccess"));
                            isElectron() &&
                                window.electron.log("log", `Recording saved: ${recordingKey}`);

                            setRecordingExists((prev) => {
                                const updatedExists = [...prev];
                                updatedExists[index] = true;
                                return updatedExists;
                            });
                            audioChunks = [];
                        }
                    });

                    setTimeout(
                        () => {
                            if (mediaRecorder.state !== "inactive") {
                                mediaRecorder.stop();
                                setIsRecording(false);
                                setActiveTaskIndex(null);
                                sonnerWarningToast(t("toast.recordingExceeded"));
                            }
                        },
                        15 * 60 * 1000
                    ); // 15 minutes limit
                })
                .catch((error) => {
                    sonnerErrorToast(t("toast.recordingFailed") + error.message);
                    isElectron() && window.electron.log("error", `Recording failed: ${error}`);
                });
        } else {
            mediaRecorder.stop();
            setIsRecording(false);
            setActiveTaskIndex(null);
        }
    };

    const handlePlayRecording = (index) => {
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
            setActiveTaskIndex(null);
        } else {
            const recordingKey = `${accent}-exam-${examId}-${index}`;
            playRecording(
                recordingKey,
                (audio, audioSource) => {
                    setIsRecordingPlaying(true);
                    setActiveTaskIndex(index);
                    if (audioSource) {
                        setCurrentAudioSource(audioSource);
                    } else {
                        setCurrentAudioElement(audio);
                    }
                },
                (error) => {
                    sonnerErrorToast(t("toast.playbackError") + error.message);
                    isElectron() && window.electron.log("error", `Error during playback: ${error}`);
                    setIsRecordingPlaying(false);
                    setActiveTaskIndex(null);
                },
                () => {
                    setIsRecordingPlaying(false);
                    setActiveTaskIndex(null);
                    setCurrentAudioSource(null);
                    setCurrentAudioElement(null);
                }
            );
        }
    };

    const handleImageClick = (imageName) => {
        const newImage = `${import.meta.env.BASE_URL}images/ispeaker/exam_images/fullsize/${imageName}.webp`;

        // Only set loading if the image is different
        if (modalImage !== newImage) {
            setImageLoading(true);
            setModalImage(newImage);
        }

        imageModalRef.current?.showModal();
    };

    const examTipDoLocalized = t(tips.dos, { returnObjects: true });
    const examTipDontLocalized = t(tips.donts, { returnObjects: true });

    return (
        <>
            <div className="flex flex-wrap justify-center gap-4 lg:flex-nowrap">
                {taskData.map((task, taskIndex) => {
                    const examLocalizedPara = t(task.para, { returnObjects: true });
                    const examLocalizedListItems =
                        task.listItems && t(task.listItems, { returnObjects: true });

                    return (
                        <div
                            className="card card-lg card-border flex shadow-2xs dark:border-slate-600"
                            key={taskIndex}
                        >
                            <div className="card-body p-4">
                                <div className="text-xl font-semibold">
                                    {t("tabConversationExam.taskCard")} {taskIndex + 1}
                                </div>
                                <div className="divider divider-secondary mt-0 mb-4"></div>
                                {task.images.length > 0 && (
                                    <div className="mb-3 flex flex-row flex-wrap justify-center gap-4">
                                        {task.images.map((image, index) => (
                                            <div className="flex w-full md:w-[30%]" key={index}>
                                                <div className="aspect-w-16 aspect-h-9">
                                                    <img
                                                        className="h-full w-full cursor-pointer object-cover"
                                                        role="button"
                                                        src={`${
                                                            import.meta.env.BASE_URL
                                                        }images/ispeaker/exam_images/thumb/${image}.webp`}
                                                        onClick={() => handleImageClick(image)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div>
                                    {examLocalizedPara.map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                    {examLocalizedListItems.length > 0 && (
                                        <ul className="ms-2 list-inside list-disc">
                                            {examLocalizedListItems.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <fieldset className="fieldset my-4">
                                    <legend className="fieldset-legend text-sm">
                                        {t("tabConversationExam.practiceExamTextbox")}
                                    </legend>
                                    <textarea
                                        key={taskIndex}
                                        id={taskIndex}
                                        className="textarea w-full text-base"
                                        ref={(el) => (textAreaRefs.current[taskIndex] = el)}
                                        value={textValues[taskIndex]}
                                        onChange={(e) =>
                                            setTextValues((prevValues) => {
                                                const newValues = [...prevValues];
                                                newValues[taskIndex] = e.target.value;
                                                return newValues;
                                            })
                                        }
                                        onInput={autoExpand}
                                    ></textarea>
                                </fieldset>

                                <div className="flex flex-wrap justify-center gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => handleSaveText(taskIndex)}
                                        disabled={!textValues[taskIndex]}
                                    >
                                        <BsFloppy className="h-5 w-5" />{" "}
                                        {t("buttonConversationExam.saveBtn")}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-error"
                                        onClick={() => handleClearText(taskIndex)}
                                        disabled={!textValues[taskIndex]}
                                    >
                                        <BsTrash className="h-5 w-5" />{" "}
                                        {t("buttonConversationExam.clearBtn")}
                                    </button>
                                </div>

                                <div className="divider"></div>

                                <div className="mt-4">
                                    <p className="mb-4">
                                        {t("tabConversationExam.recordSectionText")}
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => handleRecording(taskIndex)}
                                            disabled={
                                                isRecordingPlaying ||
                                                (activeTaskIndex !== null &&
                                                    activeTaskIndex !== taskIndex)
                                            }
                                        >
                                            {isRecording && activeTaskIndex === taskIndex ? (
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
                                            onClick={() => handlePlayRecording(taskIndex)}
                                            disabled={
                                                isRecording ||
                                                (activeTaskIndex !== null &&
                                                    activeTaskIndex !== taskIndex) ||
                                                !recordingExists[taskIndex]
                                            }
                                        >
                                            {isRecordingPlaying && activeTaskIndex === taskIndex ? (
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
                    );
                })}
            </div>

            <div className="my-4">
                <div className="text-xl font-semibold">{t("tabConversationExam.tipCardExam")}</div>
                <div className="divider divider-secondary mt-0 mb-4"></div>
                <div className="flex w-full flex-col gap-4 px-4 lg:flex-row">
                    <div className="w-full">
                        <p className="mb-4 text-lg font-semibold">
                            {t("tabConversationExam.doCardExam")}
                        </p>
                        <ul className="space-y-2">
                            {examTipDoLocalized.map((tip, index) => (
                                <li className="flex gap-x-2" key={index}>
                                    <div className="flex gap-x-2">
                                        <IoCheckmark className="text-success h-6 w-6 items-center" />
                                    </div>

                                    <div className="flex min-w-0 gap-x-4">
                                        <div className="min-w-0 flex-auto">{tip}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="divider lg:divider-horizontal"></div>
                    <div className="w-full">
                        <p className="mb-4 text-lg font-semibold">
                            {t("tabConversationExam.dontsCardExam")}
                        </p>
                        <ul className="space-y-2">
                            {examTipDontLocalized.map((tip, index) => (
                                <li className="flex gap-x-2" key={index}>
                                    <div className="flex gap-x-2">
                                        <IoCloseOutline className="text-error h-6 w-6 items-center" />
                                    </div>

                                    <div className="flex min-w-0 gap-x-4">
                                        <div className="min-w-0 flex-auto">{tip}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <dialog ref={imageModalRef} className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <form method="dialog">
                        <button className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2">
                            <IoCloseOutline className="h-6 w-6" />
                        </button>
                    </form>
                    <h3 className="text-lg font-bold">
                        {t("tabConversationExam.imageFullSizeModal")}
                    </h3>
                    <div className="relative flex w-full items-center justify-center py-4">
                        {imageLoading && ( // Show skeleton loader if image is loading
                            <div
                                className={`skeleton absolute h-full max-h-[600px] w-full max-w-6xl ${imageLoading ? "z-30" : ""}`}
                            ></div>
                        )}
                        {modalImage && (
                            <img
                                src={modalImage}
                                className={`max-h-[600px] object-contain transition-opacity duration-300 ${
                                    imageLoading ? "opacity-0" : "opacity-100"
                                }`}
                                loading="lazy"
                                onLoad={() => setImageLoading(false)} // Stop loading when image is loaded
                                onError={() => setImageLoading(false)} // Handle errors
                                alt="Full size"
                            />
                        )}
                    </div>
                </div>
            </dialog>
        </>
    );
};

PracticeTab.propTypes = {
    accent: PropTypes.string.isRequired,
    examId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    taskData: PropTypes.array.isRequired,
    tips: PropTypes.object.isRequired,
};

export default PracticeTab;
