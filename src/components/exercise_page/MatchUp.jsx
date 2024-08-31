import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { VolumeUp, VolumeUpFill } from "react-bootstrap-icons";
import { ShuffleArray } from "../../utils/ShuffleArray";
import SortableWord from "./SortableWord";

const MatchUp = ({ quiz, onAnswer, onQuit }) => {
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [shuffledQuiz, setShuffledQuiz] = useState([]);
    const [shuffledWords, setShuffledWords] = useState([]);
    const [audioItems, setAudioItems] = useState([]);
    const [audioElement, setAudioElement] = useState(null);
    const [isPlaying, setIsPlaying] = useState(null);
    const [isCorrectArray, setIsCorrectArray] = useState([]);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [originalPairs, setOriginalPairs] = useState([]); // Store the original pairs

    useEffect(() => {
        if (quiz && quiz.length > 0) {
            const shuffledQuizzes = ShuffleArray([...quiz]);
            setShuffledQuiz(shuffledQuizzes);
            loadQuiz(shuffledQuizzes[currentQuizIndex]);
        }
    }, [quiz, currentQuizIndex]);

    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        };
    }, [audioElement]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            // Prevent scrolling while dragging on touch devices
            preventScrolling: true,
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const loadQuiz = (quizData) => {
        // Store the original pairs for checking answers
        const pairs = quizData.audio.map((audio, index) => ({
            audio: audio.src.split("_")[0].toLowerCase(),
            word: quizData.words[index].text.toLowerCase(),
        }));
        setOriginalPairs(pairs);

        // Shuffle words and audio independently
        const shuffledWordsArray = ShuffleArray([...quizData.words]);
        const shuffledAudioArray = ShuffleArray([...quizData.audio]);

        setShuffledWords(shuffledWordsArray);
        setAudioItems(shuffledAudioArray);
        setIsCorrectArray(new Array(shuffledWordsArray.length).fill(null));
        setButtonsDisabled(false);
    };

    const handleAudioPlay = (src, index) => {
        if (isPlaying === index) {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
            setIsPlaying(null);
        } else {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
            const newAudio = new Audio(`/media/exercise/mp3/${src}.mp3`);
            setAudioElement(newAudio);
            setIsPlaying(index);
            newAudio.play();
            newAudio.onended = () => setIsPlaying(null);
        }
    };

    const handleSubmit = () => {
        let correctCount = 0;
        const updatedCorrectArray = [...isCorrectArray];

        shuffledWords.forEach((word, index) => {
            const audioSrc = audioItems[index].src.split("_")[0].toLowerCase();
            const wordText = word.text.toLowerCase();

            // Compare the shuffled pair with the original pair
            const isCorrect = originalPairs.some((pair) => pair.audio === audioSrc && pair.word === wordText);

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
            const updatedCorrectArray = new Array(shuffledWords.length).fill(false);
            setIsCorrectArray(updatedCorrectArray);
            onAnswer(0, "multiple", shuffledWords.length);
        }

        if (currentQuizIndex < shuffledQuiz.length - 1) {
            setCurrentQuizIndex(currentQuizIndex + 1);
        } else {
            onQuit();
        }
    };

    return (
        <>
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
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        autoScroll={{ layoutShiftCompensation: false, enable: false }}
                        onDragEnd={({ active, over }) => {
                            if (active.id !== over.id) {
                                setShuffledWords((items) => {
                                    const oldIndex = items.findIndex((item) => item.text === active.id);
                                    const newIndex = items.findIndex((item) => item.text === over.id);
                                    return arrayMove(items, oldIndex, newIndex);
                                });
                            }
                        }}>
                        <Col xs={6} md={4}>
                            <SortableContext items={shuffledWords} strategy={verticalListSortingStrategy}>
                                {shuffledWords.map((word, index) => (
                                    <SortableWord
                                        key={word.text}
                                        word={word}
                                        index={index}
                                        isCorrect={isCorrectArray[index]}
                                        disabled={buttonsDisabled}
                                    />
                                ))}
                            </SortableContext>
                        </Col>
                    </DndContext>
                </Row>

                <div className="d-flex justify-content-end mt-3">
                    <Button variant="success" onClick={handleSubmit} disabled={buttonsDisabled}>
                        Submit
                    </Button>
                    {currentQuizIndex < shuffledQuiz.length - 1 && (
                        <Button variant="secondary" className="ms-2" onClick={handleNextQuiz}>
                            Next
                        </Button>
                    )}
                    <Button variant="danger" className="ms-2" onClick={onQuit}>
                        Quit
                    </Button>
                </div>
            </Card.Body>
        </>
    );
};

export default MatchUp;
