import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoWarningOutline } from "react-icons/io5";
import { isElectron } from "../../utils/isElectron";
import { sonnerErrorToast, sonnerSuccessToast } from "../../utils/sonnerCustomToast";

const SaveFolderSettings = () => {
    const { t } = useTranslation();
    const [currentFolder, setCurrentFolder] = useState("");
    const [customFolder, setCustomFolder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [moveProgress, setMoveProgress] = useState(null);
    const moveDialogRef = useRef(null);

    useEffect(() => {
        if (!isElectron()) return;
        // Get the resolved save folder
        window.electron.ipcRenderer.invoke("get-save-folder").then(setCurrentFolder);
        // Get the custom folder (if any)
        window.electron.ipcRenderer.invoke("get-custom-save-folder").then(setCustomFolder);
    }, []);

    useEffect(() => {
        if (!isElectron()) return;
        const handler = (_event, data) => {
            setMoveProgress(data);
            setMoveDialogOpen(true);
            if (data.phase === "delete-done") {
                setMoveDialogOpen(false);
                setMoveProgress(null);
                sonnerSuccessToast(t("toast.folderChanged"));
            }
        };
        window.electron.ipcRenderer.on("move-folder-progress", handler);
        return () =>
            window.electron.ipcRenderer.removeAllListeners("move-folder-progress", handler);
    }, [t]);

    const handleChooseFolder = async () => {
        setLoading(true);
        setMoveDialogOpen(false);
        setMoveProgress(null);
        try {
            // Open folder dialog via Electron
            const folderPaths = await window.electron.ipcRenderer.invoke("show-open-dialog", {
                properties: ["openDirectory"],
                title: t("settingPage.saveFolderSettings.saveFolderChooseBtn"),
            });
            if (folderPaths && folderPaths.length > 0) {
                setMoveDialogOpen(true);
                setMoveProgress({ moved: 0, total: 1, phase: "copy", name: "" });
                const selected = folderPaths[0];
                const result = await window.electron.ipcRenderer.invoke(
                    "set-custom-save-folder",
                    selected
                );
                setMoveDialogOpen(false);
                setMoveProgress(null);
                if (result.success) {
                    setCustomFolder(selected);
                    setCurrentFolder(result.newPath || selected);
                } else {
                    let msg = t(`toast.${result.error}`);
                    if (result.reason) {
                        msg += ` ${t(result.reason)}`;
                    }
                    sonnerErrorToast(msg);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetDefault = async () => {
        setLoading(true);
        setMoveDialogOpen(false);
        setMoveProgress(null);
        try {
            setMoveDialogOpen(true);
            setMoveProgress({ moved: 0, total: 1, phase: "copy", name: "" });
            const result = await window.electron.ipcRenderer.invoke("set-custom-save-folder", null);
            setMoveDialogOpen(false);
            setMoveProgress(null);
            setCustomFolder(null);
            setCurrentFolder(result.newPath || "");
        } finally {
            setLoading(false);
        }
    };

    if (!isElectron()) return null;

    return (
        <>
            <div className="flex flex-row flex-wrap gap-x-8 gap-y-6 md:flex-nowrap">
                <div className="space-y-1">
                    <p className="text-base font-semibold">
                        {t("settingPage.saveFolderSettings.saveFolderHeading")}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {t("settingPage.saveFolderSettings.saveFolderDescription")}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {t("settingPage.saveFolderSettings.saveFolderCurrentFolder")}{" "}
                        <span
                            lang="en"
                            className="rounded-md bg-zinc-100 px-2 py-1 font-mono! text-sm font-bold break-all text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                        >
                            {currentFolder}
                        </span>
                    </p>
                </div>
                <div className="flex grow basis-1/2 flex-row justify-center gap-2 md:flex-wrap md:justify-end">
                    <button
                        type="button"
                        className="btn btn-block"
                        onClick={handleChooseFolder}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading loading-spinner loading-md"></span>
                        ) : (
                            t("settingPage.saveFolderSettings.saveFolderChooseBtn")
                        )}
                    </button>
                    {customFolder && (
                        <button
                            type="button"
                            className="btn btn-secondary btn-block"
                            onClick={handleResetDefault}
                            disabled={loading}
                        >
                            {t("settingPage.saveFolderSettings.saveFolderResetBtn")}
                        </button>
                    )}
                </div>
            </div>
            {moveDialogOpen && (
                <dialog open ref={moveDialogRef} className="modal modal-open">
                    <form method="dialog" className="modal-box">
                        <h3 className="text-lg font-bold">
                            {t("settingPage.saveFolderSettings.saveFolderMovingTitle")}
                        </h3>
                        <div className="py-4">
                            {moveProgress ? (
                                <>
                                    {moveProgress.name ? (
                                        <>
                                            <div className="mb-2">
                                                {t(
                                                    `settingPage.saveFolderSettings.${
                                                        moveProgress.phase === "copy"
                                                            ? "saveFolderCopyPhase"
                                                            : moveProgress.phase === "delete"
                                                              ? "saveFolderDeletePhase"
                                                              : "saveFolderMovingPhase"
                                                    }`
                                                )}{" "}
                                                <span lang="en" className="font-mono! break-all">
                                                    {moveProgress.name}
                                                </span>
                                            </div>
                                            <progress
                                                className="progress progress-primary w-full"
                                                value={moveProgress.moved}
                                                max={moveProgress.total}
                                            ></progress>
                                            <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                                {moveProgress.moved} / {moveProgress.total}{" "}
                                                {t(
                                                    "settingPage.saveFolderSettings.saveFolderMovingFiles"
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <span className="loading loading-spinner loading-md"></span>
                                    )}
                                </>
                            ) : (
                                <span className="loading loading-spinner loading-md"></span>
                            )}
                            <div role="alert" className="alert alert-warning mt-6">
                                <IoWarningOutline className="h-6 w-6" />
                                <div>
                                    {t("settingPage.saveFolderSettings.saveFolderMovingWarning")}
                                </div>
                            </div>
                        </div>
                    </form>
                </dialog>
            )}
        </>
    );
};

export default SaveFolderSettings;
