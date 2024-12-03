import { useEffect, useState } from "react";
import { Button, Modal, ProgressBar, Table } from "react-bootstrap";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

const VideoDownloadTable = ({ data }) => {
    const { t } = useTranslation();

    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [selectedZip, setSelectedZip] = useState(null);
    const [verifyFiles, setVerifyFiles] = useState([]);
    const [progress, setProgress] = useState(0);
    const [isDownloaded, setIsDownloaded] = useState({});
    const [modalMessage, setModalMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(null);
    const [progressText, setProgressText] = useState("Initializing...");
    const [isPercentage, setIsPercentage] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleProgressUpdate = (event, percentage) => {
            setProgress(percentage);
            setIsPercentage(true); // Use percentage-based progress
        };

        const handleProgressText = (event, text) => {
            setProgressText(text); // Update progress text
            setIsPercentage(false); // Not percentage-based, show full progress bar
        };

        const handleVerificationSuccess = (event, message) => {
            setModalMessage(message);
            setIsSuccess(true);
            setShowProgressModal(false); // Hide modal after success
        };

        const handleVerificationError = (event, message) => {
            setModalMessage(message);
            setIsSuccess(false);
            setShowProgressModal(false); // Hide modal on error
        };

        window.electron.ipcRenderer.on("progress-update", handleProgressUpdate);
        window.electron.ipcRenderer.on("progress-text", handleProgressText);
        window.electron.ipcRenderer.on("verification-success", handleVerificationSuccess);
        window.electron.ipcRenderer.on("verification-error", handleVerificationError);

        return () => {
            window.electron.ipcRenderer.removeAllListeners("progress-update");
            window.electron.ipcRenderer.removeAllListeners("progress-text");
            window.electron.ipcRenderer.removeAllListeners("verification-success");
            window.electron.ipcRenderer.removeAllListeners("verification-error");
        };
    }, []);

    // Function to check if a zip file exists in the folder
    useEffect(() => {
        const checkDownloadedFiles = async () => {
            try {
                const downloadedFiles = await window.electron.ipcRenderer.invoke("check-downloads");
                console.log("Downloaded files in folder:", downloadedFiles); // Log detected files in the folder

                const fileStatus = {};

                for (const item of data) {
                    // Pass both folder name and zipContents to check the extracted folder
                    const extractedFolderExists = await window.electron.ipcRenderer.invoke(
                        "check-extracted-folder",
                        item.zipFile.replace(".7z", ""), // Folder name
                        item.zipContents // Expected contents (extracted files)
                    );

                    if (extractedFolderExists) {
                        // If extracted folder exists, consider it as downloaded
                        fileStatus[item.zipFile] = true;
                        console.log(`Extracted folder exists for ${item.zipFile}`);
                    } else {
                        // Fallback: check if the .7z file exists in the download folder
                        const isDownloadedFile = downloadedFiles.includes(item.zipFile);
                        console.log(`Checking if ${item.zipFile} is in downloaded files:`, isDownloadedFile);
                        fileStatus[item.zipFile] = isDownloadedFile;
                    }
                }

                console.log("File status for all files:", fileStatus); // Log the status for each file
                setIsDownloaded(fileStatus); // Update the state
            } catch (error) {
                console.error("Error checking downloaded or extracted files:", error);
            }
        };

        checkDownloadedFiles();
    }, [data]);

    const handleVerify = (zip) => {
        setSelectedZip(zip);

        // Only set the file being verified, not all files
        const fileToVerify = zip.name ? [{ name: zip.name }] : [];
        setVerifyFiles(fileToVerify); // Set the specific file being verified

        setShowVerifyModal(true); // Open the modal
    };

    const handleNextModal = () => {
        setShowVerifyModal(false);
        setShowProgressModal(true);
        setProgressText("Verifying extracted files...");
        // Start the verification process
        window.electron.ipcRenderer.send("verify-and-extract", selectedZip);
    };

    const handleCloseModal = () => {
        setShowVerifyModal(false);
        setVerifyFiles([]); // Clear after closing the modal
    };

    return (
        <>
            <Table responsive striped bordered hover>
                <thead>
                    <tr className="align-middle text-center">
                        <th>{t("settingPage.videoDownloadSettings.downloadTable.nameHeading")}</th>
                        <th>{t("settingPage.videoDownloadSettings.downloadTable.fileSizeTotalHeading")}</th>
                        <th>{t("settingPage.videoDownloadSettings.downloadTable.linkHeading")}</th>
                        <th>{t("settingPage.videoDownloadSettings.downloadTable.downloadStatusHeading")}</th>
                        <th>{t("settingPage.videoDownloadSettings.downloadTable.actionHeading")}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr className="align-middle" key={item.zipFile}>
                            <td>{t(item.name)}</td>
                            <td className="text-center">{(item.fileSize / (1024 * 1024)).toFixed(2)} MB</td>
                            <td className="text-center">
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => window.electron.openExternal(item.link)}>
                                    {t("settingPage.videoDownloadSettings.downloadTable.downloadLink")}
                                </Button>
                            </td>
                            <td className="text-center">
                                {isDownloaded[item.zipFile] ? (
                                    <CheckCircleFill className="text-success" />
                                ) : (
                                    <XCircleFill className="text-danger" />
                                )}
                            </td>
                            <td className="text-center">
                                <Button onClick={() => handleVerify(item)} disabled={!isDownloaded[item.zipFile]}>
                                    {t("settingPage.videoDownloadSettings.downloadTable.verifyBtn")}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showVerifyModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{t("settingPage.videoDownloadSettings.verifyModalHeading")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {verifyFiles.length > 0 ? (
                        <>
                            <p>{t("settingPage.videoDownloadSettings.verifyTitle")}</p>
                            <ul>
                                {verifyFiles.map((file, idx) => (
                                    <li key={idx}>{file.name}</li>
                                ))}
                            </ul>
                            <p className="mb-0">{t("settingPage.videoDownloadSettings.verifyFooter")}</p>
                        </>
                    ) : (
                        <p>Either you haven’t downloaded the file(s) yet, or the filename does not match.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        {t("settingPage.exerciseSettings.cancelBtn")}
                    </Button>
                    <Button variant="primary" onClick={handleNextModal} disabled={verifyFiles.length === 0}>
                        {t("settingPage.videoDownloadSettings.nextBtn")}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showProgressModal || modalMessage !== ""}>
                <Modal.Header>
                    <Modal.Title>
                        {isSuccess === null
                            ? t("settingPage.videoDownloadSettings.inProgressModalHeading")
                            : isSuccess
                            ? t("settingPage.videoDownloadSettings.verifySuccess")
                            : t("settingPage.videoDownloadSettings.verifyFailed")}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isSuccess === null ? (
                        <>
                            <p>{progressText}</p> {/* Show the current progress text */}
                            <ProgressBar
                                animated={!isPercentage}
                                now={isPercentage ? progress : 100} // Show percentage if available, otherwise full progress bar
                                label={isPercentage ? `${progress}%` : null} // Show label only if percentage is shown
                            />
                        </>
                    ) : (
                        <p className="text-break">{modalMessage}</p> // Show success/error message
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalMessage("")} disabled={isSuccess === null}>
                        {t("sound_page.closeBtn")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default VideoDownloadTable;
