import { app } from "electron";
import { Conf } from "electron-conf/main";
import * as fsPromises from "node:fs/promises";
import path from "node:path";

// Singleton instance for settings
const settingsConf = new Conf({ name: "ispeakerreact_config" });

const readUserSettings = async () => {
    return settingsConf.store || {};
};

const getSaveFolder = async () => {
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

const getLogFolder = async () => {
    const saveFolder = path.join(await getSaveFolder(), "logs");
    // Ensure the directory exists
    try {
        await fsPromises.access(saveFolder);
    } catch {
        await fsPromises.mkdir(saveFolder, { recursive: true });
    }
    return saveFolder;
};

export { getLogFolder, getSaveFolder, readUserSettings, settingsConf };
