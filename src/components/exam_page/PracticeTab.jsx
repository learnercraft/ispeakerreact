import { useEffect, useRef, useState } from "react";
import { Accordion, Button, Card, Col, Form, Image, Modal, Ratio, Row } from "react-bootstrap";
import { Floppy, PlayCircle, RecordCircle, StopCircle, Trash } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { checkRecordingExists, openDatabase, playRecording, saveRecording } from "../../utils/databaseOperations";
import { isElectron } from "../../utils/isElectron";

const PracticeTab = ({ accent, examId, taskData, tips, setToastMessage, setShowToast }) => {
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

    const [showModal, setShowModal] = useState(false);
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
        const textArea = textAreaRefs.current[e.target.dataset.index];
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
                setToastMessage(t("toast.textSaveSuccess"));
                setShowToast(true);
            };
            request.onerror = (error) => {
                console.error("Error saving text: ", error);
                isElectron() && window.electron.log("error", `Error saving text: ${error}`);
                setToastMessage(t("toast.textSaveFailed") + error.message);
                setShowToast(true);
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
                setToastMessage(t("toast.textClearSuccess"));
                setShowToast(true);
            };
            request.onerror = (error) => {
                console.error("Error clearing text: ", error);
                isElectron() && window.electron.log("error", `Error clearing text: ${error}`);
                setToastMessage(t("toast.textClearFailed") + error.message);
                setShowToast(true);
            };
        } catch (error) {
            console.error("Error clearing text: ", error);
            isElectron() && window.electron.log("error", `Error clearing text: ${error}`);
            setToastMessage(t("toast.textClearFailed") + error.message);
            setShowToast(true);
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
                            setToastMessage(t("toast.recordingSuccess"));
                            isElectron() && window.electron.log("log", `Recording saved: ${recordingKey}`);
                            setShowToast(true);
                            setRecordingExists((prev) => {
                                const updatedExists = [...prev];
                                updatedExists[index] = true;
                                return updatedExists;
                            });
                            audioChunks = [];
                        }
                    });

                    setTimeout(() => {
                        if (mediaRecorder.state !== "inactive") {
                            mediaRecorder.stop();
                            setIsRecording(false);
                            setActiveTaskIndex(null);
                            setToastMessage(t("toast.recordingExceeded"));
                            setShowToast(true);
                        }
                    }, 15 * 60 * 1000); // 15 minutes limit
                })
                .catch((error) => {
                    setToastMessage(t("toast.recordingFailed") + error.message);
                    isElectron() && window.electron.log("error", `Recording failed: ${error}`);
                    setShowToast(true);
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
                    setToastMessage(t("toast.playbackError") + error.message);
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
        setModalImage(`${import.meta.env.BASE_URL}images/ispeaker/exam_images/jpg/${imageName}.jpg`);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const examTipDoLocalized = t(tips.dos, { returnObjects: true });
    const examTipDontLocalized = t(tips.donts, { returnObjects: true });

    return (
        <>
            <Row>
                <Col md={8}>
                    {taskData.map((task, taskIndex) => {
                        const examLocalizedPara = t(task.para, { returnObjects: true });
                        const examLocalizedListItems = task.listItems && t(task.listItems, { returnObjects: true });

                        return (
                            <Card className="mb-4 shadow-sm" key={taskIndex}>
                                <Card.Header className="fw-semibold">
                                    {t("tabConversationExam.taskCard")} {taskIndex + 1}
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-4 d-flex justify-content-center">
                                        {task.images.map((image, index) => (
                                            <Col md={6} key={index}>
                                                <Ratio aspectRatio="16x9">
                                                    <Image
                                                        role="button"
                                                        src={`${
                                                            import.meta.env.BASE_URL
                                                        }images/ispeaker/exam_images/webp/${image}.webp`}
                                                        thumbnail
                                                        onClick={() => handleImageClick(image)}
                                                    />
                                                </Ratio>
                                            </Col>
                                        ))}
                                    </Row>
                                    <div className="mt-3">
                                        {examLocalizedPara.map((paragraph, index) => (
                                            <p key={index}>{paragraph}</p>
                                        ))}
                                        {examLocalizedListItems.length > 0 && (
                                            <ul>
                                                {examLocalizedListItems.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <Form>
                                        <Form.Group controlId={`practiceText-${taskIndex}`} className="mb-2">
                                            <Form.Label>{t("tabConversationExam.practiceExamTextbox")}</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                data-index={taskIndex}
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
                                            />
                                        </Form.Group>
                                        <Button
                                            variant="primary"
                                            onClick={() => handleSaveText(taskIndex)}
                                            disabled={!textValues[taskIndex]}>
                                            <Floppy /> {t("buttonConversationExam.saveBtn")}
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleClearText(taskIndex)}
                                            className="ms-2">
                                            <Trash /> {t("buttonConversationExam.clearBtn")}
                                        </Button>
                                    </Form>

                                    <div className="mt-4">
                                        <p>{t("tabConversationExam.recordSectionText")}</p>
                                        <Button
                                            variant="primary"
                                            onClick={() => handleRecording(taskIndex)}
                                            disabled={activeTaskIndex !== null && activeTaskIndex !== taskIndex}>
                                            {isRecording && activeTaskIndex === taskIndex ? (
                                                <>
                                                    <StopCircle /> {t("buttonConversationExam.stopRecordBtn")}
                                                </>
                                            ) : (
                                                <>
                                                    <RecordCircle /> {t("buttonConversationExam.recordBtn")}
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="success"
                                            onClick={() => handlePlayRecording(taskIndex)}
                                            disabled={
                                                (activeTaskIndex !== null && activeTaskIndex !== taskIndex) ||
                                                !recordingExists[taskIndex]
                                            }
                                            className="ms-2">
                                            {isRecordingPlaying && activeTaskIndex === taskIndex ? (
                                                <>
                                                    <StopCircle /> {t("buttonConversationExam.stopPlayBtn")}
                                                </>
                                            ) : (
                                                <>
                                                    <PlayCircle /> {t("buttonConversationExam.playBtn")}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </Col>

                <Col>
                    <Card className="shadow-sm">
                        <Card.Header className="fw-semibold">{t("tabConversationExam.tipCardExam")}</Card.Header>
                        <Card.Body>
                            <Accordion className="mt-2" alwaysOpen>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>
                                        <div className="fw-semibold">{t("tabConversationExam.doCardExam")}</div>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <ul className="ps-4">
                                            {examTipDoLocalized.map((tip, index) => (
                                                <li className="mb-3" key={index}>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>
                                        <div className="fw-semibold">{t("tabConversationExam.dontsCardExam")}</div>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <ul className="ps-4">
                                            {examTipDontLocalized.map((tip, index) => (
                                                <li className="mb-3" key={index}>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton className="fw-semibold">
                    <Modal.Title>{t("tabConversationExam.imageFullSizeModal")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Image src={modalImage} fluid />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default PracticeTab;
