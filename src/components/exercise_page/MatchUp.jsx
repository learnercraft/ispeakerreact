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
        const shuffled = ShuffleArray([...quizData.words]);
        setShuffledWords(shuffled);
        setAudioItems(quizData.audio);
        setIsCorrectArray(new Array(shuffled.length).fill(null));
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
                </Row>
                <div className="d-flex justify-content-end mt-3">
                    <Button variant="success" onClick={handleSubmit}>
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
        </DndContext>
    );
};

export default MatchUp;
