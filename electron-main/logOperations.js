import { ipcMain } from "electron";
import applog from "electron-log";
import * as fsPromises from "node:fs/promises";
import path from "node:path";
import { getLogFolder, getLogFolderSync, readUserSettings, settingsConf } from "./filePath.js";

const defaultLogSettings = {
    numOfLogs: 10,
    keepForDays: 0,
    logLevel: "info",
    logFormat: "{h}:{i}:{s} {text}",
    maxLogSize: 5 * 1024 * 1024,
};

let currentLogSettings = { ...defaultLogSettings };

const userLogSettings = settingsConf.get("logSettings");
if (userLogSettings) {
    currentLogSettings = { ...currentLogSettings, ...userLogSettings };
}

const getCurrentLogSettings = () => {
    return currentLogSettings;
};

const setCurrentLogSettings = (newSettings) => {
    currentLogSettings = { ...currentLogSettings, ...newSettings };
};

// Function to generate the log file name with date-time appended
const generateLogFileName = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `ispeakerreact-log_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.log`;
};

// Configure electron-log to use the log directory
applog.transports.file.fileName = generateLogFileName();
applog.transports.file.resolvePathFn = () => {
    const logFolder = getLogFolderSync();
    return path.join(logFolder, applog.transports.file.fileName);
};
applog.transports.file.maxSize = currentLogSettings.maxLogSize;
applog.transports.console.level = currentLogSettings.logLevel;

// Handle updated log settings from the renderer
ipcMain.on("update-log-settings", async (event, newSettings) => {
    setCurrentLogSettings(newSettings);
    applog.info("Log settings updated:", currentLogSettings);

    // Save to user settings file
    settingsConf.set("logSettings", currentLogSettings);

    manageLogFiles();
});

// Function to check and manage log files based on the currentLogSettings
const manageLogFiles = async () => {
    try {
        const { numOfLogs, keepForDays } = currentLogSettings;

        applog.info("Log settings:", currentLogSettings);

        // Get the current log folder dynamically
        const logFolder = await getLogFolder(readUserSettings);

        // Get all log files
        const logFiles = await fsPromises.readdir(logFolder);
        const logFilesResolved = [];
        for (const file of logFiles) {
            const filePath = path.join(logFolder, file);
            try {
                const stats = await fsPromises.stat(filePath);
                logFilesResolved.push({
                    path: filePath,
                    birthtime: stats.birthtime,
                });
            } catch (err) {
                if (err.code !== "ENOENT") {
                    applog.error(`Error stating log file: ${filePath}`, err);
                }
                // If ENOENT, just skip this file
            }
        }

        // Sort log files by creation time (oldest first)
        logFilesResolved.sort((a, b) => a.birthtime - b.birthtime);

        // Remove logs if they exceed the specified limit (excluding 0 for unlimited)
        if (numOfLogs > 0 && logFilesResolved.length > numOfLogs) {
            const filesToDelete = logFilesResolved.slice(0, logFilesResolved.length - numOfLogs);
            for (const file of filesToDelete) {
                try {
                    await fsPromises.unlink(file.path);
                    applog.info(`Deleted log file: ${file.path}`);
                } catch (err) {
                    if (err.code !== "ENOENT") {
                        applog.error(`Error deleting log file: ${file.path}`, err);
                    }
                }
            }
        }

        // Remove logs older than the specified days (excluding 0 for never)
        if (keepForDays > 0) {
            const now = new Date();
            for (const file of logFilesResolved) {
                const ageInDays = (now - new Date(file.birthtime)) / (1000 * 60 * 60 * 24);
                if (ageInDays > keepForDays) {
                    try {
                        await fsPromises.unlink(file.path);
                        applog.info(`Deleted old log file: ${file.path}`);
                    } catch (err) {
                        if (err.code !== "ENOENT") {
                            applog.error(`Error deleting old log file: ${file.path}`, err);
                        }
                    }
                }
            }
        }
    } catch (error) {
        applog.error("Error managing log files:", error);
    }
};

export { generateLogFileName, getCurrentLogSettings, manageLogFiles, setCurrentLogSettings };
