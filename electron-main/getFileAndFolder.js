import { ipcMain, shell } from "electron";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { getSaveFolder, readUserSettings } from "./filePath.js";

const getVideoFileDataIPC = (rootDir) => {
    ipcMain.handle("get-video-file-data", async () => {
        const jsonPath = path.join(rootDir, "dist", "json", "videoFilesInfo.json");
        try {
            const jsonData = await fsPromises.readFile(jsonPath, "utf-8"); // Asynchronously read the JSON file
            return JSON.parse(jsonData); // Parse the JSON string and return it
        } catch (error) {
            console.error("Error reading JSON file:", error);
            throw error; // Ensure that any error is propagated back to the renderer process
        }
    });
};

const getVideoSaveFolderIPC = () => {
    ipcMain.handle("get-video-save-folder", async () => {
        const saveFolder = await getSaveFolder(readUserSettings);
        const videoFolder = path.join(saveFolder, "video_files");

        // Ensure the directory exists
        try {
            await fsPromises.access(videoFolder);
        } catch {
            await fsPromises.mkdir(videoFolder, { recursive: true });
        }

        // Open the folder in the file manager
        shell.openPath(videoFolder); // Open the folder

        return videoFolder; // Send the path back to the renderer
    });
};

// IPC: Get current save folder (resolved)
const getSaveFolderIPC = () => {
    ipcMain.handle("get-save-folder", async () => {
        return await getSaveFolder(readUserSettings);
    });
};

// IPC: Get current custom save folder (raw, may be undefined)
const getCustomSaveFolderIPC = () => {
    ipcMain.handle("get-custom-save-folder", async () => {
        const userSettings = await readUserSettings();
        return userSettings.customSaveFolder || null;
    });
};

export { getCustomSaveFolderIPC, getSaveFolderIPC, getVideoFileDataIPC, getVideoSaveFolderIPC };
