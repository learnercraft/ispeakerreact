import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";

const VideoDownloadTable = ({ data, isDownloaded }) => {
    const { t } = useTranslation();

    const [, setShowVerifyModal] = useState(false);
    const [, setShowProgressModal] = useState(false);
    const [selectedZip, setSelectedZip] = useState(null);
    const [verifyFiles, setVerifyFiles] = useState([]);
    const [progress, setProgress] = useState(0);
    const [modalMessage, setModalMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(null);
    const [progressText, setProgressText] = useState("Initializing...");
    const [isPercentage, setIsPercentage] = useState(false);

    const verifyModal = useRef(null);
    const progressModal = useRef(null);

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

    const handleVerify = (zip) => {
        setSelectedZip(zip);

        const fileToVerify = zip.name ? [{ name: zip.name }] : [];
        setVerifyFiles(fileToVerify);

        setShowVerifyModal(true);

        verifyModal.current?.showModal();
    };

    const handleNextModal = () => {
        setShowVerifyModal(false);
        setShowProgressModal(true);
        setProgressText("Verifying extracted files...");
        window.electron.ipcRenderer.send("verify-and-extract", selectedZip);
        progressModal.current?.showModal();
        verifyModal.current?.close();
    };

    const handleCloseVerifyModal = () => {
        setShowVerifyModal(false);
        setVerifyFiles([]);
        verifyModal.current?.close();
    };

    const handleCloseProgressModal = () => {
        setModalMessage("");
        progressModal.current?.close();
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
                        {data.map((item) => (
                            <tr className="hover align-middle text-base" key={item.zipFile}>
                                <td>{t(item.name)}</td>
                                <td className="text-center">
                                    {(item.fileSize / (1024 * 1024)).toFixed(2)} MB
                                </td>
                                <td className="text-center">
                                    <a
                                        className="link"
                                        onClick={() => window.electron.openExternal(item.link)}
                                    >
                                        {t(
                                            "settingPage.videoDownloadSettings.downloadTable.downloadLink"
                                        )}
                                    </a>
                                </td>
                                <td>
                                    {isDownloaded[item.zipFile] ? (
                                        <BsCheckCircleFill className="mx-auto h-6 w-6 text-success" />
                                    ) : (
                                        <BsXCircleFill className="mx-auto h-6 w-6 text-error" />
                                    )}
                                </td>
                                <td className="text-center">
                                    <button
                                        type="button"
                                        className="btn btn-accent btn-sm"
                                        onClick={() => handleVerify(item)}
                                        disabled={!isDownloaded[item.zipFile]}
                                    >
                                        {t(
                                            "settingPage.videoDownloadSettings.downloadTable.verifyBtn"
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
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
                            <p>
                                Either you haven’t downloaded the file(s) yet, or the filename does
                                not match.
                            </p>
                        )}
                    </div>
                    <div className="modal-action">
                        <button className="btn" onClick={handleCloseVerifyModal}>
                            {t("settingPage.exerciseSettings.cancelBtn")}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleNextModal}
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
                        {isSuccess === null
                            ? t("settingPage.videoDownloadSettings.inProgressModalHeading")
                            : isSuccess
                              ? t("settingPage.videoDownloadSettings.verifySuccess")
                              : t("settingPage.videoDownloadSettings.verifyFailed")}
                    </h3>
                    <div className="py-4">
                        {isSuccess === null ? (
                            <>
                                <p>{progressText}</p>
                                <progress
                                    className="progress progress-primary w-full"
                                    value={isPercentage ? progress : 100}
                                    max="100"
                                >
                                    {isPercentage ? `${progress}%` : null}
                                </progress>
                            </>
                        ) : (
                            <p className="break-all">{modalMessage}</p>
                        )}
                    </div>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={handleCloseProgressModal}
                            disabled={isSuccess === null}
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
