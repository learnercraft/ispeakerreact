import he from "he";
import _ from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { IoVolumeHigh, IoVolumeHighOutline } from "react-icons/io5";
import { LiaChevronCircleRightSolid, LiaTimesCircle } from "react-icons/lia";
import { ShuffleArray } from "../../utils/ShuffleArray";
import useCountdownTimer from "../../utils/useCountdownTimer";

const SoundAndSpelling = ({ quiz, onAnswer, onQuit, timer, setTimeIsUp }) => {
    const [currentQuestionIndex, setcurrentQuestionIndex] = useState(0);
    const [shuffledQuiz, setShuffledQuiz] = useState([]);
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [currentQuestionText, setCurrentQuestionText] = useState("");
    const [currentAudioSrc, setCurrentAudioSrc] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { formatTime, clearTimer, startTimer } = useCountdownTimer(timer, () => setTimeIsUp(true));

    const { t } = useTranslation();

    // Use a ref to manage the audio element
    const audioRef = useRef(null);

    const filterAndShuffleQuiz = (quiz) => {
        const uniqueQuiz = _.uniqWith(quiz, _.isEqual);
        return ShuffleArray(uniqueQuiz);
    };

    const loadQuiz = useCallback((quizData) => {
        // Shuffle the answer options
        const shuffledOptions = ShuffleArray([...quizData.data]);
        setShuffledOptions(shuffledOptions);

        // Set the question text and audio source
        setCurrentQuestionText(quizData.question[0].text);
        setCurrentAudioSrc(`${import.meta.env.BASE_URL}media/exercise/mp3/${quizData.audio.src}.mp3`);

        setButtonsDisabled(false);
        setSelectedOption(null);
    }, []);

    useEffect(() => {
        if (quiz && quiz.length > 0) {
            // Filter out unique items and shuffle the quiz array
            const uniqueShuffledQuiz = filterAndShuffleQuiz(quiz);
            setShuffledQuiz(uniqueShuffledQuiz);
            // Reset currentQuestionIndex to 0
            setcurrentQuestionIndex(0);
        }
    }, [quiz]);

    const stopAudio = () => {
        if (audioRef.current) {
            // Stop the audio and remove event listeners
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            audioRef.current.oncanplaythrough = null;
            audioRef.current.onended = null;
            audioRef.current.onerror = null;

            setIsPlaying(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, []);

    useEffect(() => {
        if (shuffledQuiz.length > 0 && currentQuestionIndex < shuffledQuiz.length) {
            loadQuiz(shuffledQuiz[currentQuestionIndex]);
        }
    }, [shuffledQuiz, currentQuestionIndex, loadQuiz]);

    const handleAudioPlay = () => {
        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsPlaying(false);
        } else {
            setIsLoading(true);
            const newAudio = new Audio(currentAudioSrc);
            audioRef.current = newAudio;
            newAudio.load();

            // Handle when the audio can be played through
            newAudio.oncanplaythrough = () => {
                setIsLoading(false);
                setIsPlaying(true);
                newAudio.play();
                startTimer();
            };

            // Handle when the audio ends
            newAudio.onended = () => {
                setIsPlaying(false);
            };

            // Handle any loading errors
            newAudio.onerror = () => {
                setIsLoading(false);
                setIsPlaying(false);
                console.error("Error playing audio.");
                alert("There was an error loading the audio file. Please check your connection or try again later.");
            };
        }
    };

    const handleOptionClick = (isCorrect, index) => {
        startTimer();
        setButtonsDisabled(true);
        setSelectedOption({ index, isCorrect });

        // Replace the underscore with the selected answer
        const updatedQuestionText = currentQuestionText.replace("_____", shuffledOptions[index].value);
        setCurrentQuestionText(updatedQuestionText);

        onAnswer(isCorrect ? 1 : 0, "single");
    };

    const handleNextQuiz = () => {
        stopAudio();

        if (currentQuestionIndex < shuffledQuiz.length - 1) {
            setcurrentQuestionIndex((prevIndex) => prevIndex + 1);
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
                <div className="font-semibold text-lg">
                    {timer > 0 ? (
                        <div className="flex items-center">
                            <div className="flex-1 md:flex-none">
                                {t("exercise_page.questionNo")} #{currentQuestionIndex + 1}
                            </div>
                            <div className="flex justify-end ms-auto">
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
                <div className="flex flex-col items-center justify-center gap-4">
                    <div>
                        <button
                            type="button"
                            title={t("exercise_page.buttons.playAudioBtn")}
                            className="btn btn-circle btn-success"
                            onClick={handleAudioPlay}
                            disabled={isLoading}>
                            {isLoading ? (
                                <span className="loading loading-spinner loading-md"></span>
                            ) : isPlaying ? (
                                <IoVolumeHigh className="h-6 w-6" />
                            ) : (
                                <IoVolumeHighOutline className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    <div
                        className={`px-6 py-3 rounded-lg flex gap-2 items-center text-xl ${
                            selectedOption
                                ? selectedOption.isCorrect
                                    ? "bg-success text-success-content"
                                    : "bg-error text-error-content"
                                : ""
                        }`}>
                        {he.decode(currentQuestionText)}
                        {selectedOption ? (
                            selectedOption.isCorrect ? (
                                <BsCheckCircleFill className="h-5 w-5" />
                            ) : (
                                <BsXCircleFill className="h-5 w-5" />
                            )
                        ) : (
                            ""
                        )}
                    </div>

                    <div className="flex flex-row flex-wrap justify-center gap-3">
                        {shuffledOptions.map((option, index) => {
                            const isSelected = selectedOption?.index === index;
                            return (
                                <button
                                    type="button"
                                    className={`btn ${isSelected ? "btn-primary" : "btn-outline"} font-bold text-lg ${
                                        buttonsDisabled ? "pointer-events-none" : ""
                                    }`}
                                    key={index}
                                    onClick={() => handleOptionClick(option.answer === "true", index)}
                                    disabled={!!selectedOption && !isSelected}>
                                    {option.value}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="card-actions justify-center">
                    <div className="flex flex-wrap justify-center my-3 gap-2">
                        {currentQuestionIndex < shuffledQuiz.length - 1 && (
                            <button type="button" className="btn btn-accent" onClick={handleNextQuiz}>
                                <LiaChevronCircleRightSolid className="h-6 w-6" /> {t("exercise_page.buttons.nextBtn")}
                            </button>
                        )}
                        <button type="button" className="btn btn-error" onClick={handleQuit}>
                            <LiaTimesCircle className="h-6 w-6" /> {t("exercise_page.buttons.quitBtn")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SoundAndSpelling;
