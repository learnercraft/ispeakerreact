import _ from "lodash";
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsChevronLeft } from "react-icons/bs";
import { PiArrowsCounterClockwise } from "react-icons/pi";
import LoadingOverlay from "../general/LoadingOverlay.js";

// Emoji SVGs import
import seedlingEmoji from "../../emojiSvg/emoji_u1f331.svg";
import partyPopperEmoji from "../../emojiSvg/emoji_u1f389.svg";
import thumbUpEmoji from "../../emojiSvg/emoji_u1f44d.svg";
import flexedBicepsEmoji from "../../emojiSvg/emoji_u1f4aa.svg";
import smilingFaceWithSmilingEyesEmoji from "../../emojiSvg/emoji_u1f60a.svg";
import rocketEmoji from "../../emojiSvg/emoji_u1f680.svg";
import railwayPathEmoji from "../../emojiSvg/emoji_u1f6e4.svg";

// Lazy load the quiz components
const DictationQuiz = lazy(() => import("./DictationQuiz.js"));
const MatchUp = lazy(() => import("./MatchUp.js"));
const Reordering = lazy(() => import("./Reordering.js"));
const SoundAndSpelling = lazy(() => import("./SoundAndSpelling.js"));
const SortingExercise = lazy(() => import("./SortingExercise.js"));
const OddOneOut = lazy(() => import("./OddOneOut.js"));
const Snap = lazy(() => import("./Snap.js"));
const MemoryMatch = lazy(() => import("./MemoryMatch.js"));

import type { DictationQuizItem } from "./DictationQuiz.js";
import type { MatchUpQuizItem } from "./MatchUp.js";
import type { ReorderingQuizData } from "./Reordering.js";
import type { SoundAndSpellingQuizItem } from "./SoundAndSpelling.js";
import type { SortingQuizItem } from "./SortingExercise.js";
import type { OddOneOutQuestion } from "./OddOneOut.js";
import type { SnapQuizItem } from "./Snap.js";
import type { MemoryMatchQuizItem } from "./MemoryMatch.js";

// Define the props type for ExerciseDetailPage
interface ExerciseDetailPageProps {
    heading: string;
    id: string | number;
    title: string;
    accent: string;
    file: string;
    onBack: () => void;
}

