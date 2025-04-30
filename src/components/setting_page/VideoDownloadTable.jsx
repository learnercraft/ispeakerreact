import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { Trans } from "react-i18next";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";

const VideoDownloadTable = ({ t, data, isDownloaded }) => {
    const [, setShowVerifyModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [selectedZip, setSelectedZip] = useState(null);
    const [verifyFiles, setVerifyFiles] = useState([]);
    const [progress, setProgress] = useState(0);
    const [modalMessage, setModalMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(null);
    const [progressText, setProgressText] = useState("");
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
            setProgressText(t(text)); // Update progress text
            setIsPercentage(false); // Not percentage-based, show full progress bar
        };

        const handleVerificationSuccess = (event, data) => {
            setModalMessage(
                <>
                    {t(data.messageKey)}{" "}
                    <code lang="en" className="font-mono break-all italic">
                        {data.param}
                    </code>
                </>
            );
            setIsSuccess(true);
            setShowProgressModal(false); // Hide modal after success
        };

        const handleVerificationError = (event, data) => {
            setModalMessage(
                <Trans i18nKey={data.messageKey} values={{ param: data.param }}>
                    <code className="font-mono break-all italic" lang="en">
                        {data.param}
                    </code>
                    <span>{data.errorMessage ? `Error message: ${data.errorMessage}` : ""}</span>
                </Trans>
            );
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
    }, [t, data.messageKey, data.param]);

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
        setProgressText(t("settingPage.videoDownloadSettings.verifyinProgressMsg"));
        window.electron.ipcRenderer.send("verify-and-extract", selectedZip);
        progressModal.current?.showModal();
        verifyModal.current?.close();
    };

    const handleCloseVerifyModal = () => {
        setShowVerifyModal(false);
        //setVerifyFiles([]);
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
                                            className="link"
                                            onClick={() => window.electron.openExternal(item.link)}
                                        >
                                            {t(
                                                "settingPage.videoDownloadSettings.downloadTable.downloadLink"
                                            )}
                                        </a>
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
                                            className="btn btn-accent btn-sm"
                                            onClick={() => handleVerify(item)}
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
                        {showProgressModal === true
                            ? t("settingPage.videoDownloadSettings.inProgressModalHeading")
                            : isSuccess
                              ? t("settingPage.videoDownloadSettings.verifySuccess")
                              : t("settingPage.videoDownloadSettings.verifyFailed")}
                    </h3>
                    <div className="py-4">
                        {showProgressModal === true ? (
                            <>
                                <p>{progressText}</p>
                                <progress
                                    className="progress progress-primary w-full"
                                    value={isPercentage ? progress : 0}
                                    max="100"
                                >
                                    {isPercentage ? `${progress}%` : null}
                                </progress>
                            </>
                        ) : (
                            <p>{modalMessage}</p>
                        )}
                    </div>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={handleCloseProgressModal}
                            disabled={showProgressModal === true}
                        >
                            {t("sound_page.closeBtn")}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
};

VideoDownloadTable.propTypes = {
    t: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    isDownloaded: PropTypes.array.isRequired,
};

export default VideoDownloadTable;
