import he from "he";
import _ from "lodash";
import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { LiaCheckCircle, LiaChevronCircleRightSolid, LiaTimesCircle } from "react-icons/lia";
import { ShuffleArray } from "../../utils/ShuffleArray";
import useCountdownTimer from "../../utils/useCountdownTimer";

const OddOneOut = ({ quiz, onAnswer, onQuit, timer, setTimeIsUp }) => {
    const [currentQuestionIndex, setcurrentQuestionIndex] = useState(0);
    const [shuffledQuiz, setShuffledQuiz] = useState([]);
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { formatTime, clearTimer, startTimer } = useCountdownTimer(timer, () =>
        setTimeIsUp(true)
    );

    const { t } = useTranslation();

    useEffect(() => {
        if (timer > 0) {
            startTimer();
        }
    }, [timer, startTimer]);

    const filterAndShuffleQuiz = useCallback((quiz) => {
        const uniqueQuiz = _.uniqWith(quiz, _.isEqual);
        return ShuffleArray(uniqueQuiz);
    }, []);

    const loadQuiz = useCallback((quizData) => {
        const shuffledOptions = ShuffleArray([...quizData.data]);
        setShuffledOptions(shuffledOptions);
        setSelectedOption(null);
        setButtonsDisabled(false);
        setSubmitted(false);
    }, []);

    useEffect(() => {
        if (quiz && quiz.length > 0) {
            const shuffledQuizArray = filterAndShuffleQuiz([...quiz]);
            setShuffledQuiz(shuffledQuizArray);
            loadQuiz(shuffledQuizArray[currentQuestionIndex]);
        }
    }, [quiz, currentQuestionIndex, loadQuiz, filterAndShuffleQuiz]);

    const handleOptionClick = (index) => {
        setSelectedOption(index);
    };

    const handleSubmit = () => {
        if (selectedOption === null) return; // Ensure an option is selected

        const isCorrect = shuffledOptions[selectedOption].answer === "true";
        setButtonsDisabled(true);
        setSubmitted(true);
        onAnswer(isCorrect ? 1 : 0, "single");
    };

    const handleNextQuiz = () => {
        if (currentQuestionIndex < shuffledQuiz.length - 1) {
            setcurrentQuestionIndex((prevIndex) => prevIndex + 1);
        } else {
            onQuit();
            clearTimer();
        }
    };

    const handleQuit = () => {
        onQuit();
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
                <div className="grid grid-cols-2 place-content-stretch gap-4">
                    {shuffledOptions.map((option, index) => (
                        <div key={index}>
                            <button
                                type="button"
                                className={`btn btn-lg w-full p-3 text-center font-bold ${
                                    submitted && selectedOption === index
                                        ? option.answer === "true"
                                            ? "btn-success"
                                            : "btn-error"
                                        : selectedOption === index
                                          ? "btn-accent"
                                          : ""
                                } ${buttonsDisabled ? "pointer-events-none" : ""} ${
                                    submitted &&
                                    option.answer === "true" &&
                                    selectedOption !== index
                                        ? "btn-warning"
                                        : ""
                                }`}
                                onClick={() => handleOptionClick(index)}
                            >
                                <span lang="en">{he.decode(option.value)}</span>
                                {submitted ? (
                                    submitted && option.answer === "true" ? (
                                        <BsCheckCircleFill />
                                    ) : (
                                        <BsXCircleFill />
                                    )
                                ) : (
                                    ""
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="card-actions justify-center">
                    <div className="my-3 flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={selectedOption === null || buttonsDisabled}
                            onClick={handleSubmit}
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

OddOneOut.propTypes = {
    quiz: PropTypes.arrayOf(PropTypes.object).isRequired,
    onAnswer: PropTypes.func.isRequired,
    onQuit: PropTypes.func.isRequired,
    timer: PropTypes.number.isRequired,
    setTimeIsUp: PropTypes.func.isRequired,
};

export default OddOneOut;
