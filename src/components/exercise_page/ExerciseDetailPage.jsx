import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { ArrowLeftCircle, ArrowRepeat } from "react-bootstrap-icons";
import { ShuffleArray } from "../../utils/ShuffleArray";
import LoadingOverlay from "../general/LoadingOverlay";
import DictationQuiz from "./DictationQuiz";
import SoundAndSpelling from "./SoundAndSpelling";
import MatchUp from "./MatchUp";
import Reordering from "./Reordering";

const ExerciseDetailPage = ({ heading, id, title, accent, file, onBack }) => {
    const [instructions, setInstructions] = useState([]);
    const [quiz, setQuiz] = useState([]);
    const [split, setSplit] = useState("");
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [totalAnswered, setTotalAnswered] = useState(0);

    const [isloading, setIsLoading] = useState(true);

    const fetchExerciseData = useCallback(() => {
        setIsLoading(true);
        fetch(`/json/${file}`)
            .then((response) => response.json())
            .then((data) => {
                let exerciseDetails;

                // Remove "exercise_" prefix and ".json" suffix
                const exerciseKey = file.replace("exercise_", "").replace(".json", "");

                if (data[exerciseKey]) {
                    exerciseDetails = data[exerciseKey].find((exercise) => exercise.id === id);
                }

                if (exerciseDetails) {
                    if (id === "random") {
                        let combinedQuizzes = [];

                        data[exerciseKey].forEach((exercise) => {
                            if (exercise.id !== "random") {
                                const selectedAccentData =
                                    accent === "American English" ? exercise.american?.[0] : exercise.british?.[0];

                                if (selectedAccentData) {
                                    combinedQuizzes = combinedQuizzes.concat(
                                        selectedAccentData.quiz.map((quiz) => ({
                                            ...quiz,
                                            split: exercise.split, // Correctly apply the split from the exercise level
                                        }))
                                    );
                                }
                            }
                        });

                        const shuffledCombinedQuizzes = ShuffleArray(combinedQuizzes);
                        setQuiz(shuffledCombinedQuizzes);

                        const selectedAccentData =
                            accent === "American English"
                                ? exerciseDetails.american?.[0]
                                : exerciseDetails.british?.[0];
                        setInstructions(selectedAccentData.instructions || []);
                    } else {
                        // Handle normal exercises
                        const selectedAccentData =
                            accent === "American English"
                                ? exerciseDetails.american?.[0]
                                : exerciseDetails.british?.[0];

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

                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching exercise data:", error);
                alert("Error loading exercise data. Please check your Internet connection.");
                setIsLoading(false);
            });
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
    };

    const handleQuizRestart = () => {
        setScore(0);
        setTotalAnswered(0);
        setQuizCompleted(false);
    };

    const getEncouragementMessage = () => {
        if (totalAnswered === 0) return "Let's get started! 🚀";
        const percentage = (score / totalAnswered) * 100;

        if (percentage === 100) {
            return "Perfect! You nailed it! 🎉";
        } else if (percentage >= 80) {
            return "Great job! You're doing really well! 👍";
        } else if (percentage >= 60) {
            return "Nice work! Keep going, you're doing fine! 😊";
        } else if (percentage >= 40) {
            return "Not bad! Keep trying, you'll get there! 💪";
        } else if (percentage >= 20) {
            return "Keep going! You're learning and improving! 🌱";
        } else {
            return "Keep practicing! Every step is progress! 🛤️";
        }
    };

    const encouragementMessage = quizCompleted && totalAnswered > 0 ? getEncouragementMessage() : null;

    const renderQuizComponent = () => {
        // Remove "exercise_" prefix and ".json" suffix
        const exerciseType = file.replace("exercise_", "").replace(".json", "");

        switch (exerciseType) {
            case "dictation":
                return (
                    <DictationQuiz
                        quiz={quiz}
                        instructions={instructions}
                        onAnswer={handleAnswer}
                        onQuit={handleQuizQuit}
                    />
                );
            case "matchup":
                return (
                    <MatchUp quiz={quiz} instructions={instructions} onAnswer={handleAnswer} onQuit={handleQuizQuit} />
                );
            case "reordering":
                return (
                    <Reordering
                        quiz={quiz}
                        instructions={instructions}
                        onAnswer={handleAnswer}
                        onQuit={handleQuizQuit}
                        split={split}
                    />
                );
            case "sound_n_spelling":
                return (
                    <SoundAndSpelling
                        quiz={quiz}
                        instructions={instructions}
                        onAnswer={handleAnswer}
                        onQuit={handleQuizQuit}
                    />
                );
            default:
                return <Card.Body>This quiz type is not yet implemented.</Card.Body>;
        }
    };

    return (
        <>
            {isloading ? (
                <LoadingOverlay />
            ) : (
                <>
                    <h3 className="mt-4">Type: {heading}</h3>
                    <Row className="mt-2 g-4">
                        <Col md={4}>
                            <Card className="mb-4 h-100 shadow-sm">
                                <Card.Header className="fw-semibold">{title}</Card.Header>
                                <Card.Body>
                                    <p>
                                        <strong>Accent:</strong> {accent}
                                    </p>
                                    <p>
                                        <strong>Instructions:</strong>
                                    </p>
                                    {instructions.map((instruction, index) => (
                                        <p key={index}>{instruction}</p>
                                    ))}
                                    <Button variant="primary" onClick={onBack}>
                                        <ArrowLeftCircle /> Back to exercise list
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={8}>
                            <Card className="mb-4 shadow-sm">
                                {!quizCompleted ? (
                                    renderQuizComponent()
                                ) : (
                                    <>
                                        <Card.Header className="fw-semibold">Result</Card.Header>
                                        <Card.Body>
                                            <p>
                                                You have answered {score} out of {totalAnswered} correctly.
                                            </p>
                                            {encouragementMessage && <p>{encouragementMessage}</p>}
                                            <Button variant="secondary" onClick={handleQuizRestart}>
                                                <ArrowRepeat /> Restart quiz
                                            </Button>
                                        </Card.Body>
                                    </>
                                )}
                            </Card>
                            {quizCompleted ? (
                                ""
                            ) : (
                                <Card className="mt-4 shadow-sm">
                                    <Card.Header className="fw-semibold">Review</Card.Header>
                                    <Card.Body>
                                        <p>
                                            You have answered {score} out of {totalAnswered} correctly.
                                        </p>
                                        <p>{getEncouragementMessage()}</p>
                                        <p>Try this exercise again for further practice and different questions.</p>
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
