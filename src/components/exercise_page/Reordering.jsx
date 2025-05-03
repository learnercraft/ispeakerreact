import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import he from "he";
import _ from "lodash";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoInformationCircleOutline, IoVolumeHigh, IoVolumeHighOutline } from "react-icons/io5";
import { LiaCheckCircle, LiaChevronCircleRightSolid, LiaTimesCircle } from "react-icons/lia";
import { ShuffleArray } from "../../utils/ShuffleArray";
import { sonnerErrorToast } from "../../utils/sonnerToast";
import useCountdownTimer from "../../utils/useCountdownTimer";
import SortableWord from "./SortableWord";

const Reordering = ({ quiz, onAnswer, onQuit, timer, setTimeIsUp }) => {
    const [currentQuestionIndex, setcurrentQuestionIndex] = useState(0);
    const [shuffledItems, setShuffledItems] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading state for audio
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [currentSplitType, setCurrentSplitType] = useState("");
    const [currentAudioSrc, setCurrentAudioSrc] = useState("");
    const [shuffledQuizArray, setShuffledQuizArray] = useState([]);

    const { formatTime, clearTimer, startTimer } = useCountdownTimer(timer, () =>
        setTimeIsUp(true)
    );

    const { t } = useTranslation();

    const filterAndShuffleQuiz = (quiz) => {
        const uniqueQuiz = _.uniqWith(quiz, _.isEqual);

        // Shuffle the unique items
        return ShuffleArray(uniqueQuiz);
    };

    // Use a ref to manage the audio element
    const audioRef = useRef(null);

    const loadQuiz = useCallback((quizData) => {
        const splitType = quizData.split;
        setCurrentSplitType(splitType);

        const pairedData = quizData.data.map((item, index) => ({
            word: item.value,
            audio: quizData.audio.src,
            answer: quizData.answer[index],
        }));

        const shuffledPairs = ShuffleArray(pairedData);
        const shuffledWords = shuffledPairs.map((pair) => pair.word);
        const correctAnswer = shuffledPairs
            .map((pair) => pair.answer)
            .join(splitType === "sentence" ? " " : "");

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

        setCurrentAudioSrc(
            splitType === "sentence"
                ? `${import.meta.env.BASE_URL}media/exercise/mp3/sentence/${shuffledPairs[0].audio}.mp3`
                : `${import.meta.env.BASE_URL}media/word/mp3/${shuffledPairs[0].audio}.mp3`
        );
        setCorrectAnswer(correctAnswer);
    }, []);

    // Clean up the audio element
    const stopAudio = () => {
        if (audioRef.current) {
            // Stop the audio and remove event listeners
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reset the audio to the beginning

            // Remove event listeners to prevent them from triggering after the source is cleared
            audioRef.current.oncanplaythrough = null;
            audioRef.current.onended = null;
            audioRef.current.onerror = null;

            setIsPlaying(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (quiz && quiz.length > 0) {
            // Filter out unique items and shuffle the quiz array
            const uniqueShuffledQuiz = filterAndShuffleQuiz(quiz);
            setShuffledQuizArray(uniqueShuffledQuiz);
            // Reset currentQuestionIndex to 0
            setcurrentQuestionIndex(0);
        }
    }, [quiz]);

    useEffect(() => {
        if (shuffledQuizArray.length > 0 && currentQuestionIndex < shuffledQuizArray.length) {
            loadQuiz(shuffledQuizArray[currentQuestionIndex]);
        }
    }, [shuffledQuizArray, currentQuestionIndex, loadQuiz]);

    useEffect(() => {
        return () => {
            stopAudio();
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

    const handleAudioPlay = () => {
        if (!audioRef.current) {
            // Initialize the audio element if not already set
            audioRef.current = new Audio();
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setIsLoading(true); // Start loading

            // Set the audio source and load the audio
            audioRef.current.src = currentAudioSrc;
            audioRef.current.load();

            // Play the audio once it's ready
            audioRef.current.oncanplaythrough = () => {
                setIsLoading(false); // Stop loading spinner
                audioRef.current.play();
                setIsPlaying(true);
                startTimer();
            };

            // Handle the audio ended event
            audioRef.current.onended = () => {
                setIsPlaying(false);
            };

            // Handle errors during loading
            audioRef.current.onerror = () => {
                setIsLoading(false); // Stop loading spinner
                setIsPlaying(false); // Reset playing state
                console.error("Error playing audio.");
                sonnerErrorToast(t("toast.audioPlayFailed"));
            };
        }
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        startTimer();
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
        let joinedItems = shuffledItems
            .map((item) => item.value)
            .join(splitType === "sentence" ? " " : "");

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

        stopAudio();

        if (currentQuestionIndex < shuffledQuizArray.length - 1) {
            setcurrentQuestionIndex(currentQuestionIndex + 1);
            setShowAlert(false);
            loadQuiz(shuffledQuizArray[currentQuestionIndex + 1]);
        } else {
            onQuit();
            stopAudio();
            clearTimer();
        }
    };

    const handleQuit = () => {
        onQuit();
        stopAudio();
        clearTimer();
    };

    return (
        <>
            <div className="card-body">
                <div className="text-lg font-semibold">
                    {timer > 0 ? (
                        <div className="flex items-center">
                            <div className="flex-1 md:flex-none">
                                {t("exercise_page.questionNo")} #{currentQuestionIndex + 1}
                            </div>
                            <div className="ms-auto flex justify-end">
                                {t("exercise_page.timer")} {formatTime()}
                            </div>
                        </div>
                    ) : (
                        <p>
                            {t("exercise_page.questionNo")} #{currentQuestionIndex + 1}
                        </p>
                    )}
                </div>
                <div className="divider divider-secondary m-0"></div>

                <div className="my-3 flex w-full justify-center">
                    <button
                        type="button"
                        title={t("exercise_page.buttons.playAudioBtn")}
                        className="btn btn-circle btn-success"
                        onClick={handleAudioPlay}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner loading-md"></span>
                        ) : isPlaying ? (
                            <IoVolumeHigh className="h-6 w-6" />
                        ) : (
                            <IoVolumeHighOutline className="h-6 w-6" />
                        )}
                    </button>
                </div>

                <div className="my-3 flex grow flex-row flex-wrap justify-center gap-2">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={shuffledItems}
                            strategy={horizontalListSortingStrategy}
                        >
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
                                            shuffledItems.find((item) => item.id === activeId)
                                                ?.value || ""
                                        ),
                                        id: activeId,
                                    }}
                                    isOverlay={true}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>

                {showAlert && (
                    <div className="flex justify-center">
                        <div
                            role="alert"
                            className="alert alert-info my-4 flex w-full gap-1 md:gap-2 lg:w-4/5 xl:w-3/5"
                        >
                            <IoInformationCircleOutline className="h-6 w-6" />
                            <div className="w-4/5 lg:w-auto">
                                <h3>{t("exercise_page.result.correctAnswer")}</h3>
                                <p className="text-xl font-bold italic">{correctAnswer}</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="card-actions justify-center">
                    <div className="my-3 flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={buttonsDisabled}
                        >
                            <LiaCheckCircle className="h-6 w-6" />{" "}
                            {t("exercise_page.buttons.checkBtn")}
                        </button>
                        {currentQuestionIndex < quiz.length - 1 && (
                            <button
                                type="button"
                                className="btn btn-accent"
                                onClick={handleNextQuiz}
                            >
                                <LiaChevronCircleRightSolid className="h-6 w-6" />{" "}
                                {t("exercise_page.buttons.nextBtn")}
                            </button>
                        )}
                        <button type="button" className="btn btn-error" onClick={handleQuit}>
                            <LiaTimesCircle className="h-6 w-6" />{" "}
                            {t("exercise_page.buttons.quitBtn")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

Reordering.propTypes = {
    quiz: PropTypes.arrayOf(PropTypes.object).isRequired,
    onAnswer: PropTypes.func.isRequired,
    onQuit: PropTypes.func.isRequired,
    timer: PropTypes.number.isRequired,
    setTimeIsUp: PropTypes.func.isRequired,
};

export default Reordering;
