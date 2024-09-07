import _ from "lodash";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Collapse, Row } from "react-bootstrap";
import { ArrowCounterclockwise, ArrowLeftCircle, ChevronDown, ChevronUp } from "react-bootstrap-icons";
import LoadingOverlay from "../general/LoadingOverlay";

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

    const [openInstructions, setOpenInstructions] = useState(false);

    const [isloading, setIsLoading] = useState(true);

    const fetchExerciseData = useCallback(async () => {
        try {
            setIsLoading(true);

            const response = await fetch(`${import.meta.env.BASE_URL}json/${file}`);
            if (!response.ok) {
                throw new Error("Failed to fetch exercise data");
            }

            const data = await response.json();
            const exerciseKey = file.replace("exercise_", "").replace(".json", "");
            const exerciseDetails = data[exerciseKey]?.find((exercise) => exercise.id === id);
            setCurrentExerciseType(exerciseKey);

            const savedSettings = JSON.parse(localStorage.getItem("ispeaker"));
            const timerValue =
                exerciseKey === "memory_match"
                    ? savedSettings?.timerSettings?.memory_match || 4 // Use a default value for memory match
                    : (savedSettings?.timerSettings?.enabled === true && savedSettings?.timerSettings?.[exerciseKey]) ||
                      0; // For other exercises

            setTimer(timerValue);

            if (exerciseDetails) {
                let selectedAccentData;
                let combinedQuizzes = [];

                if (id === "random") {
                    data[exerciseKey].forEach((exercise) => {
                        if (exercise.id !== "random") {
                            if (exercise.british_american) {
                                selectedAccentData = exercise.british_american[0];
                            } else {
                                selectedAccentData =
                                    accent === "American English" ? exercise.american?.[0] : exercise.british?.[0];
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

                    setInstructions(selectedAccentData?.instructions || []);
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
                        setInstructions(selectedAccentData.instructions || []);
                        setQuiz(
                            selectedAccentData.quiz.map((quiz) => ({
                                ...quiz,
                                split: exerciseDetails.split,
                            }))
                        );
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching exercise data:", error);
            alert("Error loading exercise data. Please check your Internet connection.");
        } finally {
            setIsLoading(false);
        }
    }, [id, file, accent]);

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
                <>
                    Let’s get started! <span className="noto-color-emoji">🚀</span>
                </>
            );
        const percentage = (score / totalAnswered) * 100;

        if (percentage === 100) {
            return (
                <>
                    Perfect! You nailed it! <span className="noto-color-emoji">🎉</span>
                </>
            );
        } else if (percentage >= 80) {
            return (
                <>
                    Great job! You’re doing really well! <span className="noto-color-emoji">👍</span>
                </>
            );
        } else if (percentage >= 60) {
            return (
                <>
                    Nice work! Keep going, you’re doing fine! <span className="noto-color-emoji">😊</span>
                </>
            );
        } else if (percentage >= 40) {
            return (
                <>
                    Not bad! Keep trying, you’ll get there! <span className="noto-color-emoji">💪</span>
                </>
            );
        } else if (percentage >= 20) {
            return (
                <>
                    Keep going! You’re learning and improving! <span className="noto-color-emoji">🌱</span>
                </>
            );
        } else {
            return (
                <>
                    Keep practicing! Every step is progress! <span className="noto-color-emoji">🛤️</span>
                </>
            );
        }
    };

    const encouragementMessage = quizCompleted && totalAnswered > 0 ? getEncouragementMessage() : null;

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
                    <Card.Body>This quiz type is not yet implemented.</Card.Body>
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
                    <h3 className="mt-4">{heading}</h3>
                    <Row className="mt-2 g-4">
                        <Col md={4}>
                            <Card className="h-100 shadow-sm">
                                <Card.Header className="fw-semibold">{title}</Card.Header>
                                <Card.Body>
                                    <p>
                                        <strong>Accent:</strong> {accent}
                                    </p>

                                    <div>
                                        <Button
                                            variant="info"
                                            onClick={() => setOpenInstructions(!openInstructions)}
                                            aria-controls="instructions-collapse"
                                            aria-expanded={openInstructions}>
                                            {openInstructions ? "Collapse instructions" : "Expand instructions"}{" "}
                                            {openInstructions ? <ChevronUp /> : <ChevronDown />}
                                        </Button>
                                        <Collapse in={openInstructions}>
                                            <div id="instructions-collapse">
                                                <Card body className="mt-2">
                                                    {instructions.map((instruction, index) => (
                                                        <p
                                                            key={index}
                                                            className={index === instructions.length - 1 ? "mb-0" : ""}>
                                                            {instruction}
                                                        </p>
                                                    ))}
                                                </Card>
                                            </div>
                                        </Collapse>
                                    </div>

                                    <Button className="mb-2 mt-4" variant="primary" onClick={onBack}>
                                        <ArrowLeftCircle /> Back to exercise list
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={8}>
                            <Card className="shadow-sm">
                                {timeIsUp || quizCompleted || onMatchFinished ? (
                                    <>
                                        <Card.Header className="fw-semibold">Result</Card.Header>
                                        <Card.Body>
                                            {onMatchFinished ? (
                                                <p>You have revealed all of the cards! Congratulations!</p>
                                            ) : (
                                                ""
                                            )}
                                            {timeIsUp && !onMatchFinished ? <p>Time's up!</p> : ""}
                                            {score === 0 &&
                                            totalAnswered === 0 &&
                                            currentExerciseType !== "memory_match" ? (
                                                <p>
                                                    You have not answered any questions yet. Try restarting the quiz, or
                                                    choose another exercise type.
                                                </p>
                                            ) : currentExerciseType !== "memory_match" ? (
                                                <>
                                                    <p>
                                                        You have answered {score} out of {totalAnswered} correctly.
                                                    </p>
                                                    <p>{encouragementMessage}</p>
                                                    <p>
                                                        Try this exercise again for further practice and different
                                                        questions, or choose another exercise type.
                                                    </p>
                                                </>
                                            ) : (
                                                <p>
                                                    Try this exercise again for further practice and different
                                                    questions, or choose another exercise type.
                                                </p>
                                            )}
                                            <Button variant="secondary" onClick={handleQuizRestart}>
                                                <ArrowCounterclockwise /> Restart quiz
                                            </Button>
                                        </Card.Body>
                                    </>
                                ) : (
                                    <>{renderQuizComponent()}</>
                                )}
                            </Card>

                            {timeIsUp || quizCompleted || currentExerciseType == "memory_match" ? (
                                ""
                            ) : (
                                <Card className="mt-4 shadow-sm">
                                    <Card.Header className="fw-semibold">Review</Card.Header>
                                    <Card.Body>
                                        {score === 0 && totalAnswered === 0 ? (
                                            ""
                                        ) : (
                                            <p>
                                                You have answered {score} out of {totalAnswered} correctly.
                                            </p>
                                        )}

                                        <p>{getEncouragementMessage()}</p>

                                        {score === 0 && totalAnswered === 0 ? (
                                            ""
                                        ) : (
                                            <p>Try this exercise again for further practice and different questions.</p>
                                        )}
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </>
            )}
        </>
    );
};

export default ExerciseDetailPage;
