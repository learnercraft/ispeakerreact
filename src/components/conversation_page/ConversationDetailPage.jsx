import { useEffect, useState } from "react";
import { Button, Card, Nav } from "react-bootstrap";
import { ArrowLeftCircle, CameraVideo, CardChecklist, ChatDots, Headphones } from "react-bootstrap-icons";
import LoadingOverlay from "../general/LoadingOverlay";
import ToastNotification from "../general/ToastNotification";
import ListeningTab from "./ListeningTab";
import PracticeTab from "./PracticeTab";
import ReviewTab from "./ReviewTab";
import WatchAndStudyTab from "./WatchAndStudyTab";
import { getFileFromIndexedDB, saveFileToIndexedDB } from "../setting_page/offlineStorageDb";
import { useIsElectron } from "../../utils/isElectron";

const ConversationDetailPage = ({ id, accent, title, onBack }) => {
    const [activeTab, setActiveTab] = useState("#watch_and_study");
    const [loading, setLoading] = useState(true);
    const [accentData, setAccentData] = useState(null);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const isElectron = useIsElectron();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // If it's not an Electron environment, check IndexedDB first
                if (!isElectron) {
                    const cachedDataBlob = await getFileFromIndexedDB("conversation_data.json", "json");

                    if (cachedDataBlob) {
                        // Convert Blob to text, then parse the JSON
                        const cachedDataText = await cachedDataBlob.text();
                        const cachedData = JSON.parse(cachedDataText);
                        const conversationData = cachedData[id]?.[0];
                        const accentData = conversationData[accent === "british" ? "BrE" : "AmE"];
                        setAccentData(accentData);

                        setLoading(false);

                        return;
                    }
                }

                // If not in IndexedDB or running in Electron, fetch from the network
                const response = await fetch(`${import.meta.env.BASE_URL}json/conversation_data.json`);
                const data = await response.json();

                // Find the correct conversation data in the array based on the ID
                const conversationData = data[id]?.[0];

                if (conversationData) {
                    const accentData = conversationData[accent === "british" ? "BrE" : "AmE"];
                    setAccentData(accentData); // Set the accent-specific data

                    setLoading(false);
                } else {
                    console.error("Conversation not found.");
                }

                // Save the fetched data to IndexedDB (excluding Electron)
                if (!isElectron) {
                    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
                    await saveFileToIndexedDB("conversation_data.json", blob, "json");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Error while loading the data for this section. Please check your Internet connection.");
            }
        };
        fetchData();
    }, [id, isElectron, accent]);

    const accentDisplay = accentData === "british" ? "British English" : "American English";

    return (
        <>
            <h3 className="mt-4">Topic: {title}</h3>
            <p>Accent: {accentDisplay}</p>
            <Button variant="primary" className="my-3" onClick={onBack}>
                <ArrowLeftCircle className="me-1" /> Back to conversation list
            </Button>
            {loading ? (
                <LoadingOverlay />
            ) : (
                <Card className="mt-2 shadow-sm">
                    <Card.Header>
                        <Nav
                            variant="pills"
                            activeKey={activeTab}
                            onSelect={(selectedKey) => setActiveTab(selectedKey)}>
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
            )}

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
