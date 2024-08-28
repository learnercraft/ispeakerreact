import { useEffect, useState } from "react";
import { Card, Col, Dropdown, Row, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import TopNavBar from "../general/TopNavBar";
import LoadingOverlay from "../general/LoadingOverlay";
import ExamDetailPage from "./ExamDetailPage";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const ExamPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccent, setSelectedAccent] = useState(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker"));
        return savedSettings?.selectedAccent || "american";
    });
    const [selectedExam, setSelectedExam] = useState(null);

    const selectedAccentOptions = [
        { name: "American English", value: "american" },
        { name: "British English", value: "british" },
    ];

    const TooltipIcon = ({ exam_popup }) => (
        <OverlayTrigger
            overlay={
                <Tooltip>
                    {exam_popup.map((line, index) => (
                        <div key={index}>{line}</div>
                    ))}
                </Tooltip>
            }
            trigger={["hover", "focus"]}>
            <InfoCircle className="ms-1" />
        </OverlayTrigger>
    );

    const handleSelectExam = (id, title) => {
        const selected = data.find((section) => section.titles.some((title) => title.id === id));
        if (selected) {
            setSelectedExam({
                id,
                title,
                heading: selected.heading,
            });
        }
    };

    const ExamCard = ({ heading, titles }) => (
        <Col>
            <Card className="mb-4 h-100 shadow-sm">
                <Card.Header className="fw-semibold">{heading}</Card.Header>
                <Card.Body>
                    {titles.map(({ title, exam_popup, id }, index) => (
                        <Card.Text key={index} className="">
                            <Button variant="link" className="p-0 m-0" onClick={() => handleSelectExam(id, title)}>
                                {title}
                            </Button>
                            <TooltipIcon exam_popup={exam_popup} />
                        </Card.Text>
                    ))}
                </Card.Body>
            </Card>
        </Col>
    );

    useEffect(() => {
        NProgress.start();
        fetch("/json/examspeaking_list.json")
            .then((response) => response.json())
            .then((data) => {
                setData(data.examList);
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
        setSelectedExam(null);
    };

    return (
        <>
            <TopNavBar />
            <h1 className="fw-semibold">Exams</h1>
            {selectedExam ? (
                <ExamDetailPage
                    id={selectedExam.id}
                    accent={selectedAccent}
                    title={selectedExam.title}
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
                    <p>Select an exam task to get started.</p>
                    {loading ? (
                        <LoadingOverlay />
                    ) : (
                        <Row xs={1} md={3} className="g-4 mt-1 d-flex justify-content-center">
                            {data.map((section, index) => (
                                <ExamCard key={index} heading={section.heading} titles={section.titles} />
                            ))}
                        </Row>
                    )}
                </>
            )}
        </>
    );
};

export default ExamPage;
