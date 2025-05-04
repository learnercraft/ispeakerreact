import {
    closestCenter,
    DndContext,
    DragOverlay,
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
import _ from "lodash";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoVolumeHigh, IoVolumeHighOutline } from "react-icons/io5";
import { LiaCheckCircle, LiaChevronCircleRightSolid, LiaTimesCircle } from "react-icons/lia";
import { ShuffleArray } from "../../utils/ShuffleArray";
import { sonnerErrorToast } from "../../utils/sonnerCustomToast";
import useCountdownTimer from "../../utils/useCountdownTimer";
import SortableWord from "./SortableWord";

const MatchUp = ({ quiz, timer, onAnswer, onQuit, setTimeIsUp }) => {
    const [currentQuestionIndex, setcurrentQuestionIndex] = useState(0);
    const [shuffledQuiz, setShuffledQuiz] = useState([]);
    const [shuffledWords, setShuffledWords] = useState([]);
    const [audioItems, setAudioItems] = useState([]);
    const [isPlaying, setIsPlaying] = useState(null);
    const [isLoading, setIsLoading] = useState([]);
    const [isCorrectArray, setIsCorrectArray] = useState([]);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [originalPairs, setOriginalPairs] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const { formatTime, clearTimer, startTimer } = useCountdownTimer(timer, () =>
        setTimeIsUp(true)
    );
    const [exerciseType, setExerciseType] = useState("");

    const audioRef = useRef(null);

    const { t } = useTranslation();

    const filterAndShuffleQuiz = useCallback((quiz) => {
        const uniqueQuiz = _.uniqWith(quiz, _.isEqual);
        return ShuffleArray(uniqueQuiz);
    }, []);

    const loadQuiz = useCallback((quizData) => {
        setExerciseType(quizData.type);
        // Store the original pairs for checking answers
        const pairs = quizData.audio.map((audio, index) => ({
            audio: audio.src.split("_")[0].toLowerCase(),
            word: quizData.words[index].text.toLowerCase(),
        }));
        setOriginalPairs(pairs);

        // Generate unique IDs for each word
        const wordsWithIds = quizData.words.map((word, index) => ({
            ...word,
            id: `${word.text}-${index}-${Math.random().toString(36).substring(2, 11)}`,
        }));

        // Shuffle words and audio independently
        const shuffledWordsArray = ShuffleArray(wordsWithIds);
        const shuffledAudioArray = ShuffleArray(quizData.audio);

        setShuffledWords(shuffledWordsArray);
        setAudioItems(shuffledAudioArray);
        setIsCorrectArray(new Array(shuffledWordsArray.length).fill(null));
        setButtonsDisabled(false);
    }, []);

    useEffect(() => {
        if (quiz?.length > 0) {
            setShuffledQuiz(filterAndShuffleQuiz(quiz));
            setcurrentQuestionIndex(0);
        }
    }, [quiz, filterAndShuffleQuiz]);

    useEffect(() => {
        if (shuffledQuiz.length > 0 && currentQuestionIndex < shuffledQuiz.length) {
            loadQuiz(shuffledQuiz[currentQuestionIndex]);
            setIsLoading(new Array(shuffledQuiz[currentQuestionIndex].audio.length).fill(false));
        }
    }, [shuffledQuiz, currentQuestionIndex, loadQuiz]);

    useEffect(() => {
        // Initialize the audioRef
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

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

    const handleAudioPlay = (src, index) => {
        // Pause the current audio if it's playing
        if (isPlaying !== null) {
            audioRef.current.pause();
            setIsPlaying(null);
        }

        // Reset all loading states before setting the new one
        setIsLoading((prev) => prev.map(() => false));

        // Start the new audio if it's not already playing
        if (isPlaying !== index) {
            const audioSrc =
                exerciseType === "comprehension" || exerciseType === "sentence"
                    ? `${import.meta.env.BASE_URL}media/exercise/mp3/sentence/${src}.mp3`
                    : `${import.meta.env.BASE_URL}media/word/mp3/${src}.mp3`;
            audioRef.current.src = audioSrc; // Set the new audio source

            // Set loading state for this specific button
            setIsLoading((prev) => {
                const newLoadingState = [...prev];
                newLoadingState[index] = true;
                return newLoadingState;
            });

            audioRef.current.play().then(() => {
                setIsPlaying(index);
                startTimer();
                // Disable loading state for this specific button
                setIsLoading((prev) => {
                    const newLoadingState = [...prev];
                    newLoadingState[index] = false;
                    return newLoadingState;
                });
            });

            audioRef.current.onended = () => setIsPlaying(null);
            audioRef.current.onerror = () => {
                setIsPlaying(null);
                // Disable loading state in case of error
                setIsLoading((prev) => {
                    const newLoadingState = [...prev];
                    newLoadingState[index] = false;
                    return newLoadingState;
                });
                console.error("Error loading the audio file:", audioSrc);
                sonnerErrorToast(t("toast.audioPlayFailed"));
            };
        }
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reset the audio to the start
            audioRef.current.removeAttribute("src"); // Remove the audio source attribute
            audioRef.current.load(); // Reload the audio element to reset the state
            setIsPlaying(false); // Reset the playing state
            setIsLoading(false);
        }
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        startTimer();
    };

    const handleDragEnd = ({ active, over }) => {
        setActiveId(null);

        if (active.id !== over.id) {
            setShuffledWords((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSubmit = () => {
        let correctCount = 0;
        const updatedCorrectArray = [...isCorrectArray];

        shuffledWords.forEach((word, index) => {
            const audioSrc = audioItems[index].src.split("_")[0].toLowerCase();
            const wordText = word.text.toLowerCase();

            // Compare the shuffled pair with the original pair using the word text
            const isCorrect = originalPairs.some(
                (pair) => pair.audio === audioSrc && pair.word === wordText
            );

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

        // Reset audio state and element
        stopAudio();

        if (currentQuestionIndex < shuffledQuiz.length - 1) {
            setcurrentQuestionIndex(currentQuestionIndex + 1);
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
                <div className="divider divider-secondary mt-0 mb-3"></div>
                <div className="my-3 flex items-center justify-center gap-4">
                    {/* Audio Buttons Column */}
                    <div className="flex w-auto justify-end lg:w-2/5 2xl:w-1/3">
                        <div className="flex flex-col items-center gap-4">
                            {audioItems.map((audio, index) => (
                                <div key={index}>
                                    <button
                                        type="button"
                                        title={t("exercise_page.buttons.playAudioBtn")}
                                        className="btn btn-lg btn-circle btn-success"
                                        onClick={() => handleAudioPlay(audio.src, index)}
                                        disabled={isLoading[index]}
                                    >
                                        {isLoading[index] ? (
                                            <span className="loading loading-spinner loading-md"></span>
                                        ) : isPlaying === index ? (
                                            <IoVolumeHigh className="h-6 w-6" />
                                        ) : (
                                            <IoVolumeHighOutline className="h-6 w-6" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex w-full lg:w-3/4 2xl:w-2/3">
                        {/* Sortable Words Column */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            autoScroll={{ layoutShiftCompensation: false, enable: false }}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex w-full flex-col justify-start gap-4 lg:w-3/4">
                                <SortableContext
                                    items={shuffledWords.map((word) => word.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {shuffledWords.map((word, index) => (
                                        <SortableWord
                                            key={word.id}
                                            word={word}
                                            index={index}
                                            isCorrect={isCorrectArray[index]}
                                            disabled={buttonsDisabled}
                                        />
                                    ))}
                                </SortableContext>
                                <DragOverlay>
                                    {activeId ? (
                                        <SortableWord
                                            word={{
                                                id: activeId,
                                                text: shuffledWords.find(
                                                    (item) => item.id === activeId
                                                )?.text,
                                            }}
                                            isOverlay={true} // Pass a prop to indicate it's in the overlay
                                        />
                                    ) : null}
                                </DragOverlay>
                            </div>
                        </DndContext>
                    </div>
                </div>

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
                        {currentQuestionIndex < shuffledQuiz.length - 1 && (
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

MatchUp.propTypes = {
    quiz: PropTypes.arrayOf(PropTypes.object).isRequired,
    timer: PropTypes.number.isRequired,
    onAnswer: PropTypes.func.isRequired,
    onQuit: PropTypes.func.isRequired,
    setTimeIsUp: PropTypes.func.isRequired,
};

export default MatchUp;
