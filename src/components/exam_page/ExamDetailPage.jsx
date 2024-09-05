import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Nav, Row } from "react-bootstrap";
import { ArrowLeftCircle, CameraVideo, CardChecklist, ChatDots, Headphones, InfoCircle } from "react-bootstrap-icons";
import LoadingOverlay from "../general/LoadingOverlay";
import ToastNotification from "../general/ToastNotification";
import ListeningTab from "./ListeningTab";
import PracticeTab from "./PracticeTab";
import ReviewTab from "./ReviewTab";
import WatchAndStudyTab from "./WatchAndStudyTab";

const ExamDetailPage = ({ id, title, onBack, accent }) => {
    const [activeTab, setActiveTab] = useState("#watch_and_study");
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        // Fetch the exam data from the JSON file
        fetch(`${import.meta.env.BASE_URL}json/examspeaking_data.json`)
            .then((response) => response.json())
            .then((data) => {
                setExamData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching exam data:", error);
                alert("Error while loading the data for this section. Please check your Internet connection.");
                setLoading(false);
            });
    }, []);

    // Check if data is still loading
    if (loading) {
        return <LoadingOverlay />;
    }

    // Check if examData is available
    if (!examData || !examData[id]) {
        return <Alert variant="warning">Error while loading the data. Please try refreshing the page.</Alert>;
    }

    const examDetails = examData[id];
    const accentDisplay = accent === "british" ? "British English" : "American English";

    return (
        <>
            <Row className="mb-2">
                <Col md={3}>
                    <h3 className="mt-4">Task: {title}</h3>
                    <p>Accent: {accentDisplay}</p>
                    <Button variant="primary" className="my-3" onClick={onBack}>
                        <ArrowLeftCircle className="me-1" /> Back to exam list
                    </Button>
                </Col>
                <Col>
                    {examDetails.description && (
                        <Alert variant="info">
                            <Alert.Heading as="p" className="mb-2">
                                <InfoCircle className="me-2" />
                                <strong>Task info</strong>
                            </Alert.Heading>
                            {examDetails.description.map((desc, index) => (
                                <p key={index} className={index === examDetails.description.length - 1 ? "mb-0" : ""}>
                                    {desc}
                                </p>
                            ))}
                        </Alert>
                    )}
                </Col>
            </Row>

            <Card className="mt-2 shadow-sm">
                <Card.Header>
                    <Nav variant="pills" activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
                        <Nav.Item>
                            <Nav.Link eventKey="#watch_and_study">
                                <CameraVideo /> Watch
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="#listen">
                                <Headphones /> Listen
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="#practice">
                                <ChatDots /> Practice
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="#review">
                                <CardChecklist /> Review
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body>
                    {activeTab === "#watch_and_study" && (
                        <WatchAndStudyTab
                            videoUrl={examDetails.watch_and_study.videoLink}
                            taskData={examDetails.watch_and_study.taskData}
                            dialog={examDetails.watch_and_study.study.dialog}
                            skills={examDetails.watch_and_study.study.skills}
                        />
                    )}
                    {activeTab === "#listen" && (
                        <ListeningTab
                            subtopicsBre={examDetails.listen.BrE?.subtopics || []}
                            subtopicsAme={examDetails.listen.AmE?.subtopics || []}
                            currentAccent={accent}
                        />
                    )}
                    {activeTab === "#practice" && (
                        <PracticeTab
                            examId={id}
                            accent={accent}
                            taskData={examDetails.practise.task}
                            tips={examDetails.practise.tips}
                            setToastMessage={setToastMessage}
                            setShowToast={setShowToast}
                        />
                    )}
                    {activeTab === "#review" && <ReviewTab reviews={examDetails.reviews} examId={id} accent={accent} />}
                </Card.Body>
            </Card>
            <ToastNotification
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
                variant="warning"
            />
        </>
    );
};

export default ExamDetailPage;
