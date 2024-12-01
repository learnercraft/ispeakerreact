import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Nav, Row } from "react-bootstrap";
import { ArrowLeftCircle, CameraVideo, CardChecklist, ChatDots, Headphones, InfoCircle } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { isElectron } from "../../utils/isElectron";
import LoadingOverlay from "../general/LoadingOverlay";
import ToastNotification from "../general/ToastNotification";
import { getFileFromIndexedDB, saveFileToIndexedDB } from "../setting_page/offlineStorageDb";
import ListeningTab from "./ListeningTab";
import PracticeTab from "./PracticeTab";
import ReviewTab from "./ReviewTab";
import WatchAndStudyTab from "./WatchAndStudyTab";

const ExamDetailPage = ({ id, title, onBack, accent }) => {
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState("#watch_and_study");
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const [videoUrl, setVideoUrl] = useState(null);
    const [videoLoading, setVideoLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // If it's not an Electron environment, check IndexedDB first
                if (!isElectron()) {
                    const cachedDataBlob = await getFileFromIndexedDB("examspeaking_data.json", "json");

                    if (cachedDataBlob) {
                        // Convert Blob to text, then parse the JSON
                        const cachedDataText = await cachedDataBlob.text();
                        const cachedData = JSON.parse(cachedDataText);

                        setExamData(cachedData);
                        setLoading(false);
                        return;
                    }
                }

                setLoading(true);

                // If not in IndexedDB or running in Electron, fetch from the network
                const response = await fetch(`${import.meta.env.BASE_URL}json/examspeaking_data.json`);
                const data = await response.json();

                setExamData(data);
                setLoading(false);

                // Save the fetched data to IndexedDB (excluding Electron)
                if (!isElectron()) {
                    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
                    await saveFileToIndexedDB("examspeaking_data.json", blob, "json");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Error while loading the data for this section. Please check your Internet connection.");
            }
        };
        fetchData();
    }, []);

    // Use offline file if running in Electron
    useEffect(() => {
        const fetchVideoUrl = async () => {
            if (isElectron() && examData && examData[id]) {
                const videoFileName = examData[id].watch_and_study.offlineFile;
                const folderName = "iSpeakerReact_ExamVideos";

                const videoStreamUrl = `http://localhost:8998/video/${folderName}/${videoFileName}`;

                try {
                    // Make a HEAD request to check if the local video file exists
                    const response = await fetch(videoStreamUrl, { method: "HEAD" });

                    if (response.ok) {
                        // If the file exists, set the video URL to the local file
                        setVideoUrl(videoStreamUrl);
                    } else if (response.status === 404) {
                        // If the file doesn't exist, fall back to the Vimeo link
                        throw new Error("Local video file not found");
                    }
                } catch (error) {
                    console.warn("Falling back to Vimeo due to local video file not found:", error);
                    // Fallback to Vimeo video link
                    setVideoUrl(examData[id].watch_and_study.videoLink);
                }

                setVideoLoading(false); // Video URL is now loaded (either local or Vimeo)
            } else if (examData && examData[id]) {
                // This is the web case where we simply use the Vimeo link
                setVideoUrl(examData[id].watch_and_study.videoLink);
                setVideoLoading(false); // Video URL for web (Vimeo or other) is set
            }
        };

        fetchVideoUrl();
    }, [examData, id]);

    // Check if data is still loading
    if (loading || videoLoading) {
        return <LoadingOverlay />;
    }

    // Check if examData is available
    if (!examData || !examData[id]) {
        return <Alert variant="warning">{t("toast.loadingError")}</Alert>;
    }

    const examDetails = examData[id];
    const accentDisplay = accent === "british" ? "British English" : "American English";

    const examLocalizedDescArray = t(examDetails.description, { returnObjects: true });

    return (
        <>
            <Row className="mb-2">
                <Col md={3}>
                    <h3 className="mt-4">
                        {t("tabConversationExam.taskCard")}: {t(title)}
                    </h3>
                    <p>
                        {t("accent.accentSettings")}:{" "}
                        {t(accentDisplay === "british" ? "accent.accentBritish" : "accent.accentAmerican")}
                    </p>
                    <Button variant="primary" className="my-3" onClick={onBack}>
                        <ArrowLeftCircle className="me-1" /> {t("buttonConversationExam.examBackBtn")}
                    </Button>
                </Col>
                <Col>
                    {examDetails.description && (
                        <Alert variant="info">
                            <Alert.Heading as="p" className="mb-2">
                                <InfoCircle className="me-2" />
                                <strong>{t("examPage.taskInfo")}</strong>
                            </Alert.Heading>
                            {examLocalizedDescArray.map((desc, index) => (
                                <p key={index} className={index === examLocalizedDescArray.length - 1 ? "mb-0" : ""}>
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
                                <CameraVideo /> {t("buttonConversationExam.watchBtn")}
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="#listen">
                                <Headphones /> {t("buttonConversationExam.listenBtn")}
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="#practice">
                                <ChatDots /> {t("buttonConversationExam.practiceBtn")}
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="#review">
                                <CardChecklist /> {t("buttonConversationExam.reviewBtn")}
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body>
                    {activeTab === "#watch_and_study" && (
                        <WatchAndStudyTab
                            videoUrl={videoUrl}
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
