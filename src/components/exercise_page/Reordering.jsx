import React, { useState, useEffect } from "react";
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
    const [audioElement, setAudioElement] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [currentSplitType, setCurrentSplitType] = useState("");

    useEffect(() => {
        if (quiz && quiz.length > 0) {
            // Shuffle the quiz array once when the component mounts
            const shuffledQuizArray = ShuffleArray([...quiz]);

            // Load the shuffled quiz based on the current index
            loadQuiz(shuffledQuizArray[currentQuizIndex]);
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
        const splitType = quizData.split; // Use the split type from each quiz item

        // Store the split type for later use
        setCurrentSplitType(splitType);

        // Pair each word with its corresponding audio
        const pairedData = quizData.data.map((item, index) => ({
            word: item.value,
            audio: quizData.audio.src, // Ensure the audio is paired correctly
            answer: quizData.answer[index],
        }));

        // Shuffle the paired data
        const shuffledPairs = ShuffleArray(pairedData);

        // Separate the shuffled data back into words and audio
        const shuffledWords = shuffledPairs.map((pair) => pair.word);
        const shuffledAudioSrc = shuffledPairs.map((pair) => pair.audio);
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
        const shuffledItemsArray = ShuffleArray(uniqueItems); // Shuffle the words or letters

        setShuffledItems(shuffledItemsArray);
        setButtonsDisabled(false);

        // Update the audio source after shuffling
        const shuffledAudioElement = new Audio(`/media/exercise/mp3/${shuffledAudioSrc[0]}.mp3`);
        setAudioElement(shuffledAudioElement);

        // Store the correct answer for later validation
        setCorrectAnswer(correctAnswer);
    };

    const handleAudioPlay = () => {
        if (isPlaying) {
            audioElement.pause();
            audioElement.currentTime = 0;
            setIsPlaying(false);
        } else {
            if (audioElement) {
                audioElement.play();
                audioElement.onended = () => setIsPlaying(false);
                setIsPlaying(true);
            } else {
                console.warn("No audio element set");
            }
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
        // Retrieve the split type for the current quiz
        const splitType = currentSplitType;

        // Join the shuffled items into a single string, adding spaces between words if it's a sentence
        let joinedItems = shuffledItems.map((item) => item.value).join(splitType === "sentence" ? " " : "");

        // Normalize user input by removing punctuation and making it lowercase
        let normalizedUserAnswer = joinedItems
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
            .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
            .trim()
            .toLowerCase();

        // Normalize the correct answer for comparison
        let normalizedCorrectAnswer = correctAnswer
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
            .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
            .trim()
            .toLowerCase();

        // Compare the user's answer with the correct answer
        const isCorrect = normalizedCorrectAnswer === normalizedUserAnswer;
        setButtonsDisabled(true);

        // Ensure spaces between words are correctly added in the final display
        const finalDisplay = shuffledItems.map((item) => item.value).join(splitType === "sentence" ? " " : "");

        // Update shuffledItems to be a single item with the user's full input and the correct flag
        setShuffledItems([{ value: finalDisplay, id: "united", isCorrect }]);

        // Show the correct answer in an alert if the user's answer was incorrect
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
                        <Button variant="primary" onClick={() => handleAudioPlay(quiz[currentQuizIndex].audio.src)}>
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
