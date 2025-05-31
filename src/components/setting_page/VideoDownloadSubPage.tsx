import { useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { BsArrowLeft } from "react-icons/bs";
import { IoWarningOutline } from "react-icons/io5";
import { LuExternalLink } from "react-icons/lu";
import isElectron from "../../utils/isElectron.js";
import VideoDownloadTable, { VideoFileData, DownloadStatus } from "./VideoDownloadTable.js";

const VideoDownloadSubPage = ({ onGoBack }: { onGoBack: () => void }) => {
    const { t } = useTranslation();

    const [, setFolderPath] = useState<string | null>(null);
    const [zipFileData, setZipFileData] = useState<VideoFileData[]>([]);
    const [isDownloaded, setIsDownloaded] = useState<DownloadStatus[]>([]);
    const [tableLoading, setTableLoading] = useState(true);

    const handleOpenFolder = async () => {
        // Send an IPC message to open the folder and get the folder path
        const videoFolder = await window.electron.ipcRenderer.invoke("get-video-save-folder");
        setFolderPath(videoFolder as string); // Save the folder path in state
    };

    // Fetch JSON data from Electron's main process via IPC when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await window.electron.ipcRenderer.invoke("get-video-file-data");
                setZipFileData(data as VideoFileData[]); // Set the JSON data into the state
            } catch (error) {
                console.error("Error reading JSON file:", error); // Handle any error
                if (isElectron()) {
                    window.electron.log("error", `Error reading JSON file: ${error}`);
                }
            }
        };

        fetchData(); // Call fetchData when component mounts
    }, []); // Empty dependency array means this effect runs once when the component mounts

    const checkDownloadedFiles = useCallback(async () => {
        try {
            const downloadedFiles = await window.electron.ipcRenderer.invoke("check-downloads");
            let downloadedList: string[] = [];
            if (Array.isArray(downloadedFiles)) {
                downloadedList = downloadedFiles as string[];
            } else if (typeof downloadedFiles === "string") {
                // If the string is "no zip files downloaded", treat as empty
                downloadedList = [];
            }
            if (isElectron()) {
                window.electron.log("log", `Downloaded files in folder: ${downloadedList}`);
            }

            // Initialize fileStatus as an array to hold individual statuses
            const newFileStatus: DownloadStatus[] = [];

            for (const item of zipFileData) {
                let extractedFolderExists = false;
                try {
                    const result = await window.electron.ipcRenderer.invoke(
                        "check-extracted-folder",
                        item.zipFile.replace(".7z", ""),
                        item.zipContents
                    );
                    extractedFolderExists = Boolean(result);
                } catch (error) {
                    console.error(`Error checking extracted folder for ${item.zipFile}:`, error);
                    if (isElectron()) {
                        window.electron.log(
                            "error",
                            `Error checking extracted folder for ${item.zipFile}: ${error}`
                        );
                    }
                    extractedFolderExists = false; // Default to false if there's an error
                }

                const isDownloadedFile = downloadedList.includes(item.zipFile);
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
            if (isElectron()) {
                window.electron.log(
                    "error",
                    `Error checking downloaded or extracted files: ${error}`
                );
            }
        }
    }, [zipFileData]);

    useEffect(() => {
        if (zipFileData.length > 0) {
            setTableLoading(true);
            checkDownloadedFiles().finally(() => setTableLoading(false));
        }
    }, [zipFileData, checkDownloadedFiles]);

    // i18next returns $SpecialObject for returnObjects: true, so cast to string[]
    const localizedInstructionStep = t("settingPage.videoDownloadSettings.steps", {
        returnObjects: true,
    }) as string[];
    const stepCount = Array.isArray(localizedInstructionStep) ? localizedInstructionStep.length : 0;
    const stepKeys = Array.from(
        { length: stepCount },
        (_, i) => `settingPage.videoDownloadSettings.steps.${i}`
    );

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

            <div className="card card-lg card-border my-4 shadow-xs dark:border-slate-600">
                <div className="card-body">
                    <div className="card-title font-semibold">
                        {t("settingPage.videoDownloadSettings.instructionCardHeading")}
                    </div>
                    <div className="divider divider-secondary mt-0"></div>
                    {stepKeys.map((key, index) => (
                        <p key={key}>
                            <Trans
                                i18nKey={key}
                                values={{ number: index + 1 }}
                                components={{ 1: <span className="font-bold" /> }}
                            />
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
                    <LuExternalLink className="h-5 w-5" />
                </button>

                <button type="button" className="btn btn-secondary" onClick={checkDownloadedFiles}>
                    {t("settingPage.videoDownloadSettings.refreshDownloadStateBtn")}
                </button>
            </div>

            {tableLoading ? (
                <div className="my-12 flex justify-center">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
            ) : (
                <VideoDownloadTable
                    data={zipFileData}
                    isDownloaded={isDownloaded}
                    t={t}
                    onStatusChange={checkDownloadedFiles}
                />
            )}
        </div>
    );
};

export default VideoDownloadSubPage;
