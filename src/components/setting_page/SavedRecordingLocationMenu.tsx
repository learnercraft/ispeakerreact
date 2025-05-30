import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuExternalLink } from "react-icons/lu";

const SavedRecordingLocationMenu = () => {
    const { t } = useTranslation();
    const [, setFolderPath] = useState("");

    const handleOpenRecordingFolder = async () => {
        // Send an IPC message to open the folder and get the folder path
        const recordingFolder = await window.electron.ipcRenderer.invoke("open-recording-folder");
        setFolderPath(recordingFolder as string); // Save the folder path in state
    };

    return (
        <div className="mt-4">
            <div className="flex gap-x-8 gap-y-6">
                <div className="flex basis-1/2 items-center space-y-1">
                    <p className="font-semibold">
                        {t(
                            "settingPage.savedRecordingLocationSettings.savedRecordingLocationHeading"
                        )}
                    </p>
                </div>
                <div className="flex basis-1/2 justify-end">
                    <button type="button" className="btn" onClick={handleOpenRecordingFolder}>
                        {t("settingPage.savedRecordingLocationSettings.savedRecordingLocationBtn")}
                        <LuExternalLink className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SavedRecordingLocationMenu;
