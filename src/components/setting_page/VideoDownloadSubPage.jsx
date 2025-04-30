import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { BsArrowLeft } from "react-icons/bs";
import { IoWarningOutline } from "react-icons/io5";
import { isElectron } from "../../utils/isElectron";
import VideoDownloadTable from "./VideoDownloadTable";

const VideoDownloadSubPage = ({ onGoBack }) => {
    const { t } = useTranslation();

    const [, setFolderPath] = useState(null);
    const [zipFileData, setZipFileData] = useState([]);
    const [isDownloaded, setIsDownloaded] = useState({});

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
                isElectron() && window.electron.log("error", `Error reading JSON file: ${error}`);
            }
        };

        fetchData(); // Call fetchData when component mounts
    }, []); // Empty dependency array means this effect runs once when the component mounts

    const checkDownloadedFiles = useCallback(async () => {
        try {
            const downloadedFiles = await window.electron.ipcRenderer.invoke("check-downloads");
            console.log("Downloaded files in folder:", downloadedFiles);
            isElectron() &&
                window.electron.log("log", `Downloaded files in folder: ${downloadedFiles}`);

            // Initialize fileStatus as an array to hold individual statuses
            const newFileStatus = [];

            for (const item of zipFileData) {
                let extractedFolderExists;
                try {
                    extractedFolderExists = await window.electron.ipcRenderer.invoke(
                        "check-extracted-folder",
                        item.zipFile.replace(".7z", ""),
                        item.zipContents
                    );
                } catch (error) {
                    console.error(`Error checking extracted folder for ${item.zipFile}:`, error);
                    isElectron() &&
                        window.electron.log(
                            "error",
                            `Error checking extracted folder for ${item.zipFile}: ${error}`
                        );
                    extractedFolderExists = false; // Default to false if there's an error
                }

                const isDownloadedFile = downloadedFiles.includes(item.zipFile);
                newFileStatus.push({
                    zipFile: item.zipFile,
                    isDownloaded: isDownloadedFile,
                    hasExtractedFolder: extractedFolderExists,
                });
            }

            // Update the state with an array of statuses instead of a single object
            setIsDownloaded(newFileStatus);
            console.log(newFileStatus);
        } catch (error) {
            console.error("Error checking downloaded or extracted files:", error);
            isElectron() &&
                window.electron.log(
                    "error",
                    `Error checking downloaded or extracted files: ${error}`
                );
        }
    }, [zipFileData]);

    useEffect(() => {
        checkDownloadedFiles();
    }, [zipFileData, checkDownloadedFiles]);

    const localizedInstructionStep = t("settingPage.videoDownloadSettings.steps", {
        returnObjects: true,
    });

    return (
        <div>
            <div className="flex flex-row items-center">
                <BsArrowLeft className="me-2 h-6 w-6" />
                <div className="breadcrumbs text-xl">
                    <ul>
                        <li>
                            <a className="link" onClick={onGoBack}>
                                {t("navigation.settings")}
                            </a>
                        </li>
                        <li>{t("settingPage.videoDownloadSettings.videoDownloadHeading")}</li>
                    </ul>
                </div>
            </div>

            <h4 className="my-4 text-xl font-semibold">
                {t("settingPage.videoDownloadSettings.videoPageHeading")}
            </h4>

            <div className="card card-lg card-border my-4">
                <div className="card-body">
                    <div className="card-title font-semibold">
                        {t("settingPage.videoDownloadSettings.instructionCardHeading")}
                    </div>
                    <div className="divider divider-secondary mt-0"></div>
                    {localizedInstructionStep.map((step, index) => (
                        <p key={index}>
                            <Trans
                                values={{ number: index + 1 }}
                                components={{ 1: <span className="font-bold" /> }}
                            >
                                {step}
                            </Trans>
                        </p>
                    ))}

                    <div className="alert alert-warning my-2">
                        <IoWarningOutline className="h-6 w-6" />
                        <div>
                            <h3 className="font-bold">
                                {t("settingPage.videoDownloadSettings.warningHeading")}
                            </h3>
                            <div>{t("settingPage.videoDownloadSettings.warningBody")}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="my-4 flex justify-center gap-2">
                <button type="button" className="btn btn-primary" onClick={handleOpenFolder}>
                    {t("settingPage.videoDownloadSettings.openDownloadBtn")}
                </button>

                <button type="button" className="btn btn-secondary" onClick={checkDownloadedFiles}>
                    {t("settingPage.videoDownloadSettings.refreshDownloadStateBtn")}
                </button>
            </div>

            <VideoDownloadTable data={zipFileData} isDownloaded={isDownloaded} t={t} />
        </div>
    );
};

VideoDownloadSubPage.propTypes = {
    onGoBack: PropTypes.func.isRequired,
};

export default VideoDownloadSubPage;
