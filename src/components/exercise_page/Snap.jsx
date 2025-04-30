import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import he from "he";
import _ from "lodash";
import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { LiaChevronCircleRightSolid, LiaTimesCircle } from "react-icons/lia";
import { ShuffleArray } from "../../utils/ShuffleArray";
import useCountdownTimer from "../../utils/useCountdownTimer";

const filterAndShuffleQuiz = (quiz) => {
    // Remove duplicate questions
    const uniqueQuiz = _.uniqWith(quiz, _.isEqual);

    // Shuffle the quiz questions
    const shuffledQuiz = ShuffleArray(uniqueQuiz);

    // Shuffle the options (data) within each quiz question
    return shuffledQuiz.map((quizItem) => {
        return {
            ...quizItem,
            data: ShuffleArray(quizItem.data), // Shuffle the answer options within each question
        };
    });
};

const Snap = ({ quiz, onAnswer, onQuit, timer, setTimeIsUp }) => {
    const [currentQuestionIndex, setcurrentQuestionIndex] = useState(0);
    const [currentQuiz, setCurrentQuiz] = useState({});
    const [shuffledQuiz, setShuffledQuiz] = useState([]);
    const [isDropped, setIsDropped] = useState(false);
    const [result, setResult] = useState(null);
    const [droppedOn, setDroppedOn] = useState(null); // Track where the item is dropped

    const { formatTime, clearTimer, startTimer } = useCountdownTimer(timer, () =>
        setTimeIsUp(true)
    );

    const { t } = useTranslation();

    useEffect(() => {
        if (timer > 0) {
            startTimer();
        }
    }, [timer, startTimer]);

    const loadQuiz = useCallback((quizData) => {
        const shuffledOptions = ShuffleArray([...quizData.data]); // Shuffle the options for this specific question
        setCurrentQuiz({ ...quizData, data: shuffledOptions }); // Set the current quiz with shuffled options
        setIsDropped(false);
        setResult(null);
        setDroppedOn(null);
    }, []);

    useEffect(() => {
        if (quiz && quiz.length > 0) {
            const uniqueShuffledQuiz = filterAndShuffleQuiz(quiz); // Filter and shuffle the quiz
            setShuffledQuiz(uniqueShuffledQuiz); // Set the shuffled quiz
            setcurrentQuestionIndex(0); // Reset the quiz index to the first one
            loadQuiz(uniqueShuffledQuiz[0]); // Load the first question
        }
    }, [quiz, loadQuiz]);

    const handleDragEnd = (event) => {
        const { over } = event;
        if (!over) return;

        const feedbackValue = over.id.toLowerCase(); // The ID is either "yes" or "no", convert to lowercase
        const correctAnswer = currentQuiz?.feedbacks
            ?.find((f) => f.correctAns)
            ?.correctAns.toLowerCase(); // Normalize correctAns to lowercase

        // Check if the drop zone ("Yes" or "No") matches the correct answer
        const isCorrect = feedbackValue === correctAnswer;

        setResult(isCorrect ? "success" : "danger"); // Show success for correct, danger for incorrect
        setIsDropped(true);
        setDroppedOn(over.id); // Set the ID of the area where the item was dropped
        onAnswer(isCorrect ? 1 : 0, "single");
    };

    const handleNextQuiz = () => {
        if (currentQuestionIndex < shuffledQuiz.length - 1) {
            const nextQuizIndex = currentQuestionIndex + 1;
            setcurrentQuestionIndex(nextQuizIndex);
            loadQuiz(shuffledQuiz[nextQuizIndex]);
        } else {
            onQuit();
            clearTimer();
        }
    };

    const handleQuit = () => {
        onQuit();
        clearTimer();
    };

    // Draggable item component
    const DraggableItem = ({ isDropped }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
            useDraggable({
                id: "draggable-item",
            });

        const adjustedTransform = transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined;

        const style = {
            transform: adjustedTransform,
            transition,
            touchAction: "none",
            cursor: isDropped ? "not-allowed" : isDragging ? "grabbing" : "grab",
            WebkitUserDrag: "none",
            WebkitTouchCallout: "none",
            opacity: 1, // Always keep the item visible
            userSelect: "none",
        };

        return (
            <button
                type="button"
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`btn btn-primary no-animation w-full text-base font-bold transition-none ${isDropped ? "z-30" : "z-20"}`}
                disabled={isDropped}
            >
                {t("exercise_page.dragThisItem")}
            </button>
        );
    };

    // Droppable area component
    const DroppableArea = ({ feedback, isDropped, result, droppedOn }) => {
        const { isOver, setNodeRef } = useDroppable({
            id: feedback?.value || "droppable-area",
        });

        const showColor = droppedOn === feedback?.value;

        const bgColor = showColor
            ? result === "success"
                ? "bg-success"
                : "bg-error"
            : isOver
              ? ""
              : "";
        const buttonVariant = result === "success" ? "text-success-content" : "text-error-content";
        const buttonText =
            result === "success" ? (
                <>
                    {t("exercise_page.snapCorrect")} <BsCheckCircleFill />
                </>
            ) : (
                <>
                    {t("exercise_page.snapIncorrect")} <BsXCircleFill />
                </>
            );

        // Translate "Yes" and "No" strings
        const translatedValue =
            feedback?.value === "Yes"
                ? t("exercise_page.snapYes")
                : feedback?.value === "No"
                  ? t("exercise_page.snapNo")
                  : feedback?.value;

        return (
            <button
                type="button"
                ref={setNodeRef}
                className={`btn btn-outline no-animation w-full text-lg font-bold transition-none ${bgColor} pointer-events-none ${
                    isDropped && droppedOn === feedback?.value ? buttonVariant : ""
                }`}
            >
                {isDropped && droppedOn === feedback?.value ? (
                    buttonText
                ) : (
                    <span>{translatedValue}</span> // Show Yes/No only if item hasn't been dropped
                )}
            </button>
        );
    };

    DraggableItem.propTypes = {
        isDropped: PropTypes.bool.isRequired,
    };

    DroppableArea.propTypes = {
        feedback: PropTypes.object.isRequired,
        isDropped: PropTypes.bool.isRequired,
        result: PropTypes.string,
        droppedOn: PropTypes.string,
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
                {/* Present Word and Phonetic Transcription */}
                <div className="my-4 grid grid-rows-2 justify-center gap-2 text-center">
                    <p lang="en" className="text-xl font-semibold">
                        {he.decode(currentQuiz?.data?.[0]?.value || "")}
                    </p>
                    <p lang="en" className="text-xl font-semibold">
                        {he.decode(currentQuiz?.data?.[1]?.value || "")}
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 align-middle md:flex-row">
                    <DndContext onDragEnd={handleDragEnd}>
                        {/* Yes drop zone */}
                        <div className="w-full">
                            <DroppableArea
                                feedback={currentQuiz?.feedbacks?.find((f) => f.value === "Yes")}
                                isDropped={isDropped}
                                result={result}
                                droppedOn={droppedOn} // Track where the item is dropped
                            />
                        </div>

                        {/* Draggable item */}
                        <div className="w-full">
                            {!isDropped && <DraggableItem isDropped={isDropped} />}
                        </div>

                        {/* No drop zone */}
                        <div className="w-full">
                            <DroppableArea
                                feedback={currentQuiz?.feedbacks?.find((f) => f.value === "No")}
                                isDropped={isDropped}
                                result={result}
                                droppedOn={droppedOn} // Track where the item is dropped
                            />
                        </div>
                    </DndContext>
                </div>

                <div className="card-actions justify-center">
                    <div className="my-3 flex flex-wrap justify-center gap-2">
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

Snap.propTypes = {
    quiz: PropTypes.arrayOf(PropTypes.object).isRequired,
    onAnswer: PropTypes.func.isRequired,
    onQuit: PropTypes.func.isRequired,
    timer: PropTypes.number.isRequired,
    setTimeIsUp: PropTypes.func.isRequired,
};

export default Snap;
