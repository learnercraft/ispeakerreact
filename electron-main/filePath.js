import { app } from "electron";
import * as fsPromises from "node:fs/promises";
import path from "node:path";

// Helper to get the path for storing user settings (cross-platform, persistent)
const getUserSettingsPath = () => {
    return path.join(app.getPath("userData"), "ispeakerreact_user_settings.json");
};

// Read user settings JSON (returns {} if not found or error)
const readUserSettings = async () => {
    const settingsPath = getUserSettingsPath();
    try {
        const data = await fsPromises.readFile(settingsPath, "utf-8");
        return JSON.parse(data);
    } catch {
        return {};
    }
};

const getSaveFolder = async (readUserSettings) => {
    // Try to get custom folder from user settings
    const userSettings = await readUserSettings();
    let saveFolder;
    if (userSettings.customSaveFolder) {
        saveFolder = userSettings.customSaveFolder;
    } else {
        const documentsPath = app.getPath("documents");
        saveFolder = path.join(documentsPath, "iSpeakerReact");
    }
    // Ensure the directory exists
    try {
        await fsPromises.access(saveFolder);
    } catch {
        await fsPromises.mkdir(saveFolder, { recursive: true });
    }
    return saveFolder;
};

const getLogFolder = async (readUserSettings) => {
    const saveFolder = path.join(await getSaveFolder(readUserSettings), "logs");
    // Ensure the directory exists
    try {
        await fsPromises.access(saveFolder);
    } catch {
        await fsPromises.mkdir(saveFolder, { recursive: true });
    }
    return saveFolder;
};

export { getLogFolder, getSaveFolder, getUserSettingsPath, readUserSettings };
