import { ipcMain, shell } from "electron";
import fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import path from "node:path";
import { getSaveFolder, readUserSettings } from "./filePath.js";

const getVideoFileDataIPC = (rootDir: string) => {
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
        const saveFolder = await getSaveFolder();
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
        return await getSaveFolder();
    });
};

// IPC: Get current custom save folder (raw, may be undefined)
const getCustomSaveFolderIPC = () => {
    ipcMain.handle("get-custom-save-folder", async () => {
        const userSettings = await readUserSettings();
        return userSettings.customSaveFolder || null;
    });
};

// IPC: Get ffmpeg wasm absolute path
const getFfmpegWasmPathIPC = (rootDir: string) => {
    ipcMain.handle("get-ffmpeg-wasm-path", async () => {
        // Adjust the path as needed if you move the file elsewhere
        return path.resolve(rootDir, "data", "ffmpeg");
    });
};

// IPC: Read file as buffer for ffmpeg
ipcMain.handle("read-file-buffer", async (event, filePath) => {
    return fs.readFileSync(filePath); // returns Buffer, serialized as Uint8Array
});

export {
    getCustomSaveFolderIPC,
    getFfmpegWasmPathIPC,
    getSaveFolderIPC,
    getVideoFileDataIPC,
    getVideoSaveFolderIPC,
};
