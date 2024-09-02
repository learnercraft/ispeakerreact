import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { ArrowRightCircle, Check2Circle, VolumeUp, VolumeUpFill, XCircle } from "react-bootstrap-icons";
import { ShuffleArray } from "../../utils/ShuffleArray";

const DictationQuiz = ({ quiz, onAnswer, onQuit }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [showValidation, setShowValidation] = useState(false);
    const [validationVariant, setValidationVariant] = useState("danger");
    const [validationMessage, setValidationMessage] = useState("");
    const [isTextboxDisabled, setIsTextboxDisabled] = useState(false);
    const [shuffledQuiz, setShuffledQuiz] = useState([]);
    const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const audioRef = useRef(null);

    useEffect(() => {
        // Shuffle the quiz array when the component mounts
        if (quiz && quiz.length > 0) {
            const shuffled = ShuffleArray([...quiz]);
            setShuffledQuiz(shuffled);
        }

        return () => {
            // Cleanup: Stop audio when component unmounts
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [quiz]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!shuffledQuiz[currentQuestionIndex]) return; // Safeguard against undefined access

        // Find the word with the textbox
        const textboxWord = shuffledQuiz[currentQuestionIndex].words.find((word) => word.textbox);

        if (!textboxWord) {
            // If no textbox is found, prevent the function from continuing
            console.error("No textbox found in the current question.");
            return;
        }

        const correctAnswer = textboxWord.textbox.toLowerCase();
        const isCorrect = answer.trim().toLowerCase() === correctAnswer;

        onAnswer(isCorrect, "single"); // Notify parent of the answer
        setIsTextboxDisabled(true); // Disable the textbox
        setIsSubmitButtonEnabled(true);
        setHasAnswered(true);

        if (isCorrect) {
            setShowValidation(true);
            setValidationVariant("success");
            setValidationMessage("");
        } else {
            setValidationVariant("danger");
            setValidationMessage(
                <span>
                    Correct answer: <span className="fw-bold fst-italic">{correctAnswer}</span>
                </span>
            );
            setShowValidation(true);
        }
    };

    const nextQuestion = () => {
        if ((!hasAnswered && answer.trim() === "") || !hasAnswered) {
            onAnswer(false, "single");
        }

        // Stop and reset audio if it's playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reset the audio to the start
            audioRef.current.removeAttribute("src"); // Remove the audio source attribute
            audioRef.current.load(); // Reload the audio element to reset the state
            setIsPlaying(false); // Reset the playing state
            setIsLoading(false);
        }

        if (currentQuestionIndex < shuffledQuiz.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setAnswer("");
            setIsTextboxDisabled(false);
            setShowValidation(false);
            setIsSubmitButtonEnabled(false);
            setHasAnswered(false); // Reset for the next question
        } else {
            onQuit(); // Notify parent that the quiz is finished
        }
    };

    const handleNext = () => {
        nextQuestion(); // Move to the next question
    };

    const handleQuit = () => {
        onQuit();
    };

    const handleAudioPlay = () => {
        if (!shuffledQuiz[currentQuestionIndex]) return; // Safeguard against undefined access

        if (isPlaying) {
            // Stop the current audio if it's playing
            if (audioRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
            }
            return;
        }

        const audio = new Audio();
        const audioSrc = `/media/exercise/mp3/${shuffledQuiz[currentQuestionIndex].audio.src}.mp3`;

        audioRef.current = audio;

        audio.src = audioSrc;
        setIsLoading(true);

        audio.oncanplaythrough = () => {
            setIsLoading(false);
            setIsPlaying(true);
            audio.play();
        };

        audio.onended = () => {
            setIsPlaying(false);
        };

        audio.onerror = () => {
            setIsLoading(false);
            console.error("Audio error occurred. Unable to play the audio.");
        };

        audio.onpause = () => {
            setIsPlaying(false);
        };

        audioRef.current.load(); // Load the new audio source
    };

    const renderWords = () => {
        if (!shuffledQuiz[currentQuestionIndex]) return null; // Safeguard against undefined access

        const currentWords = shuffledQuiz[currentQuestionIndex].words;

        return currentWords.map((word, index) => {
            // Check if the current word has both `value` and `textbox`
            const hasValueAndTextbox = currentWords.some((w) => w.value) && currentWords.some((w) => w.textbox);

            if (word.value) {
                return <span key={index}>{word.value}</span>;
            }

            if (word.textbox) {
                return (
                    <Form.Control
                        key={index}
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        isInvalid={validationVariant === "danger" && showValidation}
                        isValid={validationVariant === "success" && showValidation} // Show valid checkmark when correct
                        autoComplete="off"
                        spellCheck="false"
                        disabled={isTextboxDisabled} // Disable the textbox when showing validation
                        className={`text-center${hasValueAndTextbox ? " mx-2" : ""}`} // Apply class only if both value and textbox are present
                        style={hasValueAndTextbox ? { minWidth: "30%", width: "45%", display: "inline-block" } : {}} // Set width to 40% only if both are present
                    />
                );
            }

            return null;
        });
    };

    return (
        <>
            <Card.Header className="fw-semibold">Question #{currentQuestionIndex + 1}</Card.Header>
            <Card.Body>
                <Row>
                    <Col xs={12} className="d-flex justify-content-center">
                        <Button variant="primary" onClick={handleAudioPlay} className="mb-3" disabled={isLoading}>
                            {isLoading ? (
                                <Spinner animation="border" size="sm" />
                            ) : isPlaying ? (
                                <VolumeUpFill />
                            ) : (
                                <VolumeUp />
                            )}
                        </Button>
                    </Col>
                    <Col xs={12}>
                        <Form onSubmit={handleSubmit} className="text-center">
                            <Form.Group controlId="formAnswer">
                                <div>{renderWords()}</div>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                {showValidation && validationVariant === "danger" && (
                    <Alert className="mt-4" variant="info">
                        {validationMessage}
                    </Alert>
                )}
                <div className="d-flex justify-content-end mt-3">
                    <Button
                        variant="success"
                        type="submit"
                        className="mt-3"
                        disabled={isSubmitButtonEnabled}
                        onClick={handleSubmit}>
                        <Check2Circle /> Check
                    </Button>
                    {currentQuestionIndex < quiz.length - 1 && (
                        <Button variant="secondary" className="mt-3 ms-2" onClick={handleNext}>
                            <ArrowRightCircle /> Next
                        </Button>
                    )}
                    <Button variant="danger" className="mt-3 ms-2" onClick={handleQuit}>
                        <XCircle /> Quit
                    </Button>
                </div>
            </Card.Body>
        </>
    );
};

export default DictationQuiz;
