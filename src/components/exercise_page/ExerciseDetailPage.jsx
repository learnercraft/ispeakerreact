import _ from "lodash";
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsChevronLeft } from "react-icons/bs";
import { PiArrowsCounterClockwise } from "react-icons/pi";
import LoadingOverlay from "../general/LoadingOverlay";

// Emoji SVGs import
import seedlingEmoji from "../../emojiSvg/emoji_u1f331.svg";
import partyPopperEmoji from "../../emojiSvg/emoji_u1f389.svg";
import thumbUpEmoji from "../../emojiSvg/emoji_u1f44d.svg";
import flexedBicepsEmoji from "../../emojiSvg/emoji_u1f4aa.svg";
import smilingFaceWithSmilingEyesEmoji from "../../emojiSvg/emoji_u1f60a.svg";
import rocketEmoji from "../../emojiSvg/emoji_u1f680.svg";
import railwayPathEmoji from "../../emojiSvg/emoji_u1f6e4.svg";

// Lazy load the quiz components
const DictationQuiz = lazy(() => import("./DictationQuiz"));
const MatchUp = lazy(() => import("./MatchUp"));
const Reordering = lazy(() => import("./Reordering"));
const SoundAndSpelling = lazy(() => import("./SoundAndSpelling"));
const SortingExercise = lazy(() => import("./SortingExercise"));
const OddOneOut = lazy(() => import("./OddOneOut"));
const Snap = lazy(() => import("./Snap"));
const MemoryMatch = lazy(() => import("./MemoryMatch"));

