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
        // For custom folder, use a subfolder 'ispeakerreact_data'
        const baseFolder = userSettings.customSaveFolder;
        // Ensure the base directory exists
        try {
            await fsPromises.access(baseFolder);
        } catch {
            await fsPromises.mkdir(baseFolder, { recursive: true });
        }
        saveFolder = path.join(baseFolder, "ispeakerreact_data");
        // Ensure the 'ispeakerreact_data' subfolder exists
        try {
            await fsPromises.access(saveFolder);
        } catch {
            await fsPromises.mkdir(saveFolder, { recursive: true });
        }
    } else {
        // For default, just use Documents/iSpeakerReact
        const documentsPath = app.getPath("documents");
        saveFolder = path.join(documentsPath, "iSpeakerReact");
        // Ensure the directory exists
        try {
            await fsPromises.access(saveFolder);
        } catch {
            await fsPromises.mkdir(saveFolder, { recursive: true });
        }
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

// Helper to get the data subfolder path
const getDataSubfolder = (baseFolder) => {
    return path.join(baseFolder, "ispeakerreact_data");
};

// Synchronous version to get the log folder path
const getLogFolderSync = () => {
    let saveFolder;
    const userSettings = settingsConf.store || {};
    if (userSettings.customSaveFolder) {
        // For custom folder, use the data subfolder
        saveFolder = path.join(userSettings.customSaveFolder, "ispeakerreact_data");
    } else {
        const documentsPath = app.getPath("documents");
        saveFolder = path.join(documentsPath, "iSpeakerReact");
    }
    return path.join(saveFolder, "logs");
};

// Helper to delete the empty ispeakerreact_data subfolder
const deleteEmptyDataSubfolder = async (baseFolder) => {
    const dataFolder = path.join(baseFolder, "ispeakerreact_data");
    try {
        const files = await fsPromises.readdir(dataFolder);
        if (files.length === 0) {
            await fsPromises.rmdir(dataFolder);
            return true;
        }
    } catch {
        // Folder does not exist or other error, ignore
    }
    return false;
};

export {
    getDataSubfolder,
    getLogFolder,
    getLogFolderSync,
    getSaveFolder,
    readUserSettings,
    settingsConf,
    deleteEmptyDataSubfolder,
};
