import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Button, Card, Row, Col } from "react-bootstrap";
import he from "he";
import { isTouchDevice } from "../../utils/isTouchDevice";
import { ShuffleArray } from "../../utils/ShuffleArray";
import { VolumeUp, VolumeUpFill } from "react-bootstrap-icons";

const ItemTypes = {
    WORD: "word",
};

const DraggableWord = ({ word, index, moveWord, isCorrect, disabled }) => {
    const [, ref] = useDrag({
        type: ItemTypes.WORD,
        item: { index },
        canDrag: !disabled,
    });

    const [, drop] = useDrop({
        accept: ItemTypes.WORD,
        hover: (draggedItem) => {
            if (!disabled && draggedItem.index !== index) {
                moveWord(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    return (
        <Button
            ref={(node) => ref(drop(node))}
            variant={isCorrect === null ? "light" : isCorrect ? "success" : "danger"}
            className="mb-3 w-100"
            style={{
                cursor: disabled ? "not-allowed" : "move",
            }}
            disabled={disabled}>
            {he.decode(word.text)}
        </Button>
    );
};

const MatchUp = ({ quiz, instructions, onAnswer, onQuit }) => {
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [shuffledQuiz, setShuffledQuiz] = useState([]);
    const [shuffledWords, setShuffledWords] = useState([]);
    const [audioItems, setAudioItems] = useState([]);
    const [audioElement, setAudioElement] = useState(null);
    const [isPlaying, setIsPlaying] = useState(null);
    const [isCorrectArray, setIsCorrectArray] = useState([]);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

    useEffect(() => {
        if (quiz && quiz.length > 0) {
            // Shuffle the entire quiz array first
            const shuffledQuizzes = ShuffleArray([...quiz]);
            setShuffledQuiz(shuffledQuizzes);
            loadQuiz(shuffledQuizzes[currentQuizIndex]);
        }
    }, [quiz, currentQuizIndex]);

    useEffect(() => {
        return () => {
            // Stop audio when the component unmounts
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        };
    }, [audioElement]);

    const loadQuiz = (quizData) => {
        const shuffled = ShuffleArray([...quizData.words]);
        setShuffledWords(shuffled);
        setAudioItems(quizData.audio);
        setIsCorrectArray(new Array(shuffled.length).fill(null)); // Reset correctness array
        setButtonsDisabled(false);
    };

    const moveWord = (fromIndex, toIndex) => {
        const updatedWords = [...shuffledWords];
        const [movedWord] = updatedWords.splice(fromIndex, 1);
        updatedWords.splice(toIndex, 0, movedWord);
        setShuffledWords(updatedWords);
    };

    const handleAudioPlay = (src, index) => {
        if (isPlaying === index) {
            // If the same audio is playing, stop it
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0; // Reset to start
            }
            setIsPlaying(null); // Reset the playing state
        } else {
            // If a different audio is playing, stop it first
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0; // Reset the previous audio
            }

            // Create a new audio element and play it
            const newAudio = new Audio(`/media/exercise/mp3/${src}.mp3`);
            setAudioElement(newAudio); // Save the new audio element to state
            setIsPlaying(index);
            newAudio.play();
            newAudio.onended = () => setIsPlaying(null); // Reset after playback
        }
    };

    const handleSubmit = () => {
        let correctCount = 0;
        const updatedCorrectArray = [...isCorrectArray];

        shuffledWords.forEach((word, index) => {
            // Ensure the correct matching logic
            const audioSrc = audioItems[index].src.split("_")[0];
            const isCorrect = word.text.toLowerCase() === audioSrc.toLowerCase();
            updatedCorrectArray[index] = isCorrect;

            if (isCorrect) {
                correctCount++;
            }
        });

        setIsCorrectArray(updatedCorrectArray);
        setButtonsDisabled(true);
        onAnswer(correctCount, "multiple", shuffledWords.length);
    };

    const handleNextQuiz = () => {
        if (!buttonsDisabled) {
            // If the user clicks "Next" without submitting, count all answers as incorrect
            const updatedCorrectArray = new Array(shuffledWords.length).fill(false);
            setIsCorrectArray(updatedCorrectArray);

            // Update the parent with 0 correct answers out of the total number of questions
            onAnswer(0, "multiple", shuffledWords.length);
        }

        if (currentQuizIndex < shuffledQuiz.length - 1) {
            setCurrentQuizIndex(currentQuizIndex + 1);
        } else {
            onQuit(); // End of the quiz set
        }
    };

    return (
        <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
            <Card.Header className="fw-semibold">Question #{currentQuizIndex + 1}</Card.Header>
            <Card.Body>
                <Row className="d-flex justify-content-center">
                    <Col xs={2} md={2} className="d-flex justify-content-end">
                        <div>
                            {audioItems.map((audio, index) => (
                                <div key={index} className="mb-3">
                                    <Button variant="primary" onClick={() => handleAudioPlay(audio.src, index)}>
                                        {isPlaying === index ? <VolumeUpFill /> : <VolumeUp />}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Col>
                    <Col xs={6} md={4}>
                        {shuffledWords.map((word, index) => (
                            <DraggableWord
                                key={word.text}
                                word={word}
                                index={index}
                                moveWord={moveWord}
                                isCorrect={isCorrectArray[index]}
                                disabled={buttonsDisabled}
                            />
                        ))}
                    </Col>
                </Row>
                <div className="d-flex justify-content-end mt-3">
                    <Button variant="success" onClick={handleSubmit}>
                        Submit
                    </Button>
                    {currentQuizIndex < quiz.length - 1 && (
                        <Button variant="secondary" className="ms-2" onClick={handleNextQuiz}>
                            Next
                        </Button>
                    )}
                    <Button variant="danger" className="ms-2" onClick={onQuit}>
                        Quit
                    </Button>
                </div>
            </Card.Body>
        </DndProvider>
    );
};

export default MatchUp;