const ExerciseDetailPage = ({ heading, id, title, accent, file, onBack }) => {
    const [instructions, setInstructions] = useState([]);
    const [quiz, setQuiz] = useState([]);
    const [split] = useState("");
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [currentExerciseType, setCurrentExerciseType] = useState("");
    const [timer, setTimer] = useState(null);
    const [timeIsUp, setTimeIsUp] = useState(false);
    const [onMatchFinished, setOnMatchFinished] = useState(false); // Track if all cards in Memory Match are matched

    const [isloading, setIsLoading] = useState(true);

    const { t } = useTranslation();

    const instructionModal = useRef(null);

    const getInstructionKey = (exerciseKey, exerciseId) => {
        if (exerciseKey === "sound_n_spelling")
            return `exercise_page.exerciseInstruction.sound_n_spelling.sound`;
        return `exercise_page.exerciseInstruction.${exerciseKey}.${exerciseId}`;
    };

    const fetchInstructions = useCallback(
        (exerciseKey, exerciseId, ipaSound) => {
            const instructionKey = getInstructionKey(exerciseKey, exerciseId);
            const instructions = t(instructionKey, {
                ipaSound: ipaSound || "",
                returnObjects: true,
            });
            return Array.isArray(instructions) ? instructions : []; // Ensure it's always an array
        },
        [t]
    );

    // Helper function to handle the exercise data logic (setting quiz, instructions, etc.)
    const handleExerciseData = useCallback(
        (exerciseDetails, data, exerciseKey) => {
            const savedSettings = JSON.parse(localStorage.getItem("ispeaker"));
            const fixedTimers = {
                memory_match: 4,
                snap: 2,
            };
            const timerValue =
                fixedTimers[exerciseKey] ??
                ((savedSettings?.timerSettings?.enabled === true &&
                    savedSettings?.timerSettings?.[exerciseKey]) ||
                    0);

            setTimer(timerValue);

            let selectedAccentData;
            let combinedQuizzes = [];

            const ipaSound =
                (exerciseKey === "sound_n_spelling" && exerciseDetails.exercise.trim()) || "";
            const loadInstructions = fetchInstructions(exerciseKey, id, ipaSound);

            if (id === "random") {
                data[exerciseKey].forEach((exercise) => {
                    if (exercise.id !== "random") {
                        if (exercise.british_american) {
                            selectedAccentData = exercise.british_american[0];
                        } else {
                            selectedAccentData =
                                accent === "American English"
                                    ? exercise.american?.[0]
                                    : exercise.british?.[0];
                        }

                        if (selectedAccentData) {
                            combinedQuizzes.push(
                                ...selectedAccentData.quiz.map((quiz) => ({
                                    ...quiz,
                                    split: exercise.split,
                                }))
                            );
                        }
                    }
                });

                const uniqueShuffledCombinedQuizzes = _.shuffle(
                    Array.from(new Set(combinedQuizzes.map(JSON.stringify))).map(JSON.parse)
                );
                setQuiz(uniqueShuffledCombinedQuizzes);

                if (exerciseDetails.british_american) {
                    selectedAccentData = exerciseDetails.british_american[0];
                } else {
                    selectedAccentData =
                        accent === "American English"
                            ? exerciseDetails.american?.[0]
                            : exerciseDetails.british?.[0];
                }

                setInstructions(loadInstructions || selectedAccentData?.instructions);
            } else {
                if (exerciseDetails.british_american) {
                    selectedAccentData = exerciseDetails.british_american[0];
                } else {
                    selectedAccentData =
                        accent === "American English"
                            ? exerciseDetails.american?.[0]
                            : exerciseDetails.british?.[0];
                }

                if (selectedAccentData) {
                    setInstructions(loadInstructions || selectedAccentData.instructions);
                    setQuiz(
                        selectedAccentData.quiz.map((quiz) => ({
                            ...quiz,
                            split: exerciseDetails.split,
                        }))
                    );
                }
            }
        },
        [accent, id, fetchInstructions]
    );

    const fetchExerciseData = useCallback(async () => {
        try {
            setIsLoading(true);

            // If no cache or in Electron, fetch data from the network
            const response = await fetch(`${import.meta.env.BASE_URL}json/${file}`);
            if (!response.ok) {
                throw new Error("Failed to fetch exercise data");
            }

            const data = await response.json();
            const exerciseKey = file.replace("exercise_", "").replace(".json", "");
            const exerciseDetails = data[exerciseKey]?.find((exercise) => exercise.id === id);

            // Save fetched data to IndexedDB (excluding Electron)

            setCurrentExerciseType(exerciseKey);

            if (exerciseDetails) {
                handleExerciseData(exerciseDetails, data, exerciseKey);
            }
        } catch (error) {
            console.error("Error fetching exercise data:", error);
            alert("Error loading exercise data. Please check your Internet connection.");
        } finally {
            setIsLoading(false);
        }
    }, [id, file, handleExerciseData]);

    useEffect(() => {
        fetchExerciseData();
    }, [fetchExerciseData]);

    const handleAnswer = (correctCountOrBoolean, quizType = "single", quizAnswerNum = 1) => {
        if (quizType === "single") {
            // For single answer quizzes like DictationQuiz
            setTotalAnswered((prev) => prev + 1);
            if (correctCountOrBoolean) {
                setScore((prev) => prev + 1);
            }
        } else if (quizType === "multiple") {
            // For multiple answer quizzes like MatchUp
            setTotalAnswered((prev) => prev + quizAnswerNum);
            setScore((prev) => prev + correctCountOrBoolean);
        }
    };

    const handleQuizQuit = () => {
        setQuizCompleted(true);
        setTimeIsUp(false);
    };

    const handleQuizRestart = () => {
        setScore(0);
        setTotalAnswered(0);
        setQuizCompleted(false);
        setTimeIsUp(false);
        setOnMatchFinished(false);
    };

    const handleMatchFinished = () => {
        setOnMatchFinished(true); // Set match finished to true when all cards are revealed
    };

    const getEncouragementMessage = () => {
        if (totalAnswered === 0)
            return (
                <div>
                    {t("exercise_page.encouragementMsg.level0")}
                    <img src={rocketEmoji} className="ms-2 inline h-5 w-5" />
                </div>
            );

        const percentage = (score / totalAnswered) * 100;

        let level;
        switch (true) {
            case percentage === 100:
                level = 6;
                break;
            case percentage >= 80:
                level = 5;
                break;
            case percentage >= 60:
                level = 4;
                break;
            case percentage >= 40:
                level = 3;
                break;
            case percentage >= 20:
                level = 2;
                break;
            default:
                level = 1;
        }

        const emojis = {
            6: partyPopperEmoji,
            5: thumbUpEmoji,
            4: smilingFaceWithSmilingEyesEmoji,
            3: flexedBicepsEmoji,
            2: seedlingEmoji,
            1: railwayPathEmoji,
        };

        return (
            <div>
                {t(`exercise_page.encouragementMsg.level${level}`)}
                <img src={emojis[level]} className="ms-2 inline h-5 w-5" />
            </div>
        );
    };

    const encouragementMessage =
        quizCompleted && totalAnswered > 0 ? getEncouragementMessage() : null;

    const renderQuizComponent = () => {
        // Remove "exercise_" prefix and ".json" suffix
        const exerciseType = file.replace("exercise_", "").replace(".json", "");

        const componentsMap = {
            dictation: DictationQuiz,
            matchup: MatchUp,
            reordering: Reordering,
            sound_n_spelling: SoundAndSpelling,
            sorting: SortingExercise,
            odd_one_out: OddOneOut,
            snap: Snap,
            memory_match: MemoryMatch,
        };

        const QuizComponent = componentsMap[exerciseType];

        return (
            <Suspense fallback={<LoadingOverlay />}>
                {QuizComponent ? (
                    <QuizComponent
                        quiz={quiz}
                        instructions={instructions}
                        onAnswer={handleAnswer}
                        onQuit={handleQuizQuit}
                        {...(exerciseType === "reordering" ? { split } : {})} // Pass `split` prop for reordering
                        timer={timer}
                        setTimeIsUp={setTimeIsUp}
                        onMatchFinished={handleMatchFinished}
                    />
                ) : (
                    <div className="card-body">This quiz type is not yet implemented.</div>
                )}
            </Suspense>
        );
    };

    return (
        <>
            {isloading ? (
                <LoadingOverlay />
            ) : (
                <>
                    <h3 className="mt-4 text-2xl font-semibold">{t(heading)}</h3>
                    <p className="mb-6 text-lg">{title}</p>
                    <div className="flex flex-wrap gap-8 md:flex-nowrap">
                        <div className="w-full md:w-1/3">
                            <p className="mb-4">
                                <strong>{t("accent.accentSettings")}:</strong>{" "}
                                {accent === "American English"
                                    ? t("accent.accentAmerican")
                                    : t("accent.accentBritish")}
                            </p>

                            <dialog ref={instructionModal} className="modal">
                                <div className="modal-box">
                                    <h3 className="text-lg font-bold">
                                        {t("exercise_page.buttons.instructionBtn")}
                                    </h3>
                                    <div className="py-4">
                                        {instructions &&
                                        Array.isArray(instructions) &&
                                        instructions.length > 0 ? (
                                            instructions.map((instruction, index) => (
                                                <p
                                                    key={index}
                                                    className={`mb-2 ${
                                                        index === instructions.length - 1
                                                            ? "mb-0"
                                                            : ""
                                                    }`}
                                                >
                                                    {instruction}
                                                </p>
                                            ))
                                        ) : (
                                            <p className="mb-0">
                                                [Instructions for this type of exercise is not yet
                                                translated. Please update accordingly.]
                                            </p>
                                        )}
                                    </div>
                                    <div className="modal-action">
                                        <form method="dialog">
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={() => instructionModal.current?.close()}
                                            >
                                                {t("sound_page.closeBtn")}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </dialog>

                            <button
                                type="button"
                                className="btn btn-neutral block dark:btn-outline md:hidden"
                                onClick={() => instructionModal.current?.showModal()}
                            >
                                {t("exercise_page.buttons.expandBtn")}
                            </button>

                            <div className="collapse collapse-arrow hidden bg-base-200 md:grid dark:bg-slate-700">
                                <input type="checkbox" defaultChecked />
                                <button
                                    type="button"
                                    className="collapse-title text-start font-semibold"
                                >
                                    {t("exercise_page.buttons.expandBtn")}
                                </button>
                                <div className="collapse-content">
                                    {instructions &&
                                    Array.isArray(instructions) &&
                                    instructions.length > 0 ? (
                                        instructions.map((instruction, index) => (
                                            <p
                                                key={index}
                                                className={`mb-2 ${index === instructions.length - 1 ? "mb-0" : ""}`}
                                            >
                                                {instruction}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="mb-0">
                                            [Instructions for this type of exercise is not yet
                                            translated. Please update accordingly.]
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn btn-secondary my-8"
                                onClick={onBack}
                            >
                                <BsChevronLeft className="h-5 w-5" />{" "}
                                {t("exercise_page.buttons.backBtn")}
                            </button>
                        </div>

                        <div className="w-full md:w-2/3">
                            <div className="card card-lg card-border shadow-md dark:border-slate-600">
                                {timeIsUp || quizCompleted || onMatchFinished ? (
                                    <>
                                        <div className="card-body">
                                            <div className="card-title font-semibold">
                                                {t("exercise_page.result.cardHeading")}
                                            </div>
                                            <div className="divider divider-secondary m-0"></div>
                                            {onMatchFinished ? (
                                                <p>{t("exercise_page.result.matchUpFinished")}</p>
                                            ) : (
                                                ""
                                            )}
                                            {timeIsUp && !onMatchFinished ? (
                                                <p>{t("exercise_page.result.timeUp")}</p>
                                            ) : (
                                                ""
                                            )}
                                            {score === 0 &&
                                            totalAnswered === 0 &&
                                            currentExerciseType !== "memory_match" ? (
                                                <p>{t("exercise_page.result.notAnswered")}</p>
                                            ) : currentExerciseType !== "memory_match" ? (
                                                <>
                                                    <p>
                                                        {t("exercise_page.result.answerResult", {
                                                            score,
                                                            totalAnswered,
                                                        })}
                                                    </p>
                                                    {encouragementMessage}
                                                    <p>{t("exercise_page.result.answerBottom")}</p>
                                                </>
                                            ) : (
                                                <p>{t("exercise_page.result.answerBottom")}</p>
                                            )}
                                            <div className="card-actions justify-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-accent mt-4"
                                                    onClick={handleQuizRestart}
                                                >
                                                    <PiArrowsCounterClockwise className="h-5 w-5" />{" "}
                                                    {t("exercise_page.buttons.restartBtn")}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>{renderQuizComponent()}</>
                                )}
                            </div>

                            {timeIsUp || quizCompleted || currentExerciseType == "memory_match" ? (
                                ""
                            ) : (
                                <div className="card card-lg card-border mt-4 shadow-md dark:border-slate-600">
                                    <div className="card-body">
                                        <div className="card-title font-semibold">
                                            {t("sound_page.reviewCard")}
                                        </div>
                                        <div className="divider divider-secondary m-0"></div>
                                        {score === 0 && totalAnswered === 0 ? (
                                            ""
                                        ) : (
                                            <p>
                                                {t("exercise_page.result.answerResult", {
                                                    score,
                                                    totalAnswered,
                                                })}
                                            </p>
                                        )}

                                        {getEncouragementMessage()}

                                        {score === 0 && totalAnswered === 0 ? (
                                            ""
                                        ) : (
                                            <p>{t("exercise_page.result.tryAgainBottom")}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default ExerciseDetailPage;
