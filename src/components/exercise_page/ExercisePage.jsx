import React, { useEffect, useState } from "react";
import { Card, Col, Dropdown, Row, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import TopNavBar from "../general/TopNavBar";
import LoadingOverlay from "../general/LoadingOverlay";
import ExerciseDetailPage from "./ExerciseDetailPage";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const ExercisePage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccent, setSelectedAccent] = useState(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker"));
        return savedSettings?.selectedAccent || "american";
    });
    const [selectedExercise, setSelectedExercise] = useState(null);

    const selectedAccentOptions = [
        { name: "American English", value: "american" },
        { name: "British English", value: "british" },
    ];

    const TooltipIcon = ({ info }) => (
        <OverlayTrigger overlay={<Tooltip>{info}</Tooltip>} trigger={["hover", "focus"]}>
            <InfoCircle className="ms-1" />
        </OverlayTrigger>
    );

    const handleSelectExercise = (exercise) => {
        setSelectedExercise({
            id: exercise.id,
            title: exercise.title,
            accent: selectedAccentOptions.find((item) => item.value === selectedAccent).name,
            file: exercise.file, // Only pass the file name
        });
    };

    const ExerciseCard = ({ heading, titles, info, file }) => (
        <Col>
            <Card className="mb-4 h-100 shadow-sm">
                <Card.Header className="fw-semibold">{heading}</Card.Header>
                <Card.Body>
                    {titles
                        .filter(({ american, british }) => {
                            if (selectedAccent === "american" && american === false) return false;
                            if (selectedAccent === "british" && british === false) return false;
                            return true;
                        })
                        .map((exercise, index) => (
                            <Card.Text key={index} className="">
                                <Button
                                    variant="link"
                                    className="p-0 m-0"
                                    onClick={() => handleSelectExercise({ ...exercise, file })}>
                                    {exercise.title}
                                </Button>
                                <TooltipIcon
                                    info={exercise["info-random"] ? exercise["info-random"] : exercise.info || info}
                                />
                            </Card.Text>
                        ))}
                </Card.Body>
            </Card>
        </Col>
    );

    useEffect(() => {
        NProgress.start();
        fetch("/json/exercise_list.json")
            .then((response) => response.json())
            .then((data) => {
                setData(data.exerciseList);
                setLoading(false);
                NProgress.done();
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                alert("Error while loading the data for this section. Please check your Internet connection.");
                NProgress.done();
            });
    }, []);

    useEffect(() => {
        // Save the selected accent to localStorage
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker")) || {};
        savedSettings.selectedAccent = selectedAccent;
        localStorage.setItem("ispeaker", JSON.stringify(savedSettings));
    }, [selectedAccent]);

    const handleGoBack = () => {
        setSelectedExercise(null);
    };

    return (
        <>
            <TopNavBar />
            <h1 className="fw-semibold">Exercises (beta)</h1>
            {selectedExercise ? (
                <ExerciseDetailPage
                    id={selectedExercise.id}
                    title={selectedExercise.title}
                    accent={selectedExercise.accent}
                    instructions={selectedExercise.instructions}
                    file={selectedExercise.file}
                    onBack={handleGoBack}
                />
            ) : (
                <>
                    <Dropdown className="my-4">
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            <span className="fw-semibold">Accent:</span>{" "}
                            {selectedAccentOptions.find((item) => item.value === selectedAccent).name}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {selectedAccentOptions.map((item) => (
                                <Dropdown.Item
                                    key={item.value}
                                    onClick={() => setSelectedAccent(item.value)}
                                    active={selectedAccent === item.value}>
                                    {item.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <p>Select an exercise to get started.</p>
                    {loading ? (
                        <LoadingOverlay />
                    ) : (
                        <Row xs={1} md={4} className="g-4 mt-1 d-flex justify-content-center">
                            {data.map((section, index) => (
                                <ExerciseCard
                                    key={index}
                                    heading={section.heading}
                                    titles={section.titles}
                                    info={section.info}
                                    file={section.file}
                                />
                            ))}
                        </Row>
                    )}
                </>
            )}
        </>
    );
};

export default ExercisePage;