const ExerciseDetailPage = ({
    heading,
    id,
    title,
    accent,
    file,
    onBack,
}: ExerciseDetailPageProps) => {
    const [instructions, setInstructions] = useState<string[]>([]);
    const [quiz, setQuiz] = useState<Record<string, unknown>[]>([]);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [currentExerciseType, setCurrentExerciseType] = useState("");
    const [timer, setTimer] = useState<number>(0);
    const [timeIsUp, setTimeIsUp] = useState(false);
    const [onMatchFinished, setOnMatchFinished] = useState(false); // Track if all cards in Memory Match are matched

    const [isloading, setIsLoading] = useState(true);

    const { t } = useTranslation();

    const instructionModal = useRef<HTMLDialogElement | null>(null);

    // Use interface instead of type for ExerciseDetailsType
    interface ExerciseDetailsType {
        id: string | number;
        split?: string;
        type?: string;
        british_american?: ExerciseDetailsType[];
        american?: ExerciseDetailsType[];
        british?: ExerciseDetailsType[];
        quiz?: Record<string, unknown>[];
        instructions?: string[];
        exercise?: string;
    }
    type ExerciseDataType = Record<string, ExerciseDetailsType[]>;

    const getInstructionKey = (exerciseKey: string, exerciseId: string | number) => {
        if (exerciseKey === "sound_n_spelling")
            return `exercise_page.exerciseInstruction.sound_n_spelling.sound`;
        return `exercise_page.exerciseInstruction.${exerciseKey}.${exerciseId}`;
    };

    const fetchInstructions = useCallback(
        (exerciseKey: string, exerciseId: string | number, ipaSound?: string) => {
            const instructionKey = getInstructionKey(exerciseKey, exerciseId);
            const instructions = t(instructionKey, {
                ipaSound: ipaSound || "",
                returnObjects: true,
            });
            return Array.isArray(instructions) ? instructions : [];
        },
        [t]
    );

    // Helper function to handle the exercise data logic (setting quiz, instructions, etc.)
    const handleExerciseData = useCallback(
        (exerciseDetails: ExerciseDetailsType, data: ExerciseDataType, exerciseKey: string) => {
            const savedSettings = localStorage.getItem("ispeaker")
                ? JSON.parse(localStorage.getItem("ispeaker") as string)
                : undefined;
            const fixedTimers = {
                memory_match: 4,
                snap: 2,
            } as const;
            const timerValue =
                fixedTimers[exerciseKey as keyof typeof fixedTimers] ??
                ((savedSettings?.timerSettings?.enabled === true &&
                    savedSettings?.timerSettings?.[exerciseKey]) ||
                    0);

            setTimer(timerValue);

            let selectedAccentData: ExerciseDetailsType | undefined;
            const combinedQuizzes: Record<string, unknown>[] = [];

            const ipaSound =
                (exerciseKey === "sound_n_spelling" && exerciseDetails.exercise?.trim()) || "";
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

                        if (selectedAccentData && selectedAccentData.quiz) {
                            combinedQuizzes.push(
                                ...selectedAccentData.quiz.map((quiz) => ({
                                    ...(quiz as Record<string, unknown>),
                                    split: exercise.split,
                                    type: exercise.type,
                                }))
                            );
                        }
                    }
                });

                // Remove duplicates and shuffle
                const uniqueShuffledCombinedQuizzes = _.shuffle(
                    Array.from(new Set(combinedQuizzes.map((q) => JSON.stringify(q)))).map((q) =>
                        JSON.parse(q)
                    )
                ) as Record<string, unknown>[];
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

                if (selectedAccentData && selectedAccentData.quiz) {
                    setInstructions(loadInstructions || selectedAccentData.instructions);
                    setQuiz(
                        selectedAccentData.quiz.map((quiz) => {
                            const base = { ...(quiz as Record<string, unknown>) };
                            if (typeof exerciseDetails.split === "string")
                                base.split = exerciseDetails.split;
                            if (typeof exerciseDetails.type === "string")
                                base.type = exerciseDetails.type;
                            return base;
                        })
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

            const data: ExerciseDataType = await response.json();
            const exerciseKey = file.replace("exercise_", "").replace(".json", "");
            const exerciseDetails = data[exerciseKey]?.find((exercise) => exercise.id === id);

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

    const handleAnswer = (
        correctCountOrBoolean: boolean | number,
        quizType = "single",
        quizAnswerNum = 1
    ) => {
        if (quizType === "single") {
            setTotalAnswered((prev) => prev + 1);
            if (correctCountOrBoolean) {
                setScore((prev) => prev + 1);
            }
        } else if (quizType === "multiple") {
            setTotalAnswered((prev) => prev + quizAnswerNum);
            setScore(
                (prev) =>
                    prev + (typeof correctCountOrBoolean === "number" ? correctCountOrBoolean : 0)
            );
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
        setOnMatchFinished(true);
    };

    const getEncouragementMessage = () => {
        if (totalAnswered === 0)
            return (
                <div>
                    {t("exercise_page.encouragementMsg.level0")}
                    <img src={rocketEmoji} className="ms-2 inline h-5 w-5" alt="Rocket Emoji" />
                </div>
            );

        const percentage = (score / totalAnswered) * 100;

        let level: 1 | 2 | 3 | 4 | 5 | 6;
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

        const emojis: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
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
                <img
                    src={emojis[level]}
                    className="ms-2 inline h-5 w-5"
                    alt={`Level ${level} Emoji`}
                />
            </div>
        );
    };

    const encouragementMessage =
        quizCompleted && totalAnswered > 0 ? getEncouragementMessage() : null;

    const renderQuizComponent = () => {
        const exerciseType = file.replace("exercise_", "").replace(".json", "");

        // Helper to cast quiz to the correct type
        const getQuizForType = () => {
            switch (exerciseType) {
                case "dictation":
                    return quiz as unknown as DictationQuizItem[];
                case "matchup":
                    return quiz as unknown as MatchUpQuizItem[];
                case "reordering":
                    return quiz as unknown as ReorderingQuizData[];
                case "sound_n_spelling":
                    return quiz as unknown as SoundAndSpellingQuizItem[];
                case "sorting":
                    return quiz as unknown as SortingQuizItem[];
                case "odd_one_out":
                    return quiz as unknown as OddOneOutQuestion[];
                case "snap":
                    return quiz as unknown as SnapQuizItem[];
                case "memory_match":
                    return quiz as unknown as MemoryMatchQuizItem[];
                default:
                    return quiz;
            }
        };

        // Helper to provide the correct handleAnswer signature
        const getHandleAnswer = () => {
            switch (exerciseType) {
                case "dictation":
                    return (isCorrect: boolean, mode: string) =>
                        handleAnswer(isCorrect, mode as "single" | "multiple");
                case "matchup":
                case "sorting":
                    return (correctCount: number, type: string, total: number) =>
                        handleAnswer(correctCount, type, total);
                case "reordering":
                    return (isCorrect: number, type: "single" | "multiple", total?: number) =>
                        handleAnswer(isCorrect, type, total);
                case "sound_n_spelling":
                    return (score: number, type: string) => handleAnswer(score, type);
                case "odd_one_out":
                    return (isCorrect: number, type: string) => handleAnswer(isCorrect, type);
                case "snap":
                    return (isCorrect: number, type: "single" | "multiple", total?: number) =>
                        handleAnswer(isCorrect, type, total);
                default:
                    return handleAnswer;
            }
        };

        // Render with correct props for each component
        switch (exerciseType) {
            case "dictation":
                return (
                    <Suspense fallback={<LoadingOverlay />}>
                        <DictationQuiz
                            quiz={getQuizForType() as DictationQuizItem[]}
                            timer={timer}
                            onAnswer={
                                getHandleAnswer() as (isCorrect: boolean, mode: string) => void
                            }
                            onQuit={handleQuizQuit}
                            setTimeIsUp={setTimeIsUp}
                        />
                    </Suspense>
                );
            case "matchup":
                return (
                    <Suspense fallback={<LoadingOverlay />}>
                        <MatchUp
                            quiz={getQuizForType() as MatchUpQuizItem[]}
                            timer={timer}
                            onAnswer={
                                getHandleAnswer() as (
                                    correctCount: number,
                                    type: string,
                                    total: number
                                ) => void
                            }
                            onQuit={handleQuizQuit}
                            setTimeIsUp={setTimeIsUp}
                        />
                    </Suspense>
                );
            case "reordering":
                return (
                    <Suspense fallback={<LoadingOverlay />}>
                        <Reordering
                            quiz={getQuizForType() as ReorderingQuizData[]}
                            timer={timer}
                            onAnswer={
                                getHandleAnswer() as (
                                    isCorrect: number,
                                    type: "single" | "multiple",
                                    total?: number
                                ) => void
                            }
                            onQuit={handleQuizQuit}
                            setTimeIsUp={setTimeIsUp}
                        />
                    </Suspense>
                );
            case "sound_n_spelling":
                return (
                    <Suspense fallback={<LoadingOverlay />}>
                        <SoundAndSpelling
                            quiz={getQuizForType() as SoundAndSpellingQuizItem[]}
                            timer={timer}
                            onAnswer={getHandleAnswer() as (score: number, type: string) => void}
                            onQuit={handleQuizQuit}
                            setTimeIsUp={setTimeIsUp}
                        />
                    </Suspense>
                );
            case "sorting":
                return (
                    <Suspense fallback={<LoadingOverlay />}>
                        <SortingExercise
                            quiz={getQuizForType() as SortingQuizItem[]}
                            timer={timer}
                            onAnswer={
                                getHandleAnswer() as (
                                    correctCount: number,
                                    type: string,
                                    total: number
                                ) => void
                            }
                            onQuit={handleQuizQuit}
                            setTimeIsUp={setTimeIsUp}
                        />
                    </Suspense>
                );
            case "odd_one_out":
                return (
                    <Suspense fallback={<LoadingOverlay />}>
                        <OddOneOut
                            quiz={getQuizForType() as OddOneOutQuestion[]}
                            timer={timer}
                            onAnswer={
                                getHandleAnswer() as (isCorrect: number, type: string) => void
                            }
                            onQuit={handleQuizQuit}
                            setTimeIsUp={setTimeIsUp}
                        />
                    </Suspense>
                );
            case "snap":
                return (
                    <Suspense fallback={<LoadingOverlay />}>
                        <Snap
                            quiz={getQuizForType() as SnapQuizItem[]}
                            timer={timer}
                            onAnswer={
                                getHandleAnswer() as (
                                    isCorrect: number,
                                    type: "single" | "multiple",
                                    total?: number
                                ) => void
                            }
                            onQuit={handleQuizQuit}
                            setTimeIsUp={setTimeIsUp}
                        />
                    </Suspense>
                );
            case "memory_match":
                return (
                    <Suspense fallback={<LoadingOverlay />}>
                        <MemoryMatch
                            quiz={getQuizForType() as MemoryMatchQuizItem[]}
                            timer={timer}
                            onQuit={handleQuizQuit}
                            setTimeIsUp={setTimeIsUp}
                            onMatchFinished={handleMatchFinished}
                        />
                    </Suspense>
                );
            default:
                return (
                    <Suspense fallback={<LoadingOverlay />}>
                        <div className="card-body">This quiz type is not yet implemented.</div>
                    </Suspense>
                );
        }
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
                                className="btn btn-neutral dark:btn-outline block md:hidden"
                                onClick={() => instructionModal.current?.showModal()}
                            >
                                {t("exercise_page.buttons.expandBtn")}
                            </button>

                            <div className="collapse-arrow bg-base-200 collapse hidden md:grid dark:bg-slate-700">
                                <input type="checkbox" defaultChecked title="Expand instructions" />
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
