import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect, useState } from "react";
import { Button, Card, Nav } from "react-bootstrap";
import { ArrowLeftCircle, CameraVideo, CardChecklist, ChatDots, Headphones } from "react-bootstrap-icons";
import LoadingOverlay from "../general/LoadingOverlay";
import ToastNotification from "../general/ToastNotification";
import ListeningTab from "./ListeningTab";
import PracticeTab from "./PracticeTab";
import ReviewTab from "./ReviewTab";
import WatchAndStudyTab from "./WatchAndStudyTab";

const ConversationDetailPage = ({ id, accent, title, onBack }) => {
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState("#watch_and_study");

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        NProgress.start();
        fetch(`${import.meta.env.BASE_URL}json/conversation_data.json`)
            .then((response) => response.json())
            .then((data) => {
                // Find the correct conversation data in the array based on the ID
                const conversationData = data[id]?.[0];

                if (conversationData) {
                    setData(conversationData);
                } else {
                    console.error("Conversation not found.");
                }

                NProgress.done();
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                alert("Error while loading the data for this section. Please check your Internet connection.");
                NProgress.done();
            });
    }, [id]);

    if (!data) {
        return <LoadingOverlay />;
    }

    const accentData = data[accent === "british" ? "BrE" : "AmE"];
    const accentDisplay = accent === "british" ? "British English" : "American English";

    return (
        <>
            <h3 className="mt-4">Topic: {title}</h3>
            <p>Accent: {accentDisplay}</p>
            <Button variant="primary" className="my-3" onClick={onBack}>
                <ArrowLeftCircle className="me-1" /> Back to conversation list
            </Button>
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
                            videoUrl={accentData.watch_and_study.videoLink}
                            dialog={accentData.watch_and_study.study.dialog}
                            skillCheckmark={accentData.watch_and_study.study.skill_checkmark}
                        />
                    )}

                    {activeTab === "#listen" && <ListeningTab sentences={accentData.listen.subtopics} />}

                    {activeTab === "#practice" && (
                        <PracticeTab
                            accent={accent}
                            conversationId={id}
                            setToastMessage={setToastMessage}
                            setShowToast={setShowToast}
                        />
                    )}

                    {activeTab === "#review" && (
                        <ReviewTab reviews={accentData.reviews} accent={accent} conversationId={id} />
                    )}
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

export default ConversationDetailPage;
