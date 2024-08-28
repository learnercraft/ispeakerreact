import { useState, useEffect, useRef } from "react";
import { Button, Form } from "react-bootstrap";
import { Floppy, PlayCircle, RecordCircle, StopCircle, Trash } from "react-bootstrap-icons";
import { openDatabase, saveRecording, playRecording, checkRecordingExists } from "../../utils/databaseOperations";

const PracticeTab = ({ accent, conversationId, setToastMessage, setShowToast }) => {
    const [textValue, setTextValue] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecordingPlaying, setIsRecordingPlaying] = useState(false);
    const [recordingExists, setRecordingExists] = useState(false);
    const [currentAudioSource, setCurrentAudioSource] = useState(null); // For AudioContext source node
    const [currentAudioElement, setCurrentAudioElement] = useState(null); // For Audio element (fallback)
    const textAreaRef = useRef(null);

    const textKey = `${accent}-${conversationId}-text`;
    const recordingKey = `${accent}-conversation-${conversationId}`;

    // Load saved text from IndexedDB
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

    // Check if the recording exists in IndexedDB
    useEffect(() => {
        const checkIfRecordingExists = async () => {
            const exists = await checkRecordingExists(recordingKey);
            setRecordingExists(exists);
        };
        checkIfRecordingExists();
    }, [recordingKey]);

    // Auto-expand text area
    const autoExpand = () => {
        const textArea = textAreaRef.current;
        if (textArea) {
            textArea.style.height = "auto"; // Reset height to calculate new height
            textArea.style.height = `${textArea.scrollHeight}px`; // Set height to the new calculated height
        }
    };

    // Trigger auto-expand on text change
    useEffect(() => {
        autoExpand();
    }, [textValue]);

    // Save text to IndexedDB
    const handleSaveText = async () => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction(["conversation_data"], "readwrite");
            const store = transaction.objectStore("conversation_data");
            const request = store.put({ id: textKey, text: textValue });

            request.onsuccess = () => {
                setToastMessage("Text saved successfully.");
                setShowToast(true);
            };
            request.onerror = (error) => {
                setToastMessage("Error saving text: " + error.message);
                setShowToast(true);
            };
        } catch (error) {
            console.error("Error saving text: ", error);
        }
    };

    // Clear text from IndexedDB
    const handleClearText = async () => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction(["conversation_data"], "readwrite");
            const store = transaction.objectStore("conversation_data");
            const request = store.delete(textKey);

            request.onsuccess = () => {
                setTextValue("");
                setToastMessage("Text cleared successfully.");
                setShowToast(true);
            };
            request.onerror = (error) => {
                setToastMessage("Error clearing text: " + error.message);
                setShowToast(true);
            };
        } catch (error) {
            console.error("Error clearing text: ", error);
            setToastMessage("Error clearing text: " + error.message);
            setShowToast(true);
        }
    };

    // Handle recording
    const handleRecording = () => {
        if (!isRecording) {
            // Start recording
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
                            setToastMessage("Recording saved.");
                            setShowToast(true);
                            setRecordingExists(true);
                            audioChunks = [];
                        }
                    });

                    // Auto-stop after 10 minutes
                    setTimeout(() => {
                        if (mediaRecorder.state !== "inactive") {
                            mediaRecorder.stop();
                            setToastMessage("Recording stopped because it exceeded the duration limit of 10 minutes.");
                            setShowToast(true);
                            setIsRecording(false);
                        }
                    }, 10 * 60 * 1000);
                })
                .catch((error) => {
                    setToastMessage("Recording failed: " + error.message);
                    setShowToast(true);
                });
        } else {
            // Stop recording
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    // Handle playback
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
                    setToastMessage("Error during playback: " + error.message);
                    setShowToast(true);
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
            <p>Practice writing your own conversation.</p>
            <p>You may use some of the language from this topic.</p>
            <p>Remember to save your text frequently!</p>
            <Form>
                <Form.Group controlId="practiceText" className="mb-2">
                    <Form.Label>Enter your conversation:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        ref={textAreaRef}
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        onInput={autoExpand}
                    />
                </Form.Group>
                <Button variant="primary" onClick={handleSaveText} disabled={!textValue}>
                    <Floppy /> Save
                </Button>
                <Button variant="danger" onClick={handleClearText} className="ms-2">
                    <Trash /> Clear
                </Button>
            </Form>

            <div className="mt-4">
                <p>Use the script you have written above to record yourself. Then listen to how you sound.</p>
                <Button variant="primary" onClick={handleRecording}>
                    {isRecording ? (
                        <>
                            <StopCircle /> Stop recording
                        </>
                    ) : (
                        <>
                            <RecordCircle /> Record
                        </>
                    )}
                </Button>
                <Button variant="success" onClick={handlePlayRecording} disabled={!recordingExists} className="ms-2">
                    {isRecordingPlaying ? (
                        <>
                            <StopCircle /> Stop playback
                        </>
                    ) : (
                        <>
                            <PlayCircle /> Play recording
                        </>
                    )}
                </Button>
            </div>
        </>
    );
};

export default PracticeTab;
