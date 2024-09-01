import React, { useState, useEffect, useRef } from "react";
import {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragOverlay,
    closestCenter,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Alert, Button, Card, Col, Row, Stack } from "react-bootstrap";
import { VolumeUp, VolumeUpFill } from "react-bootstrap-icons";
import SortableWord from "./SortableWord";
import he from "he";
import { ShuffleArray } from "../../utils/ShuffleArray";

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Call handler right away so state gets updated with initial window size

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
};

const Reordering = ({ quiz, onAnswer, onQuit, split }) => {
    const size = useWindowSize();
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [shuffledItems, setShuffledItems] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [currentSplitType, setCurrentSplitType] = useState("");
    
    // Use a ref to manage the audio element
    const audioRef = useRef(null);

    useEffect(() => {
        if (quiz && quiz.length > 0) {
            // Shuffle the quiz array once when the component mounts
            const shuffledQuizArray = ShuffleArray([...quiz]);
            loadQuiz(shuffledQuizArray[currentQuizIndex]);
        }
    }, [quiz, currentQuizIndex]);

    useEffect(() => {
        return () => {
            // Clean up the audio element
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = ""; // Set the src to empty to release the resource
            }
        };
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            preventScrolling: true,
        })
    );

    const generateUniqueItems = (items) => {
        return items.map((item, index) => ({
            id: `${item}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            value: item,
        }));
    };

    const loadQuiz = (quizData) => {
        const splitType = quizData.split;
        setCurrentSplitType(splitType);

        const pairedData = quizData.data.map((item, index) => ({
            word: item.value,
            audio: quizData.audio.src,
            answer: quizData.answer[index],
        }));

        const shuffledPairs = ShuffleArray(pairedData);
        const shuffledWords = shuffledPairs.map((pair) => pair.word);
        const correctAnswer = shuffledPairs.map((pair) => pair.answer).join(splitType === "sentence" ? " " : "");

        let itemsToShuffle;
        if (splitType === "sentence") {
            itemsToShuffle = shuffledWords[0].split(" "); // Split into words for sentences
        } else if (splitType === "word") {
            itemsToShuffle = shuffledWords[0].split(""); // Split into letters for words
        } else {
            console.warn("Unexpected split type, defaulting to splitting by letters");
            itemsToShuffle = shuffledWords[0].split("");
        }

        const uniqueItems = generateUniqueItems(itemsToShuffle);
        const shuffledItemsArray = ShuffleArray(uniqueItems);
        setShuffledItems(shuffledItemsArray);
        setButtonsDisabled(false);

        // Set the audio src
        if (audioRef.current) {
            audioRef.current.src = `/media/exercise/mp3/${shuffledPairs[0].audio}.mp3`;
        } else {
            audioRef.current = new Audio(`/media/exercise/mp3/${shuffledPairs[0].audio}.mp3`);
        }

        setCorrectAnswer(correctAnswer);
    };

    const handleAudioPlay = () => {
        if (!audioRef.current) {
            console.warn("No audio element set");
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);

            audioRef.current.onended = () => setIsPlaying(false);
        }
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
    };

    const handleDragEnd = ({ active, over }) => {
        setActiveId(null);

        if (over && active.id !== over.id) {
            setShuffledItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSubmit = () => {
        const splitType = currentSplitType;
    
        // Join the shuffled items into a single string
        let joinedItems = shuffledItems.map((item) => item.value).join(splitType === "sentence" ? " " : "");
    
        // Normalize user answer
        let normalizedUserAnswer = joinedItems
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
            .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
            .trim()
            .toLowerCase();
    
        // Normalize correct answer
        let normalizedCorrectAnswer = correctAnswer
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
            .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
            .trim()
            .toLowerCase();
    
        // Determine if the user's answer is correct
        const isCorrect = normalizedCorrectAnswer === normalizedUserAnswer;
        setButtonsDisabled(true);
    
        // Determine the final display text
        const finalDisplay = isCorrect && splitType === "sentence" ? correctAnswer : joinedItems;
    
        // Update the shuffledItems to display either the user input or the correct answer
        setShuffledItems([{ value: finalDisplay, id: "united", isCorrect }]);
    
        // Show the correct answer alert if the user's answer was incorrect
        if (!isCorrect) {
            setShowAlert(true);
        }
    
        onAnswer(isCorrect ? 1 : 0, "single");
    };
    

    const handleNextQuiz = () => {
        if (!buttonsDisabled) {
            onAnswer(0, "single");
        }

        if (currentQuizIndex < quiz.length - 1) {
            setCurrentQuizIndex(currentQuizIndex + 1);
            setShowAlert(false);
        } else {
            onQuit();
        }
    };

    return (
        <>
            <Card.Header className="fw-semibold">Question #{currentQuizIndex + 1}</Card.Header>
            <Card.Body>
                <Row className="d-flex justify-content-center g-3">
                    <Col xs={12} className="d-flex justify-content-center">
                        <Button variant="primary" onClick={handleAudioPlay}>
                            {isPlaying ? <VolumeUpFill /> : <VolumeUp />}
                        </Button>
                    </Col>
                    <Col xs={12}>
                        <div className="d-flex justify-content-center flex-row flex-wrap gap-2">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}>
                                <SortableContext items={shuffledItems} strategy={horizontalListSortingStrategy}>
                                    {shuffledItems.map((item) => (
                                        <SortableWord
                                            key={item.id}
                                            word={{ text: he.encode(item.value), id: item.id }}
                                            disabled={buttonsDisabled}
                                            isCorrect={item.isCorrect ?? null}
                                        />
                                    ))}
                                </SortableContext>
                                <DragOverlay>
                                    {activeId ? (
                                        <SortableWord
                                            key={activeId}
                                            word={{
                                                text: he.encode(
                                                    shuffledItems.find((item) => item.id === activeId)?.value || ""
                                                ),
                                                id: activeId,
                                            }}
                                            isOverlay={true}
                                        />
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        </div>
                    </Col>
                </Row>
                {showAlert && (
                    <Alert variant="info" className="mt-2">
                        Correct answer: <span className="fw-bold fst-italic">{correctAnswer}</span>
                    </Alert>
                )}
                <div className="d-flex justify-content-end mt-3">
                    <Stack direction="horizontal" gap={2}>
                        <Button variant="success" onClick={handleSubmit} disabled={buttonsDisabled}>
                            Submit
                        </Button>
                        {currentQuizIndex < quiz.length - 1 && (
                            <Button variant="secondary" onClick={handleNextQuiz}>
                                Next
                            </Button>
                        )}
                        <Button variant="danger" onClick={onQuit}>
                            Quit
                        </Button>
                    </Stack>
                </div>
            </Card.Body>
        </>
    );
};

export default Reordering;
