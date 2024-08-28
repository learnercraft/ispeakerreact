import { useEffect, useState } from "react";
import { Card, Col, ListGroup, Row, Spinner } from "react-bootstrap";
import { VolumeUp, VolumeUpFill } from "react-bootstrap-icons";
import ToastNotification from "../general/ToastNotification";

const ListeningTab = ({ sentences }) => {
    const [currentAudio, setCurrentAudio] = useState(null);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [loadingIndex, setLoadingIndex] = useState(null);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const handlePlayPause = (index, audioSrc) => {
        if (loadingIndex === index) {
            // Cancel loading if clicked again
            setLoadingIndex(null);
            return;
        }

        if (playingIndex === index) {
            // Stop current audio if the same index is clicked
            if (currentAudio) {
                currentAudio.pause();
                setPlayingIndex(null);
                setCurrentAudio(null);
            }
        } else {
            // Stop any currently playing audio
            if (currentAudio) {
                currentAudio.pause();
            }

            // Create new audio element
            const audio = new Audio(`/media/conversation/mp3/${audioSrc}.mp3`);

            // Set loading state
            setLoadingIndex(index);
            audio.oncanplaythrough = () => {
                setLoadingIndex(null);
                setCurrentAudio(audio);
                setPlayingIndex(index);
                audio.play();
            };

            audio.onerror = () => {
                audio.src = `/media/conversation/ogg/${audioSrc}.ogg`;
                audio.type = "audio/ogg";
                audio.load();
                audio.oncanplaythrough = () => {
                    setLoadingIndex(null);
                    setCurrentAudio(audio);
                    setPlayingIndex(index);
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
                setCurrentAudio(null);
                setPlayingIndex(null);
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

    return (
        <>
            <Row className="g-4">
                {sentences.map((subtopic, index) => (
                    <Col key={index}>
                        <Card>
                            <Card.Header>
                                <div className="fw-semibold">{subtopic.title}</div>
                            </Card.Header>
                            <Card.Body>
                                <ListGroup variant="flush">
                                    {subtopic.sentences.map((sentenceObj, idx) => {
                                        const uniqueIdx = `${index}-${idx}`; // Create a unique index for each sentence
                                        return (
                                            <ListGroup.Item
                                                action
                                                key={uniqueIdx}
                                                onClick={() => handlePlayPause(uniqueIdx, sentenceObj.audioSrc)}
                                                disabled={
                                                    (loadingIndex !== null && loadingIndex !== uniqueIdx) ||
                                                    (playingIndex !== null && playingIndex !== uniqueIdx)
                                                }
                                                type="button"
                                                aria-pressed={playingIndex === uniqueIdx}
                                                aria-disabled={loadingIndex !== null && loadingIndex !== uniqueIdx}>
                                                {loadingIndex === uniqueIdx ? (
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                ) : playingIndex === uniqueIdx ? (
                                                    <VolumeUpFill className="me-2" />
                                                ) : (
                                                    <VolumeUp className="me-2" />
                                                )}
                                                <span
                                                    className="fst-italic"
                                                    dangerouslySetInnerHTML={{
                                                        __html: sentenceObj.sentence,
                                                    }}></span>
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
