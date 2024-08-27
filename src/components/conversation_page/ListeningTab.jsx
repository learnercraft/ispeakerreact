import { useEffect, useState } from "react";
import { Accordion, Col, ListGroup, Row, Spinner } from "react-bootstrap";
import { VolumeUp, VolumeUpFill } from "react-bootstrap-icons";
import ToastNotification from "../general/ToastNotification";

const ListeningTab = ({ sentences }) => {
    const [currentAudio, setCurrentAudio] = useState(null);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [loadingIndex, setLoadingIndex] = useState(null);
    const [errorOccurred, setErrorOccurred] = useState(false);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const handlePlayPause = (index, audioSrc) => {
        if (errorOccurred) {
            return; // Prevent further actions if an error occurred
        }
        if (playingIndex === index) {
            // Stop current audio if the same index is clicked
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setCurrentAudio(null);
            setPlayingIndex(null);
        } else {
            // Stop any currently playing audio
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }

            // Set loading state
            setLoadingIndex(index);

            // Create new audio element
            const audio = new Audio(`/media/conversation/mp3/${audioSrc}.mp3`);
            audio.onerror = () => {
                audio.src = `/media/conversation/ogg/${audioSrc}.ogg`;
                audio.type = "audio/ogg";
                audio.onerror = () => {
                    setLoadingIndex(null); // Clear loading state on error
                    setErrorOccurred(true); // Prevent further retries
                    setToastMessage(
                        "Unable to play audio due to a network issue. Please check your connection and reload the page."
                    );
                    setShowToast(true);
                };
            };

            audio
                .play()
                .then(() => {
                    setCurrentAudio(audio);
                    setPlayingIndex(index);
                    setLoadingIndex(null);
                })
                .catch((err) => {
                    console.error("Error playing audio:", err);
                    setToastMessage(
                        "Unable to play audio due to a network issue. Please check your connection and reload the page."
                    );
                    setShowToast(true);
                    setLoadingIndex(null);
                    setErrorOccurred(true);
                });

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
                currentAudio.currentTime = 0;
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
                        <Accordion defaultActiveKey={index.toString()} alwaysOpen>
                            <Accordion.Item eventKey={index.toString()}>
                                <Accordion.Header>
                                    <div className="fw-semibold">{subtopic.title}</div>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ListGroup variant="flush">
                                        {subtopic.sentences.map((sentenceObj, idx) => {
                                            const uniqueIdx = `${index}-${idx}`; // Create a unique index for each sentence
                                            return (
                                                <ListGroup.Item
                                                    action
                                                    key={uniqueIdx}
                                                    onClick={() => handlePlayPause(uniqueIdx, sentenceObj.audioSrc)}
                                                    disabled={currentAudio && playingIndex !== uniqueIdx}>
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
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
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
