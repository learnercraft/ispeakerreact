import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuExternalLink } from "react-icons/lu";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast";

const LogSettings = () => {
    const { t } = useTranslation();
    const [, setFolderPath] = useState(null);

    const maxLogOptions = useMemo(
        () => [
            {
                value: "5",
                label: `5 ${t("settingPage.logSettings.numOfLogsNumLog")}`,
                numOfLogs: 5,
            },
            {
                value: "10",
                label: `10 ${t("settingPage.logSettings.numOfLogsNumLog")}`,
                numOfLogs: 10,
            },
            {
                value: "25",
                label: `25 ${t("settingPage.logSettings.numOfLogsNumLog")}`,
                numOfLogs: 25,
            },
            {
                value: "unlimited",
                label: t("settingPage.logSettings.numOfLogsUnlimited"),
                numOfLogs: 0,
            },
        ],
        [t]
    );

    const deleteLogsOptions = useMemo(
        () => [
            {
                value: "1",
                label: `1 ${t("settingPage.logSettings.deleteOldLogNumDay")}`,
                keepForDays: 1,
            },
            {
                value: "7",
                label: `7 ${t("settingPage.logSettings.deleteOldLogNumDay")}`,
                keepForDays: 7,
            },
            {
                value: "14",
                label: `14 ${t("settingPage.logSettings.deleteOldLogNumDay")}`,
                keepForDays: 14,
            },
            {
                value: "30",
                label: `30 ${t("settingPage.logSettings.deleteOldLogNumDay")}`,
                keepForDays: 30,
            },
            {
                value: "never",
                label: t("settingPage.logSettings.deleteOldLogNever"),
                keepForDays: 0,
            },
        ],
        [t]
    );

    // Fetch initial settings from Electron main process
    const [maxLogWritten, setMaxLogWritten] = useState("unlimited");
    const [deleteLogsOlderThan, setDeleteLogsOlderThan] = useState("never");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchLogSettings() {
            try {
                const settings = await window.electron.ipcRenderer.invoke("get-log-settings");
                if (!isMounted) return;
                // Find the corresponding options based on stored values
                const initialMaxLog =
                    maxLogOptions.find((option) => option.numOfLogs === settings.numOfLogs)
                        ?.value || "unlimited";
                const initialDeleteLog =
                    deleteLogsOptions.find((option) => option.keepForDays === settings.keepForDays)
                        ?.value || "never";
                setMaxLogWritten(initialMaxLog);
                setDeleteLogsOlderThan(initialDeleteLog);
            } catch {
                // fallback to defaults
                setMaxLogWritten("unlimited");
                setDeleteLogsOlderThan("never");
            } finally {
                setLoading(false);
            }
        }
        fetchLogSettings();
        return () => {
            isMounted = false;
        };
    }, [maxLogOptions, deleteLogsOptions]);

    // Memoize the function so that it doesn't change on every render
    const handleApplySettings = useCallback(
        (maxLogWrittenValue, deleteLogsOlderThanValue) => {
            const selectedMaxLogOption = maxLogOptions.find(
                (option) => option.value === maxLogWrittenValue
            );
            const selectedDeleteLogOption = deleteLogsOptions.find(
                (option) => option.value === deleteLogsOlderThanValue
            );

            const electronSettings = {
                numOfLogs: selectedMaxLogOption.numOfLogs,
                keepForDays: selectedDeleteLogOption.keepForDays,
            };

            // Send the settings to Electron main process
            window.electron.ipcRenderer.send("update-log-settings", electronSettings);
            sonnerSuccessToast(t("settingPage.changeSaved"));
        },
        [maxLogOptions, deleteLogsOptions, t]
    );

    // Helper function to get the label based on the current value
    const getLabel = (options, value) => {
        const selectedOption = options.find((option) => option.value === value);
        return selectedOption ? selectedOption.label : value;
    };

    const handleOpenLogFolder = async () => {
        // Send an IPC message to open the folder and get the folder path
        const logFolder = await window.electron.ipcRenderer.invoke("open-log-folder");
        setFolderPath(logFolder); // Save the folder path in state
    };

    if (loading) {
        return (
            <div>
                <span className="loading loading-spinner loading-md"></span>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-wrap gap-x-8 gap-y-6 md:flex-nowrap">
                <div className="basis-full space-y-1 md:basis-1/2">
                    <p className="text-base font-semibold">
                        {t("settingPage.logSettings.logSettingsHeading")}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {t("settingPage.logSettings.logSettingsDescription")}
                    </p>
                </div>
                <div className="flex grow basis-1/2 justify-center md:justify-end">
                    <div>
                        <p className="mb-2 text-base">
                            {t("settingPage.logSettings.numOfLogsOption")}
                        </p>
                        <div className="dropdown mb-6">
                            <div tabIndex={0} role="button" className="btn btn-wide justify-start">
                                {getLabel(maxLogOptions, maxLogWritten)}
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu dropdown-content rounded-box bg-base-100 z-300 w-52 border-slate-50 p-2 shadow-md"
                            >
                                {maxLogOptions.map((option) => (
                                    <li key={option.value}>
                                        <a
                                            type="button"
                                            className={`justify-start ${maxLogWritten === option.value ? "menu-active" : ""}`}
                                            key={option.value}
                                            onClick={() => {
                                                setMaxLogWritten(option.value);
                                                handleApplySettings(
                                                    option.value,
                                                    deleteLogsOlderThan
                                                );
                                            }}
                                        >
                                            {option.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <p className="mb-2 text-base">
                            {t("settingPage.logSettings.deleteOldLogsOption")}
                        </p>
                        <div className="dropdown mb-6">
                            <div tabIndex={0} role="button" className="btn btn-wide">
                                {getLabel(deleteLogsOptions, deleteLogsOlderThan)}
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu dropdown-content rounded-box bg-base-100 z-300 w-52 border-slate-50 p-2 shadow-md"
                            >
                                {deleteLogsOptions.map((option) => (
                                    <li key={option.value}>
                                        <a
                                            type="button"
                                            className={`justify-start ${deleteLogsOlderThan === option.value ? "menu-active" : ""}`}
                                            onClick={() => {
                                                setDeleteLogsOlderThan(option.value);
                                                handleApplySettings(maxLogWritten, option.value);
                                            }}
                                        >
                                            {option.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            type="button"
                            className="btn btn-wide"
                            onClick={handleOpenLogFolder}
                        >
                            {t("settingPage.logSettings.openLogBtn")}
                            <LuExternalLink className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LogSettings;
