import { useState, useEffect } from "react";
import { ListGroup, Row, Col, Spinner, Card } from "react-bootstrap";
import { VolumeUp, VolumeUpFill } from "react-bootstrap-icons";
import ToastNotification from "../general/ToastNotification";
import Masonry from "masonry-layout";

const ListeningTab = ({ subtopicsBre, subtopicsAme, currentAccent }) => {
    const [playingIndex, setPlayingIndex] = useState(null);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [loadingIndex, setLoadingIndex] = useState(null);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const subtopics = currentAccent === "american" ? subtopicsAme : subtopicsBre;

    const handlePlayPause = (idx, audioSrc) => {
        if (loadingIndex === idx) {
            // Cancel loading if clicked again
            setLoadingIndex(null);
            return;
        }

        if (playingIndex === idx) {
            // Stop playing if clicked again
            if (currentAudio) {
                currentAudio.pause();
                setPlayingIndex(null);
                setCurrentAudio(null);
            }
        } else {
            // Start loading the new audio
            if (currentAudio) {
                currentAudio.pause();
            }

            const audio = new Audio(`/media/exam/mp3/${audioSrc}.mp3`);
            setLoadingIndex(idx);
            audio.oncanplaythrough = () => {
                setLoadingIndex(null);
                setCurrentAudio(audio);
                setPlayingIndex(idx);
                audio.play();
            };
            audio.onerror = () => {
                audio.src = `/media/exam/ogg/${audioSrc}.ogg`;
                audio.type = "audio/ogg";
                audio.load();
                audio.oncanplaythrough = () => {
                    setLoadingIndex(null);
                    setCurrentAudio(audio);
                    setPlayingIndex(idx);
                    audio.play();
                };
                audio.onerror = () => {
                    setLoadingIndex(null);
                    setCurrentAudio(null);
                    setPlayingIndex(null);
                    setToastMessage(
                        "Unable to play audio due to a network issue. Please check your connection and reload the page."
                    );
                    setShowToast(true);
                };
            };
            audio.onended = () => {
                setPlayingIndex(null);
                setCurrentAudio(null);
            };
        }
    };

    useEffect(() => {
        return () => {
            if (currentAudio) {
                currentAudio.pause();
                setCurrentAudio(null);
                setPlayingIndex(null);
            }
        };
    }, [currentAudio]);

    useEffect(() => {
        // Initialize Masonry after the component mounts
        new Masonry(".masonry-grid", {
            itemSelector: ".masonry-item",
            columnWidth: ".masonry-item",
            percentPosition: true,
        });
    }, []);

    return (
        <>
            <Row className="g-4 masonry-grid">
                {subtopics.map((subtopic, accordionIndex) => (
                    <Col md={4} key={accordionIndex} className="masonry-item">
                        <Card className="shadow-sm mb-4">
                            <Card.Header>
                                <div className="fw-semibold">{subtopic.title}</div>
                            </Card.Header>
                            <Card.Body>
                                <ListGroup variant="flush">
                                    {subtopic.sentences.map((sentenceObj, sentenceIndex) => {
                                        const uniqueIndex = `${accordionIndex}-${sentenceIndex}`;
                                        return (
                                            <ListGroup.Item
                                                action
                                                key={uniqueIndex}
                                                onClick={() => handlePlayPause(uniqueIndex, sentenceObj.audioSrc)}
                                                // Disable all items if loading or playing another audio
                                                disabled={
                                                    (loadingIndex !== null && loadingIndex !== uniqueIndex) ||
                                                    (playingIndex !== null && playingIndex !== uniqueIndex)
                                                }
                                                type="button"
                                                aria-pressed={playingIndex === uniqueIndex}
                                                aria-disabled={loadingIndex !== null && loadingIndex !== uniqueIndex}>
                                                {loadingIndex === uniqueIndex ? (
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                ) : playingIndex === uniqueIndex ? (
                                                    <VolumeUpFill className="me-2" />
                                                ) : (
                                                    <VolumeUp className="me-2" />
                                                )}
                                                <span
                                                    className="fst-italic"
                                                    dangerouslySetInnerHTML={{ __html: sentenceObj.sentence }}
                                                />
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <ToastNotification
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
                variant="warning"
            />
        </>
    );
};

export default ListeningTab;
