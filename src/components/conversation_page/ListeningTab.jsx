import { useEffect, useRef, useState } from "react";
import { Card, Col, ListGroup, Row, Spinner } from "react-bootstrap";
import { VolumeUp, VolumeUpFill } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { sonnerErrorToast } from "../../utils/sonnerCustomToast";

const ListeningTab = ({ sentences }) => {
    const { t } = useTranslation();

    const [currentAudio, setCurrentAudio] = useState(null);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [loadingIndex, setLoadingIndex] = useState(null);

    const handlePlayPause = (index, audioSrc) => {
        if (loadingIndex === index) {
            // Cancel the loading process if clicked again
            if (abortController.current) {
                abortController.current.abort();
            }
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

            // Set loading state
            setLoadingIndex(index);

            // AbortController to manage cancellation
            const controller = new AbortController();
            abortController.current = controller;
            const signal = controller.signal;

            // Fetch the audio file
            fetch(`${import.meta.env.BASE_URL}media/conversation/mp3/${audioSrc}.mp3`, { signal })
                .then((response) => response.blob())
                .then((audioBlob) => {
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);

                    // Explicitly load the audio (for iOS < 17)
                    audio.load();

                    audio.oncanplaythrough = () => {
                        setLoadingIndex(null);
                        setCurrentAudio(audio);
                        setPlayingIndex(index);
                        audio.play();
                    };

                    audio.onended = () => {
                        setCurrentAudio(null);
                        setPlayingIndex(null);
                        URL.revokeObjectURL(audioUrl);
                    };

                    audio.onerror = () => {
                        setLoadingIndex(null);
                        setCurrentAudio(null);
                        setPlayingIndex(null);
                        console.log("Audio loading error");
                        sonnerErrorToast(t("toast.audioPlayFailed"));
                    };

                    setCurrentAudio(audio);
                })
                .catch((error) => {
                    if (error.name === "AbortError") {
                        console.log("Audio loading aborted");
                    } else {
                        console.error("Error loading audio:", error);
                        sonnerErrorToast(t("toast.audioPlayFailed"));
                    }
                    setLoadingIndex(null);
                    setCurrentAudio(null);
                    setPlayingIndex(null);
                });
        }
    };

    const abortController = useRef(null);

    useEffect(() => {
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
            if (currentAudio) {
                currentAudio.pause();
                setCurrentAudio(null);
            }
        };
    }, [currentAudio]);

    return (
        <>
            <Row className="g-4">
                {sentences.map((subtopic, index) => (
                    <Col key={index}>
                        <Card className="shadow-sm">
                            <Card.Header>
                                <div className="fw-semibold">{t(subtopic.title)}</div>
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
        </>
    );
};

export default ListeningTab;
