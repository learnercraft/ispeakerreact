import he from "he";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Modal, Ratio, Row } from "react-bootstrap";
import { ArrowLeftCircle, RecordCircleFill } from "react-bootstrap-icons";
import { checkRecordingExists, playRecording, saveRecording } from "../../utils/databaseOperations";
import ToastNotification from "../general/ToastNotification";
import SoundPracticeCard from "./SoundPracticeCard";
import ReviewCard from "./ReviewCard";

const PracticeSound = ({ sound, accent, onBack, index, soundsData }) => {
    const accentKey = accent === "american" ? "a" : "b";
    const accentData = sound[accentKey][0];

    const findPhonemeDetails = useCallback(
        (phoneme) => {
            let index = soundsData.consonants.findIndex((p) => p.phoneme === phoneme);
            if (index !== -1) {
                return { index, type: "consonant" };
            }

            index = soundsData.vowels_n_diphthongs.findIndex((p) => p.phoneme === phoneme);
            if (index !== -1) {
                return { index, type: "vowel" };
            }

            return { index: -1, type: null }; // Not found
        },
        [soundsData.consonants, soundsData.vowels_n_diphthongs]
    );

    const { index: phonemeIndex, type } = findPhonemeDetails(sound.phoneme);

    const videoArrayKey =
        type === "consonant"
            ? accent === "british"
                ? "consonants_b"
                : "consonants_a"
            : accent === "british"
            ? "vowels_b"
            : "vowels_a";

    const videoArray = soundsData[videoArrayKey];
    const videoBlockStartIndex = phonemeIndex * 5;

    // Find the first non-empty video URL in this phoneme's video block
    const videoUrl = videoArray
        .slice(videoBlockStartIndex, videoBlockStartIndex + 5)
        .find((video) => video.value)?.value;

    // Video url for practice part
    const videoUrls = videoArray
        .slice(videoBlockStartIndex, videoBlockStartIndex + 5)
        .filter((video) => video.value)
        .map((video) => video.value);

    const imgPhonemeThumbSrc =
        accent === "american" ? "/images/ispeaker/sound_images/sounds_american.jpg" : "/images/ispeaker/sound_images/sounds_british.jpg";

    const [review, setReview] = useState(null);

    const handleReviewClick = (newReview) => {
        const { type } = findPhonemeDetails(sound.phoneme);
        const reviewKey = `${type}${index + 1}`; // Adding 1 to make it 1-indexed, matching "consonant1", "vowel1", etc.

        // Fetch current ispeaker data or initialize
        const ispeakerData = JSON.parse(localStorage.getItem("ispeaker") || "{}");
        // Ensure soundReview object exists for both accents
        ispeakerData.soundReview = ispeakerData.soundReview || {};
        ispeakerData.soundReview[accent] = ispeakerData.soundReview[accent] || {};
        // Save the new review under the correct accent and review key
        ispeakerData.soundReview[accent][reviewKey] = newReview;

        localStorage.setItem("ispeaker", JSON.stringify(ispeakerData));
        setReview(newReview);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        // Fetch reviews from localStorage
        const reviews = JSON.parse(localStorage.getItem("ispeaker") || "{}").soundReview || {};
        const { type } = findPhonemeDetails(sound.phoneme);
        const reviewKey = `${type}${index + 1}`;

        // Try to load the review for the current accent and phoneme
        const soundReview = reviews[accent] ? reviews[accent][reviewKey] : null;
        if (soundReview) {
            setReview(soundReview);
        }
    }, [sound.phoneme, findPhonemeDetails, accent, index]);

    const emojiStyle = (reviewType) => {
        const styles = {
            good: "text-success",
            neutral: "text-warning",
            bad: "text-danger",
        };
        return review === reviewType ? styles[reviewType] : "";
    };

    // Video modals

    const [show, setShow] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = React.useState("");

    const handleShow = (videoIndex) => {
        setSelectedVideoUrl(videoUrls[videoIndex]);
        setShow(true);
    };

    const handleClose = () => setShow(false);

    // Recording & playback

    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecordingPlaying, setIsRecordingPlaying] = useState(false);
    const [activeRecordingCard, setActiveRecordingCard] = useState(null);
    const [recordingAvailability, setRecordingAvailability] = useState({});
    const [playingRecordings, setPlayingRecordings] = useState({});
    const [activePlaybackCard, setActivePlaybackCard] = useState(null);

    const [currentAudioSource, setCurrentAudioSource] = useState(null); // For AudioContext source node
    const [currentAudioElement, setCurrentAudioElement] = useState(null); // For Audio element (fallback)

    // Notification state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const MAX_RECORDING_DURATION_MS = 10 * 1000; // 10 seconds in milliseconds

    const handleRecording = (cardIndex) => {
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
                            setToastMessage("Recording stopped because it exceeded the duration limit of 10 seconds.");
                            setShowToast(true);
                            setIsRecording(false);
                            setActiveRecordingCard(null);
                        }

                        if (mediaRecorder.state === "inactive") {
                            const audioBlob = new Blob(audioChunks, { type: mimeType });
                            saveRecording(audioBlob, recordingDataIndex, mimeType);
                            setToastMessage("Recording saved.");
                            setShowToast(true);
                            setRecordingAvailability((prev) => ({ ...prev, [recordingDataIndex]: true }));
                            audioChunks = [];
                        }
                    });

                    // Automatically stop recording after 10 minutes if not already stopped
                    setTimeout(() => {
                        if (mediaRecorder.state !== "inactive") {
                            mediaRecorder.stop();
                            setToastMessage("Recording stopped because it exceeded the duration limit of 10 seconds.");
                            setShowToast(true);
                            setIsRecording(false);
                            setActiveRecordingCard(null);
                        }
                    }, MAX_RECORDING_DURATION_MS);
                })
                .catch((err) => {
                    console.error("Error accessing the microphone.", err);
                    setToastMessage("Recording failed. Reason(s): " + err.message);
                    setShowToast(true);
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
    };

    const getRecordingKey = useCallback(
        (cardIndex) => {
            const { index, type } = findPhonemeDetails(sound.phoneme);
            return `${accent}-${type}${index + 1}_${cardIndex}`;
        },
        [findPhonemeDetails, sound.phoneme, accent] // Dependencies array
    );

    const isRecordingAvailable = (cardIndex) => {
        const recordingKey = getRecordingKey(cardIndex);
        return recordingAvailability[recordingKey];
    };

    const isRecordingPlayingActive = (cardIndex) => {
        const recordingKey = getRecordingKey(cardIndex);
        return !!playingRecordings[recordingKey];
    };

    useEffect(() => {
        // Assume checkRecordingExists is a function that checks if a recording exists and returns a promise that resolves to a boolean
        const checks = [];
        for (let i = 1; i <= 4; i++) {
            const key = getRecordingKey(i);
            checks.push(checkRecordingExists(key).then((exists) => ({ key, exists })));
        }

        Promise.all(checks).then((results) => {
            const newAvailability = results.reduce((acc, { key, exists }) => {
                acc[key] = exists;
                return acc;
            }, {});
            setRecordingAvailability(newAvailability);
        });
    }, [getRecordingKey]);

    const handlePlayRecording = async (cardIndex) => {
        const key = getRecordingKey(cardIndex);

        if (isRecordingPlaying && activePlaybackCard === cardIndex) {
            // Stop current playback
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
            setActivePlaybackCard(null);
            setPlayingRecordings((prev) => ({ ...prev, [key]: false }));
        } else {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log("Initial audioContext state: " + audioContext.state);

            if (audioContext.state === "suspended") {
                try {
                    await audioContext.resume(); // Resume within the event handler
                    console.log("AudioContext state after resume attempt: " + audioContext.state);

                    if (audioContext.state === "running") {
                        // Proceed with playback after resuming AudioContext
                        initiatePlayback(key, cardIndex, audioContext);
                    } else {
                        console.log("AudioContext did not resume. Fallback to Audio element.");
                        fallbackToAudioElement(key, cardIndex); // Handle iOS fallback
                    }
                } catch (error) {
                    console.error("Failed to resume AudioContext:", error);
                    setToastMessage("Error resuming audio playback: " + error.message);
                    setShowToast(true);
                }
            } else {
                // AudioContext is already running
                console.log("AudioContext is running, proceeding with playback.");
                initiatePlayback(key, cardIndex, audioContext);
            }
        }
    };

    // Fallback to Audio element on iOS
    const fallbackToAudioElement = (key, cardIndex) => {
        playRecording(
            key,
            (audio, audioSource) => {
                setIsRecordingPlaying(true);
                setActivePlaybackCard(cardIndex);
                setPlayingRecordings((prev) => ({ ...prev, [key]: true }));
                if (audioSource) {
                    setCurrentAudioSource(audioSource);
                } else {
                    setCurrentAudioElement(audio); // Handle Audio element playback
                }
            },
            (error) => {
                console.error("Error during playback:", error);
                setToastMessage("Error during playback: " + error.message);
                setShowToast(true);
                setIsRecordingPlaying(false);
                setActivePlaybackCard(null);
                setPlayingRecordings((prev) => ({ ...prev, [key]: false }));
            },
            () => {
                setIsRecordingPlaying(false);
                setActivePlaybackCard(null);
                setPlayingRecordings((prev) => ({ ...prev, [key]: false }));
                setCurrentAudioSource(null);
                setCurrentAudioElement(null);
            },
            null // Do not pass audioContext, fallback to Blob URL
        );
    };

    const initiatePlayback = (key, cardIndex, audioContext) => {
        playRecording(
            key,
            (audio, audioSource) => {
                setIsRecordingPlaying(true);
                setActivePlaybackCard(cardIndex);
                setPlayingRecordings((prev) => ({ ...prev, [key]: true }));
                if (audioSource) {
                    setCurrentAudioSource(audioSource);
                } else {
                    setCurrentAudioElement(audio);
                }
            },
            (error) => {
                console.error("Error during playback:", error);
                setToastMessage("Error during playback: " + error.message);
                setShowToast(true);
                setIsRecordingPlaying(false);
                setActivePlaybackCard(null);
                setPlayingRecordings((prev) => ({ ...prev, [key]: false }));
            },
            () => {
                setIsRecordingPlaying(false);
                setActivePlaybackCard(null);
                setPlayingRecordings((prev) => ({ ...prev, [key]: false }));
                setCurrentAudioSource(null);
                setCurrentAudioElement(null);
            },
            audioContext // Pass audioContext to playRecording
        );
    };

    useEffect(() => {
        // Cleanup function to stop recording and playback
        return () => {
            // Stop the recording if it's active
            if (isRecording && mediaRecorder) {
                mediaRecorder.stop();
                setIsRecording(false);
            }

            // Stop AudioContext playback
            if (currentAudioSource) {
                try {
                    currentAudioSource.stop();
                } catch (error) {
                    console.error("Error stopping AudioContext source during cleanup:", error);
                }
                setCurrentAudioSource(null);
            }

            // Stop Audio element playback
            if (currentAudioElement) {
                currentAudioElement.pause();
                currentAudioElement.currentTime = 0;
                setCurrentAudioElement(null);
            }
        };
    }, [isRecording, mediaRecorder, currentAudioSource, currentAudioElement]);

    return (
        <>
            <Row className="mt-4">
                <Col lg={3} className="mb-4">
                    <h3>Sound {he.decode(sound.phoneme)}</h3>
                    <p>Accent: {accent.charAt(0).toUpperCase() + accent.slice(1)} English</p>
                    {accentData && (
                        <>
                            <p className="fw-semibold">{accentData.text}</p>
                            {["initial", "medial", "final"].map((position) => (
                                <p
                                    key={position}
                                    dangerouslySetInnerHTML={{ __html: he.decode(accentData[position]) }}></p>
                            ))}
                        </>
                    )}
                    <Button onClick={onBack}>
                        <ArrowLeftCircle /> Back to sound list
                    </Button>
                </Col>
                <Col lg={9}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="fw-semibold">Watch</Card.Header>
                        <Card.Body>
                            <Ratio aspectRatio="16x9">
                                <iframe src={videoUrl} title="Phoneme Video" loading="lazy" allowFullScreen></iframe>
                            </Ratio>
                        </Card.Body>
                    </Card>
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="fw-semibold">Practice</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                Click/Tap on the image to watch the video clips. Click/Tap on the <RecordCircleFill />{" "}
                                button to record.
                            </Card.Text>
                            <SoundPracticeCard
                                sound={sound}
                                handleShow={handleShow}
                                imgPhonemeThumbSrc={imgPhonemeThumbSrc}
                                activeRecordingCard={activeRecordingCard}
                                isRecordingPlaying={isRecordingPlaying}
                                activePlaybackCard={activePlaybackCard}
                                accentData={accentData}
                                isRecordingPlayingActive={isRecordingPlayingActive}
                                isRecordingAvailable={isRecordingAvailable}
                                handleRecording={handleRecording}
                                handlePlayRecording={handlePlayRecording}
                            />
                        </Card.Body>
                    </Card>
                    <ReviewCard sound={sound} handleReviewClick={handleReviewClick} emojiStyle={emojiStyle} />
                </Col>
            </Row>
            <Modal show={show} onHide={handleClose} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Watch video pronunciation clip</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Ratio aspectRatio="16x9">
                        <iframe src={selectedVideoUrl} loading="lazy" allowFullScreen />
                    </Ratio>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastNotification
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
                variant="warning"
            />
        </>
    );
};

export default PracticeSound;
