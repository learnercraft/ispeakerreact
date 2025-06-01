import { useEffect, useRef, useState } from "react";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { LuExternalLink } from "react-icons/lu";

interface ExtractedFile {
    name: string;
    hash: string;
}

interface ZipContent {
    extractedFiles: ExtractedFile[];
}

export interface VideoFileData {
    zipFile: string;
    name: string;
    fileSize: number;
    link: string;
    zipHash: string;
    zipContents: ZipContent[];
}

export interface DownloadStatus {
    zipFile: string;
    isDownloaded: boolean;
    hasExtractedFolder: boolean;
}

interface VerificationError {
    type: string;
    name: string;
    message: string;
}

interface VideoDownloadTableProps {
    t: (key: string) => string;
    data: VideoFileData[];
    isDownloaded: DownloadStatus[];
    onStatusChange?: () => void | Promise<void>;
}

const VideoDownloadTable = ({ t, data, isDownloaded, onStatusChange }: VideoDownloadTableProps) => {
    const [, setShowVerifyModal] = useState<boolean>(false);
    const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
    const [selectedZip, setSelectedZip] = useState<VideoFileData | null>(null);
    const [verifyFiles, setVerifyFiles] = useState<ExtractedFile[]>([]);
    const [progress, setProgress] = useState<number>(0);
    const [modalMessage, setModalMessage] = useState<string>("");
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
    const [progressText, setProgressText] = useState<string>("");
    const [isPercentage, setIsPercentage] = useState<boolean>(false);
    const [progressError, setProgressError] = useState<boolean>(false);
    const [verificationErrors, setVerificationErrors] = useState<VerificationError[]>([]);

    const verifyModal = useRef<HTMLDialogElement>(null);
    const progressModal = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleProgressUpdate = (...args: unknown[]) => {
            const percentage = args[1] as number;
            setProgress(percentage);
            setIsPercentage(true);
        };

        const handleProgressText = (...args: unknown[]) => {
            const text = args[1] as string;
            setProgressText(t(text));
            setIsPercentage(false);
        };

        const handleVerificationSuccess = (...args: unknown[]) => {
            const data = args[1] as { messageKey: string; param: string };
            setModalMessage(`${t(data.messageKey)} ${data.param}`);
            setIsSuccess(true);
            setShowProgressModal(false);
            setVerificationErrors([]);
            if (onStatusChange) onStatusChange();
        };

        const handleVerificationError = (...args: unknown[]) => {
            const data = args[1] as { messageKey: string; param: string; errorMessage?: string };
            setModalMessage(
                `${t(data.messageKey)} ${data.param} ${data.errorMessage ? `Error message: ${data.errorMessage}` : ""}`
            );
            setIsSuccess(false);
            setShowProgressModal(false);
            setVerificationErrors([]);
            if (onStatusChange) onStatusChange();
        };

        const handleVerificationErrors = (...args: unknown[]) => {
            const errors = args[1] as VerificationError[];
            setVerificationErrors(errors);
            setIsSuccess(false);
            setShowProgressModal(false);
            setModalMessage("");
        };

        window.electron.ipcRenderer.on("progress-update", handleProgressUpdate);
        window.electron.ipcRenderer.on("progress-text", handleProgressText);
        window.electron.ipcRenderer.on("verification-success", handleVerificationSuccess);
        window.electron.ipcRenderer.on("verification-error", handleVerificationError);
        window.electron.ipcRenderer.on("verification-errors", handleVerificationErrors);

        return () => {
            window.electron.ipcRenderer.removeAllListeners("progress-update");
            window.electron.ipcRenderer.removeAllListeners("progress-text");
            window.electron.ipcRenderer.removeAllListeners("verification-success");
            window.electron.ipcRenderer.removeAllListeners("verification-error");
            window.electron.ipcRenderer.removeAllListeners("verification-errors");
        };
    }, [t, onStatusChange]);

    const handleVerify = async (zip: VideoFileData) => {
        if (onStatusChange) {
            // Await refresh if onStatusChange returns a promise
            await onStatusChange();
        }
        // Find the latest file status after refresh
        const fileStatus = isDownloaded.find((status) => status.zipFile === zip.zipFile);
        // Allow verify if extracted folder exists, even if not downloaded
        const fileToVerify =
            fileStatus && zip.name && (fileStatus.isDownloaded || fileStatus.hasExtractedFolder)
                ? [{ name: zip.name, hash: "" }]
                : fileStatus && fileStatus.hasExtractedFolder && zip.name
                  ? [{ name: zip.name, hash: "" }]
                  : [];
        setSelectedZip(zip);
        setVerifyFiles(fileToVerify);
        setShowVerifyModal(true);
        verifyModal.current?.showModal();
    };

    const handleNextModal = async () => {
        if (onStatusChange) {
            await onStatusChange();
        }
        const fileStatus = isDownloaded.find((status) => status.zipFile === selectedZip?.zipFile);
        // Allow verify if extracted folder exists, even if not downloaded
        const fileToVerify =
            fileStatus &&
            selectedZip?.name &&
            (fileStatus.isDownloaded || fileStatus.hasExtractedFolder)
                ? [{ name: selectedZip.name, hash: "" }]
                : fileStatus && fileStatus.hasExtractedFolder && selectedZip?.name
                  ? [{ name: selectedZip.name, hash: "" }]
                  : [];
        if (fileToVerify.length === 0) {
            setShowVerifyModal(false);
            setShowProgressModal(false);
            setIsSuccess(false);
            setProgressError(true);
            setProgressText("");
            setModalMessage(t("settingPage.videoDownloadSettings.verifyFailedMessage"));
            progressModal.current?.showModal();
            verifyModal.current?.close();
            return;
        }
        setShowVerifyModal(false);
        setShowProgressModal(true);
        setProgressError(false);
        setProgressText(t("settingPage.videoDownloadSettings.verifyinProgressMsg"));
        window.electron.ipcRenderer.send("verify-and-extract", selectedZip);
        progressModal.current?.showModal();
        verifyModal.current?.close();
    };

    const handleCloseVerifyModal = () => {
        setShowVerifyModal(false);
        setVerificationErrors([]);
        verifyModal.current?.close();
        setModalMessage("");
    };

    const handleCloseProgressModal = () => {
        setVerificationErrors([]);
        progressModal.current?.close();
        setModalMessage("");
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr className="text-center align-middle text-base">
                            <th>
                                {t("settingPage.videoDownloadSettings.downloadTable.nameHeading")}
                            </th>
                            <th>
                                {t(
                                    "settingPage.videoDownloadSettings.downloadTable.fileSizeTotalHeading"
                                )}
                            </th>
                            <th>
                                {t("settingPage.videoDownloadSettings.downloadTable.linkHeading")}
                            </th>
                            <th>
                                {t(
                                    "settingPage.videoDownloadSettings.downloadTable.downloadStatusHeading"
                                )}
                            </th>
                            <th>
                                {t("settingPage.videoDownloadSettings.downloadTable.actionHeading")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => {
                            // Find the corresponding download status for the current item
                            const fileStatus = isDownloaded.find(
                                (status) => status.zipFile === item.zipFile
                            );

                            return (
                                <tr className="hover align-middle text-base" key={item.zipFile}>
                                    <td>{t(item.name)}</td>
                                    <td className="text-center">
                                        {(item.fileSize / (1024 * 1024)).toFixed(2)} MB
                                    </td>
                                    <td className="text-center">
                                        <a
                                            className="link inline-flex items-center"
                                            onClick={() => window.electron.openExternal(item.link)}
                                        >
                                            {t(
                                                "settingPage.videoDownloadSettings.downloadTable.downloadLink"
                                            )}
                                        </a>
                                        <LuExternalLink className="ms-1 inline-flex items-center" />
                                    </td>
                                    <td>
                                        {fileStatus ? ( // Check if fileStatus is found
                                            fileStatus.isDownloaded ||
                                            fileStatus.hasExtractedFolder ? (
                                                <BsCheckCircleFill className="text-success mx-auto h-6 w-6" />
                                            ) : (
                                                <BsXCircleFill className="text-error mx-auto h-6 w-6" />
                                            )
                                        ) : (
                                            // Handle the case where fileStatus is not found
                                            // This can happen if `isDownloaded` array does not include all items in `data`
                                            <span>Loading...</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <button
                                            type="button"
                                            className="btn btn-accent"
                                            onClick={async () => await handleVerify(item)}
                                            disabled={
                                                !fileStatus ||
                                                (!fileStatus.isDownloaded &&
                                                    !fileStatus.hasExtractedFolder)
                                            } // Disable if fileStatus not found or not downloaded
                                        >
                                            {(() => {
                                                if (!fileStatus)
                                                    return t(
                                                        "settingPage.videoDownloadSettings.downloadTable.extractBtn"
                                                    );
                                                if (fileStatus.hasExtractedFolder)
                                                    return t(
                                                        "settingPage.videoDownloadSettings.downloadTable.verifyBtn"
                                                    );
                                                if (fileStatus.isDownloaded)
                                                    return t(
                                                        "settingPage.videoDownloadSettings.downloadTable.extractBtn"
                                                    );
                                                return t(
                                                    "settingPage.videoDownloadSettings.downloadTable.extractBtn"
                                                );
                                            })()}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <dialog ref={verifyModal} className="modal">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">
                        {t("settingPage.videoDownloadSettings.verifyModalHeading")}
                    </h3>
                    <div className="py-4">
                        {verifyFiles.length > 0 ? (
                            <>
                                <p>{t("settingPage.videoDownloadSettings.verifyTitle")}</p>
                                <ul className="my-2 list-inside list-disc px-4">
                                    {verifyFiles.map((file, idx) => (
                                        <li key={idx}>{t(file.name)}</li>
                                    ))}
                                </ul>
                                <p className="my-4">
                                    {t("settingPage.videoDownloadSettings.verifyFooter")}
                                </p>
                            </>
                        ) : (
                            <p>{t("settingPage.videoDownloadSettings.verifyFailedMessage")}</p>
                        )}
                    </div>
                    <div className="modal-action">
                        <button type="button" className="btn" onClick={handleCloseVerifyModal}>
                            {t("settingPage.exerciseSettings.cancelBtn")}
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={async () => await handleNextModal()}
                            disabled={verifyFiles.length === 0}
                        >
                            {t("settingPage.videoDownloadSettings.nextBtn")}
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog ref={progressModal} className="modal">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">
                        {showProgressModal === true
                            ? t("settingPage.videoDownloadSettings.inProgressModalHeading")
                            : isSuccess
                              ? t("settingPage.videoDownloadSettings.verifySuccess")
                              : t("settingPage.videoDownloadSettings.verifyFailed")}
                    </h3>
                    <div className="py-4">
                        {showProgressModal === true && !progressError ? (
                            <>
                                <p>{progressText}</p>
                                {isPercentage ? (
                                    <progress
                                        className="progress progress-primary w-full"
                                        value={progress}
                                        max="100"
                                    >
                                        {progress}%
                                    </progress>
                                ) : (
                                    <progress className="progress progress-primary w-full"></progress>
                                )}
                            </>
                        ) : verificationErrors.length > 0 ? (
                            <>
                                <p>
                                    {verificationErrors.some((err) => err.type === "missing")
                                        ? t("settingPage.videoDownloadSettings.fileMissing")
                                        : t("settingPage.videoDownloadSettings.hashMismatch")}
                                </p>
                                <ul className="my-2 list-inside list-disc px-4">
                                    {verificationErrors.map((err, idx) => (
                                        <li key={idx}>{err.name}</li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <p className="wrap-break-word">{modalMessage}</p>
                        )}
                    </div>
                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={handleCloseProgressModal}
                            disabled={showProgressModal === true && !progressError}
                        >
                            {t("sound_page.closeBtn")}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default VideoDownloadTable;
