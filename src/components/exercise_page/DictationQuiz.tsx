import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { IoInformationCircleOutline, IoVolumeHigh, IoVolumeHighOutline } from "react-icons/io5";
import { LiaCheckCircle, LiaChevronCircleRightSolid, LiaTimesCircle } from "react-icons/lia";
import { sonnerErrorToast } from "../../utils/sonnerCustomToast.js";
import useCountdownTimer from "../../utils/useCountdownTimer.js";

type DictationWord = { textbox: string; level?: string } | { value: string };

export interface DictationQuizItem {
    words: DictationWord[];
    audio: { src: string };
    type?: string;
}

interface DictationQuizProps {
    quiz: DictationQuizItem[];
    timer: number;
    onAnswer: (isCorrect: boolean, mode: string) => void;
    onQuit: () => void;
    setTimeIsUp: (isUp: boolean) => void;
}

const DictationQuiz = ({ quiz, timer, onAnswer, onQuit, setTimeIsUp }: DictationQuizProps) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [answer, setAnswer] = useState<string>("");
    const [showValidation, setShowValidation] = useState<boolean>(false);
    const [validationVariant, setValidationVariant] = useState<"success" | "danger">("danger");
    const [validationMessage, setValidationMessage] = useState<string>("");
    const [isTextboxDisabled, setIsTextboxDisabled] = useState<boolean>(false);
    const [shuffledQuiz, setShuffledQuiz] = useState<DictationQuizItem[]>([]);
    const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState<boolean>(false);
    const [hasAnswered, setHasAnswered] = useState<boolean>(false);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { formatTime, clearTimer, startTimer } = useCountdownTimer(timer, () =>
        setTimeIsUp(true)
    );

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { t } = useTranslation();

    const filterAndShuffleQuiz = (quiz: DictationQuizItem[]): DictationQuizItem[] => {
        const uniqueQuiz = _.uniqWith(quiz, _.isEqual);
        return _.shuffle(uniqueQuiz);
    };

    useEffect(() => {
        if (quiz?.length > 0) {
            setShuffledQuiz(filterAndShuffleQuiz([...quiz]));
        }

        return () => {
            // Cleanup: Stop audio when component unmounts
            stopAudio();
        };
    }, [quiz]);

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

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        if (!shuffledQuiz[currentQuestionIndex]) return;

        const textboxWord = shuffledQuiz[currentQuestionIndex].words.find(
            (word): word is { textbox: string } => "textbox" in word
        );
        if (!textboxWord) {
            console.error("No textbox found in the current question.");
            return;
        }

        const correctAnswer = textboxWord.textbox.toLowerCase();
        const isCorrect = answer.trim().toLowerCase() === correctAnswer;

        setIsTextboxDisabled(true);
        setIsSubmitButtonEnabled(true);
        setHasAnswered(true);
        setShowValidation(true);
        setValidationVariant(isCorrect ? "success" : "danger");
        setValidationMessage(isCorrect ? "" : correctAnswer);

        onAnswer(isCorrect, "single");
    };

    const nextQuestion = () => {
        if ((!hasAnswered && answer.trim() === "") || !hasAnswered) {
            onAnswer(false, "single");
        }
        stopAudio();

        if (currentQuestionIndex < shuffledQuiz.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setAnswer("");
            setIsTextboxDisabled(false);
            setShowValidation(false);
            setIsSubmitButtonEnabled(false);
            setHasAnswered(false); // Reset for the next question
        } else {
            onQuit(); // Notify parent that the quiz is finished
            stopAudio();
            clearTimer();
        }
    };

    const handleNext = () => {
        nextQuestion(); // Move to the next question
    };

    const handleQuit = () => {
        onQuit();
        stopAudio();
        clearTimer();
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

        // Determine the exercise type for the current question
        const exerciseType = shuffledQuiz[currentQuestionIndex]?.type;
        const audio = new Audio();
        const audioSrc =
            exerciseType === "sentence"
                ? `${import.meta.env.BASE_URL}media/exercise/mp3/sentence/${shuffledQuiz[currentQuestionIndex].audio.src}.mp3`
                : `${import.meta.env.BASE_URL}media/word/mp3/${shuffledQuiz[currentQuestionIndex].audio.src}.mp3`;

        audioRef.current = audio;

        audio.src = audioSrc;
        setIsLoading(true);

        audio.oncanplaythrough = () => {
            setIsLoading(false);
            setIsPlaying(true);
            audio.play();
            startTimer();
        };

        audio.onended = () => {
            setIsPlaying(false);
        };

        audio.onerror = () => {
            setIsLoading(false);
            console.error("Audio error occurred. Unable to play the audio.");
            sonnerErrorToast(t("toast.audioPlayFailed"));
        };

        audio.onpause = () => {
            setIsPlaying(false);
        };

        audioRef.current.load(); // Load the new audio source
    };

    const renderWords = () => {
        const currentWords = shuffledQuiz[currentQuestionIndex]?.words || [];

        // Check if the current word has both `value` and `textbox`
        const hasValueAndTextbox =
            currentWords.some((w): w is { value: string } => "value" in w) &&
            currentWords.some((w): w is { textbox: string } => "textbox" in w);

        return currentWords.map((word, index) => {
            if ("value" in word) {
                return (
                    <span lang="en" className="mx-2" key={index}>
                        {word.value}
                    </span>
                );
            }

            if ("textbox" in word) {
                const isCorrect = answer.trim().toLowerCase() === word.textbox.toLowerCase();

                return (
                    <span
                        key={index}
                        className={`my-2 inline-block ${hasValueAndTextbox ? "w-48" : "w-full lg:w-3/4"}`}
                    >
                        <label lang="en" className="input items-center gap-0 md:gap-2">
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => {
                                    setAnswer(e.target.value);
                                    startTimer();
                                }}
                                autoComplete="off"
                                spellCheck="false"
                                disabled={isTextboxDisabled}
                                className={`grow text-center ${
                                    hasValueAndTextbox ? "mx-2" : "mx-auto"
                                } text-black dark:text-slate-200`}
                                style={hasValueAndTextbox ? { width: "40%" } : {}}
                            />
                            {showValidation && (
                                <>
                                    {isCorrect ? (
                                        <AiOutlineCheckCircle className="text-primary h-6 w-6" />
                                    ) : (
                                        <AiOutlineCloseCircle className="text-error h-6 w-6" />
                                    )}
                                </>
                            )}
                        </label>
                    </span>
                );
            }

            return null;
        });
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
                <div className="flex justify-center">
                    <button
                        type="button"
                        title={t("exercise_page.buttons.playAudioBtn")}
                        onClick={handleAudioPlay}
                        className="btn btn-circle btn-success my-3"
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
                <form onSubmit={handleSubmit}>
                    <div className="text-center">{renderWords()}</div>
                </form>
                {showValidation && validationVariant === "danger" && (
                    <div className="flex justify-center">
                        <div
                            role="alert"
                            className="alert alert-info my-4 flex w-full gap-1 md:gap-2 lg:w-1/2"
                        >
                            <IoInformationCircleOutline className="h-6 w-6" />
                            <div className="w-4/5 lg:w-auto">
                                <h3>{t("exercise_page.result.correctAnswer")}</h3>
                                <p className="text-xl font-bold italic" lang="en">
                                    {validationMessage}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="card-actions justify-center">
                    <div className="my-3 flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={isSubmitButtonEnabled}
                            onClick={handleSubmit}
                        >
                            <LiaCheckCircle className="h-6 w-6" />{" "}
                            {t("exercise_page.buttons.checkBtn")}
                        </button>
                        {currentQuestionIndex < quiz.length - 1 && (
                            <button type="button" className="btn btn-accent" onClick={handleNext}>
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

export default DictationQuiz;
