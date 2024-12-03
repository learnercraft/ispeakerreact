import { useEffect, useState } from "react";
import { Alert, Button, Card } from "react-bootstrap";
import { ArrowLeftCircle, ExclamationTriangleFill } from "react-bootstrap-icons";
import { Trans, useTranslation } from "react-i18next";
import VideoDownloadTable from "./VideoDownloadTable";

const VideoDownloadSubPage = ({ onGoBack }) => {
    const { t } = useTranslation();

    const [folderPath, setFolderPath] = useState(null);
    const [zipFileData, setZipFileData] = useState([]);

    const handleOpenFolder = async () => {
        // Send an IPC message to open the folder and get the folder path
        const videoFolder = await window.electron.ipcRenderer.invoke("get-video-save-folder");
        setFolderPath(videoFolder); // Save the folder path in state
    };

    // Fetch JSON data from Electron's main process via IPC when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await window.electron.ipcRenderer.invoke("get-video-file-data");
                setZipFileData(data); // Set the JSON data into the state
            } catch (error) {
                console.error("Error reading JSON file:", error); // Handle any error
            }
        };

        fetchData(); // Call fetchData when component mounts
    }, []); // Empty dependency array means this effect runs once when the component mounts

    const localizedInstructionStep = t("settingPage.videoDownloadSettings.steps", { returnObjects: true });

    return (
        <div className="">
            <Button variant="primary" className="mb-4" onClick={onGoBack}>
                <ArrowLeftCircle /> {t("settingPage.videoDownloadSettings.backToSettingsBtn")}
            </Button>
            <h4 className="mb-4">{t("settingPage.videoDownloadSettings.videoPageHeading")}</h4>
            <Card className="mb-4">
                <Card.Header>
                    <div className="fw-semibold">{t("settingPage.videoDownloadSettings.instructionCardHeading")}</div>
                </Card.Header>
                <Card.Body>
                    {localizedInstructionStep.map((step, index) => (
                        <p key={index}>
                            <Trans values={{ number: index + 1 }} components={{ 1: <span className="fw-bold" /> }}>
                                {step}
                            </Trans>
                        </p>
                    ))}

                    <Alert className="mb-0" variant="warning">
                        <Alert.Heading as="h5" className="fw-semibold">
                            <ExclamationTriangleFill /> {t("settingPage.videoDownloadSettings.warningHeading")}
                        </Alert.Heading>
                        <div className="fw-semibold">{t("settingPage.videoDownloadSettings.warningBody")}</div>
                    </Alert>
                </Card.Body>
            </Card>
            <Button variant="primary" className="mb-4" onClick={handleOpenFolder}>
                {t("settingPage.videoDownloadSettings.openDownloadBtn")}
            </Button>
            <VideoDownloadTable data={zipFileData} />
        </div>
    );
};

export default VideoDownloadSubPage;
