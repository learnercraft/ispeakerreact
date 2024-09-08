import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Suspense, lazy, useEffect, useState } from "react";
import { Button, Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import AccentLocalStorage from "../../utils/AccentLocalStorage";
import { useIsElectron } from "../../utils/isElectron";
import AccentDropdown from "../general/AccentDropdown";
import LoadingOverlay from "../general/LoadingOverlay";
import TopNavBar from "../general/TopNavBar";
import { getFileFromIndexedDB, saveFileToIndexedDB } from "../setting_page/offlineStorageDb";

const ExamDetailPage = lazy(() => import("./ExamDetailPage"));

const ExamPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccent, setSelectedAccent] = AccentLocalStorage();
    const [selectedExam, setSelectedExam] = useState(null);
    const isElectron = useIsElectron();

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
        const fetchData = async () => {
            try {
                NProgress.start();
                setLoading(true);

                // If it's not an Electron environment, check IndexedDB first
                if (!isElectron) {
                    const cachedDataBlob = await getFileFromIndexedDB("examspeaking_list.json", "json");

                    if (cachedDataBlob) {
                        // Convert Blob to text, then parse the JSON
                        const cachedDataText = await cachedDataBlob.text();
                        const cachedData = JSON.parse(cachedDataText);

                        setData(cachedData.examList);
                        setLoading(false);
                        NProgress.done();
                        return;
                    }
                }

                // If not in IndexedDB or running in Electron, fetch from the network
                const response = await fetch(`${import.meta.env.BASE_URL}json/examspeaking_list.json`);
                const data = await response.json();

                setData(data.examList);
                setLoading(false);

                // Save the fetched data to IndexedDB (excluding Electron)
                if (!isElectron) {
                    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
                    await saveFileToIndexedDB("examspeaking_list.json", blob, "json");
                }

                NProgress.done();
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Error while loading the data for this section. Please check your Internet connection.");
                NProgress.done();
            }
        };
        fetchData();
    }, [isElectron]);

    useEffect(() => {
        // Save the selected accent to localStorage
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker")) || {};
        savedSettings.selectedAccent = selectedAccent;
        localStorage.setItem("ispeaker", JSON.stringify(savedSettings));
    }, [selectedAccent]);

    const handleGoBack = () => {
        setSelectedExam(null);
    };

    useEffect(() => {
        document.title = "Exams | SpeakerReact";
    }, []);

    return (
        <>
            <TopNavBar />
            <h1 className="fw-semibold">Exams</h1>
            {selectedExam ? (
                <Suspense fallback={<LoadingOverlay />}>
                    <ExamDetailPage
                        id={selectedExam.id}
                        accent={selectedAccent}
                        title={selectedExam.title}
                        onBack={handleGoBack}
                    />
                </Suspense>
            ) : (
                <>
                    <AccentDropdown onAccentChange={setSelectedAccent} />
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
