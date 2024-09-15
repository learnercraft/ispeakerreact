import { useEffect, useState } from "react";
import { Alert, Button, Card } from "react-bootstrap";
import { ArrowLeftCircle, ExclamationTriangleFill } from "react-bootstrap-icons";
import VideoDownloadTable from "./VideoDownloadTable";

const VideoDownloadSubPage = ({ onGoBack }) => {
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

    return (
        <div className="">
            <Button variant="primary" className="mb-4" onClick={onGoBack}>
                <ArrowLeftCircle /> Back to settings
            </Button>
            <h4 className="mb-4">Download video files for offline watching</h4>
            <Card className="mb-4">
                <Card.Header>
                    <div className="fw-semibold">Instructions</div>
                </Card.Header>
                <Card.Body>
                    <p>
                        <span className="fw-bold">Step 1.</span> Click on the “Download” link to download the video file
                        you want to watch offline.
                    </p>
                    <p>
                        <span className="fw-bold">Step 2.</span> Click on the “Open download folder” button, and move
                        the file(s) you have downloaded into there.
                    </p>
                    <p>
                        <span className="fw-bold">Step 3.</span> Click on the “Back to settings” button (or any page),
                        and then go back to this page. This is to refresh the state of the file downloaded status.
                    </p>
                    <p>
                        <span className="fw-bold">Step 4.</span> Click on the “Verify” button, and wait until the
                        verification process is finished.
                    </p>
                    <Alert className="mb-0" variant="warning">
                        <Alert.Heading as="h5" className="fw-semibold">
                            <ExclamationTriangleFill /> Warning!
                        </Alert.Heading>
                        <div className="fw-semibold">
                            Do not manually extract, rename the file(s), or modify the zip file’s content. Doing so will
                            make the verification process fail.
                        </div>
                    </Alert>
                </Card.Body>
            </Card>
            <Button variant="primary" className="mb-4" onClick={handleOpenFolder}>
                Open download folder
            </Button>
            <VideoDownloadTable data={zipFileData} />
        </div>
    );
};

export default VideoDownloadSubPage;
