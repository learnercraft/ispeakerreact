import React, { useState, useEffect } from "react";
import { Row, Col, Card, Ratio, Button, Modal } from "react-bootstrap";
import he from "he";

const PracticeSound = ({ sound, accent, onBack, index, soundsData }) => {
    const accentKey = accent === "american" ? "a" : "b";
    const accentData = sound[accentKey][0];

    const findPhonemeDetails = (phoneme) => {
        let index = soundsData.consonants.findIndex((p) => p.phoneme === phoneme);
        if (index !== -1) {
            return { index, type: "consonant" };
        }

        index = soundsData.vowels_n_diphthongs.findIndex((p) => p.phoneme === phoneme);
        if (index !== -1) {
            return { index, type: "vowel" };
        }

        return { index: -1, type: null }; // Not found
    };

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

    let imgPhonemeThumbSrc;

    if (accent === "american") {
        imgPhonemeThumbSrc = "/images/ispeaker/sounds_american.jpg";
    } else {
        imgPhonemeThumbSrc = "/images/ispeaker/sounds_british.jpg";
    }

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
    }, [sound.phoneme, accent, index]); // Also depend on accent to reload when it changes

    const emojiStyle = (reviewType) => {
        if (review === reviewType) {
            switch (reviewType) {
                case "good":
                    return "text-success";
                case "neutral":
                    return "text-warning";
                case "bad":
                    return "text-danger";
                default:
                    return "";
            }
        }
        return "";
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
    const [currentAudio, setCurrentAudio] = useState(null);
    const [activePlaybackCard, setActivePlaybackCard] = useState(null);

    let db;

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (db) {
                resolve(db); // If db is already defined, resolve immediately
                return;
            }
            const request = window.indexedDB.open("iSpeaker_data", 1);

            request.onerror = function (event) {
                console.error("Database error: ", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = function (event) {
                db = event.target.result; // Set db to the successfully opened database
                resolve(db);
            };

            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                db.createObjectStore("recording_data", { keyPath: "id" });
            };
        });
    }

    async function saveRecording(blob, key) {
        try {
            // First, convert Blob to ArrayBuffer outside of the transaction
            const arrayBuffer = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsArrayBuffer(blob);
            });

            const db = await openDatabase();
            const transaction = db.transaction(["recording_data"], "readwrite");
            const store = transaction.objectStore("recording_data");

            // Now that we have the ArrayBuffer, store it
            const request = store.put({ id: key, recording: arrayBuffer });
            request.onsuccess = () => console.log("Recording saved successfully");
            request.onerror = (error) => console.error("Error saving recording:", error);
        } catch (error) {
            console.error("Error saving recording: ", error);
        }
    }

    const handleRecording = (cardIndex) => {
        const { index, type } = findPhonemeDetails(sound.phoneme);
        const recordingDataIndex = `${type}${index + 1}_${cardIndex}`;
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

                    mediaRecorder.start();
                    setIsRecording(true);
                    setMediaRecorder(mediaRecorder);
                    setActiveRecordingCard(cardIndex);

                    mediaRecorder.addEventListener("dataavailable", (event) => {
                        audioChunks.push(event.data);
                        if (mediaRecorder.state === "inactive") {
                            const audioBlob = new Blob(audioChunks);
                            // Save the audioBlob to IndexedDB, then you can call playRecording with the key where it's saved
                            saveRecording(audioBlob, recordingDataIndex); // Ensure saveRecording function is defined to handle saving to IndexedDB
                            setRecordingAvailability((prev) => ({ ...prev, [recordingDataIndex]: true }));
                            audioChunks = [];
                        }
                    });
                })
                .catch((err) => {
                    console.error("Error accessing the microphone", err);
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

    async function playRecording(key) {
        try {
            const db = await openDatabase();
            const transaction = db.transaction(["recording_data"]);
            const store = transaction.objectStore("recording_data");
            const request = store.get(key);

            request.onsuccess = function () {
                const arrayBuffer = request.result.recording;
                const audioContext = new AudioContext();
                audioContext.decodeAudioData(
                    arrayBuffer,
                    (buffer) => {
                        const source = audioContext.createBufferSource();
                        source.buffer = buffer;
                        source.connect(audioContext.destination);
                        source.onended = () => {
                            setIsRecordingPlaying(false);
                            setActivePlaybackCard(null);
                            setPlayingRecordings((prev) => ({ ...prev, [key]: false }));
                        };
                        source.start();
                        setIsRecordingPlaying(true);
                        setPlayingRecordings((prev) => ({ ...prev, [key]: true }));
                        //setActivePlaybackCard(getCardIndexFromKey(key));
                    },
                    (error) => {
                        console.error("Error decoding audio data: ", error);
                        setIsRecordingPlaying(false);
                        setActivePlaybackCard(null);
                        setPlayingRecordings((prev) => ({ ...prev, [key]: false }));
                    }
                );
            };

            request.onerror = () => {
                console.error("Error getting recording from IndexedDB: ", request.error);
                setIsRecordingPlaying(false);
                setActivePlaybackCard(null);
                setPlayingRecordings((prev) => ({ ...prev, [key]: false }));
            };
        } catch (error) {
            console.error("Error playing recording: ", error);
        }
    }

    async function checkRecordingExists(key) {
        try {
            const db = await openDatabase(); // Ensure the db is opened before using it
            const transaction = db.transaction(["recording_data"]);
            const store = transaction.objectStore("recording_data");
            const request = store.get(key);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    if (request.result) resolve(true);
                    else resolve(false);
                };

                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("Error opening database: ", error);
        }
    }

    const getRecordingKey = (cardIndex) => {
        const { index, type } = findPhonemeDetails(sound.phoneme);
        return `${type}${index + 1}_${cardIndex}`;
    };

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
            const key = `${findPhonemeDetails(sound.phoneme).type}${findPhonemeDetails(sound.phoneme).index + 1}_${i}`;
            checks.push(checkRecordingExists(key).then((exists) => ({ key, exists })));
        }

        Promise.all(checks).then((results) => {
            const newAvailability = results.reduce((acc, { key, exists }) => {
                acc[key] = exists;
                return acc;
            }, {});
            setRecordingAvailability(newAvailability);
        });
    }, []);

    const handlePlayRecording = (cardIndex) => {
        const recordingKey = getRecordingKey(cardIndex);
        if (activePlaybackCard === cardIndex) {
            // Stop the current playback
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                setCurrentAudio(null);
                setActivePlaybackCard(null); // Reset active playback
                setIsRecordingPlaying(false);
            }
        } else {
            // Start new playback
            const { index, type } = findPhonemeDetails(sound.phoneme);
            const recordingDataIndex = `${type}${index + 1}_${cardIndex}`;
            playRecording(recordingDataIndex);
            setPlayingRecordings((prev) => ({ ...prev, [recordingKey]: true }));
            setActivePlaybackCard(cardIndex);
            //startPlayback(cardIndex);
            setIsRecordingPlaying(true);
        }
    };

    return (
        <>
            <Row>
                <Col lg={3} className="mb-4">
                    <h4>Sound {he.decode(sound.phoneme)}</h4>
                    <p>Accent: {accent.charAt(0).toUpperCase() + accent.slice(1)} English</p>
                    {accentData && (
                        <>
                            <p className="fw-semibold">{accentData.text}</p>
                            <p dangerouslySetInnerHTML={{ __html: he.decode(accentData.initial) }}></p>
                            <p dangerouslySetInnerHTML={{ __html: he.decode(accentData.medial) }}></p>
                            <p dangerouslySetInnerHTML={{ __html: he.decode(accentData.final) }}></p>
                        </>
                    )}
                    <Button onClick={onBack}>Back to sound list</Button>
                </Col>
                <Col lg={9}>
                    <Card className="mb-4">
                        <Card.Header className="fw-semibold">Watch</Card.Header>
                        <Card.Body>
                            <Ratio aspectRatio="16x9">
                                <iframe src={videoUrl} title="Phoneme Video" loading="lazy" allowFullScreen></iframe>
                            </Ratio>
                        </Card.Body>
                    </Card>
                    <Card className="mb-4">
                        <Card.Header className="fw-semibold">Practice</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                Click/Tap on the image to watch the video clips. Click/Tap on the{" "}
                                <svg width="16" height="16" fill="currentColor" className="bi bi-record-circle-fill">
                                    <use href="#record-button"></use>
                                </svg>{" "}
                                button to record.
                            </Card.Text>
                            <Card className="mb-2">
                                <Card.Body>
                                    <Row>
                                        <Col xs={"auto"} className="d-flex align-items-center">
                                            <a href="#" onClick={() => handleShow(1)}>
                                                <img src={imgPhonemeThumbSrc} />
                                            </a>
                                        </Col>
                                        <Col xs={"auto"} className="d-flex align-items-center">
                                            <span>{he.decode(sound.phoneme)}</span>
                                        </Col>
                                        <Col xs={"auto"} className="d-flex align-items-center">
                                            <svg
                                                width="24"
                                                height="24"
                                                fill="currentColor"
                                                role="button"
                                                className={`bi me-2 ${
                                                    activeRecordingCard === 1
                                                        ? "text-danger"
                                                        : activeRecordingCard !== null || isRecordingPlaying
                                                        ? "pe-none opacity-25"
                                                        : ""
                                                }`}
                                                onClick={() => handleRecording(1)}>
                                                <use href="#record-button"></use>
                                            </svg>
                                            <svg
                                                width="24"
                                                height="24"
                                                fill="currentColor"
                                                role="button"
                                                className={`bi me-2 ${
                                                    isRecordingPlaying && activePlaybackCard !== 1
                                                        ? "pe-none opacity-25"
                                                        : isRecordingPlayingActive(1)
                                                        ? "text-success"
                                                        : !isRecordingAvailable(1) || activeRecordingCard !== null
                                                        ? "pe-none opacity-25"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    isRecordingAvailable(1) ? handlePlayRecording(1) : null
                                                }
                                                disabled={isRecordingPlaying && activePlaybackCard !== 1}>
                                                <use href="#play-button"></use>
                                            </svg>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            {accentData.initial && (
                                <Card className="mb-2">
                                    <Card.Body>
                                        <Row>
                                            <Col xs={"auto"} className="d-flex align-items-center">
                                                <a href="#" onClick={() => handleShow(2)}>
                                                    <img src={imgPhonemeThumbSrc} />
                                                </a>
                                            </Col>
                                            <Col xs={"auto"} className="d-flex align-items-center">
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: he.decode(accentData.initial),
                                                    }}></span>
                                            </Col>
                                            <Col xs={"auto"} className="d-flex align-items-center">
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    fill="currentColor"
                                                    role="button"
                                                    className={`bi me-2 ${
                                                        activeRecordingCard === 2
                                                            ? "text-danger"
                                                            : activeRecordingCard !== null || isRecordingPlaying
                                                            ? "pe-none opacity-25"
                                                            : ""
                                                    }`}
                                                    onClick={() => handleRecording(2)}>
                                                    <use href="#record-button"></use>
                                                </svg>
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    fill="currentColor"
                                                    role="button"
                                                    className={`bi me-2 ${
                                                        isRecordingPlaying && activePlaybackCard !== 2
                                                            ? "pe-none opacity-25"
                                                            : isRecordingPlayingActive(2)
                                                            ? "text-success"
                                                            : !isRecordingAvailable(2) || activeRecordingCard !== null
                                                            ? "pe-none opacity-25"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        isRecordingAvailable(2) ? handlePlayRecording(2) : null
                                                    }
                                                    disabled={isRecordingPlaying && activePlaybackCard !== 2}>
                                                    <use href="#play-button"></use>
                                                </svg>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}
                            {accentData.medial && (
                                <Card className="mb-2">
                                    <Card.Body>
                                        <Row>
                                            <Col xs={"auto"} className="d-flex align-items-center">
                                                <a href="#" onClick={() => handleShow(3)}>
                                                    <img src={imgPhonemeThumbSrc} />
                                                </a>
                                            </Col>
                                            <Col xs={"auto"} className="d-flex align-items-center">
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: he.decode(accentData.medial),
                                                    }}></span>
                                            </Col>
                                            <Col xs={"auto"} className="d-flex align-items-center">
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    fill="currentColor"
                                                    role="button"
                                                    className={`bi me-2 ${
                                                        activeRecordingCard === 3
                                                            ? "text-danger"
                                                            : activeRecordingCard !== null || isRecordingPlaying
                                                            ? "pe-none opacity-25"
                                                            : ""
                                                    }`}
                                                    onClick={() => handleRecording(3)}>
                                                    <use href="#record-button"></use>
                                                </svg>
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    fill="currentColor"
                                                    role="button"
                                                    className={`bi me-2 ${
                                                        isRecordingPlaying && activePlaybackCard !== 3
                                                            ? "pe-none opacity-25"
                                                            : isRecordingPlayingActive(3)
                                                            ? "text-success"
                                                            : !isRecordingAvailable(3) || activeRecordingCard !== null
                                                            ? "pe-none opacity-25"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        isRecordingAvailable(3) ? handlePlayRecording(3) : null
                                                    }>
                                                    <use href="#play-button"></use>
                                                </svg>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}
                            {accentData.final && (
                                <Card className="mb-2">
                                    <Card.Body>
                                        <Row>
                                            <Col xs={"auto"} className="d-flex align-items-center">
                                                <a href="#" onClick={() => handleShow(4)}>
                                                    <img src={imgPhonemeThumbSrc} />
                                                </a>
                                            </Col>
                                            <Col xs={"auto"} className="d-flex align-items-center">
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: he.decode(accentData.final),
                                                    }}></span>
                                            </Col>
                                            <Col xs={"auto"} className="d-flex align-items-center">
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    fill="currentColor"
                                                    role="button"
                                                    className={`bi me-2 ${
                                                        activeRecordingCard === 4
                                                            ? "text-danger"
                                                            : activeRecordingCard !== null || isRecordingPlaying
                                                            ? "pe-none opacity-25"
                                                            : ""
                                                    }`}
                                                    onClick={() => handleRecording(4)}>
                                                    <use href="#record-button"></use>
                                                </svg>
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    fill="currentColor"
                                                    role="button"
                                                    className={`bi me-2 ${
                                                        isRecordingPlaying && activePlaybackCard !== 4
                                                            ? "pe-none opacity-25"
                                                            : isRecordingPlayingActive(4)
                                                            ? "text-success"
                                                            : !isRecordingAvailable(4) || activeRecordingCard !== null
                                                            ? "pe-none opacity-25"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        isRecordingAvailable(4) ? handlePlayRecording(4) : null
                                                    }>
                                                    <use href="#play-button"></use>
                                                </svg>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Header className="fw-semibold">Review</Card.Header>
                        <Card.Body>
                            <Card.Text>How do you pronouce the sound {he.decode(sound.phoneme)}?</Card.Text>
                            <Row className="d-flex justify-content-center">
                                <Col xs={"auto"} className="me-2" onClick={() => handleReviewClick("good")}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="52"
                                        height="52"
                                        role="button"
                                        fill="currentColor"
                                        className={`bi bi-emoji-smile ${emojiStyle("good")}`}
                                        viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5" />
                                    </svg>
                                </Col>
                                <Col xs={"auto"} className="me-2" onClick={() => handleReviewClick("neutral")}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="52"
                                        height="52"
                                        role="button"
                                        fill="currentColor"
                                        className={`bi bi-emoji-neutral ${emojiStyle("neutral")}`}
                                        viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M4 10.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5m3-4C7 5.672 6.552 5 6 5s-1 .672-1 1.5S5.448 8 6 8s1-.672 1-1.5m4 0c0-.828-.448-1.5-1-1.5s-1 .672-1 1.5S9.448 8 10 8s1-.672 1-1.5" />
                                    </svg>
                                </Col>
                                <Col xs={"auto"} className="me-2" onClick={() => handleReviewClick("bad")}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="52"
                                        height="52"
                                        role="button"
                                        fill="currentColor"
                                        className={`bi bi-emoji-tear ${emojiStyle("bad")}`}
                                        viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M6.831 11.43A3.1 3.1 0 0 1 8 11.196c.916 0 1.607.408 2.25.826.212.138.424-.069.282-.277-.564-.83-1.558-2.049-2.532-2.049-.53 0-1.066.361-1.536.824q.126.27.232.535.069.174.135.373ZM6 11.333C6 12.253 5.328 13 4.5 13S3 12.254 3 11.333c0-.706.882-2.29 1.294-2.99a.238.238 0 0 1 .412 0c.412.7 1.294 2.284 1.294 2.99M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5m-1.5-3A.5.5 0 0 1 10 3c1.162 0 2.35.584 2.947 1.776a.5.5 0 1 1-.894.448C11.649 4.416 10.838 4 10 4a.5.5 0 0 1-.5-.5M7 3.5a.5.5 0 0 0-.5-.5c-1.162 0-2.35.584-2.947 1.776a.5.5 0 1 0 .894.448C4.851 4.416 5.662 4 6.5 4a.5.5 0 0 0 .5-.5" />
                                    </svg>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="d-none">
                <symbol id="record-button" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                </symbol>
                <symbol id="play-button" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                </symbol>
            </svg>
        </>
    );
};

export default PracticeSound;
