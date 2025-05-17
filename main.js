/* global setImmediate */ // for eslint because setImmediate is node global
import cors from "cors";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import applog from "electron-log";
import { Buffer } from "node:buffer";
import fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { createSplashWindow, createWindow } from "./electron-main/createWindow.js";
import { expressApp } from "./electron-main/expressServer.js";
import { getSaveFolder, readUserSettings, getLogFolder } from "./electron-main/filePath.js";
import {
    getCustomSaveFolderIPC,
    getSaveFolderIPC,
    getVideoFileDataIPC,
    getVideoSaveFolderIPC,
} from "./electron-main/getFileAndFolder.js";
import {
    getCurrentLogSettings,
    manageLogFiles,
    setCurrentLogSettings,
} from "./electron-main/logOperations.js";
import { verifyAndExtractIPC } from "./electron-main/zipOperation.js";
import { checkDownloads, checkExtractedFolder } from "./electron-main/videoFileOperations.js";
import { setCustomSaveFolderIPC } from "./electron-main/customFolderLocationOperation.js";

const DEFAULT_PORT = 8998;

let server; // Declare server at the top so it's in scope for all uses

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let electronSquirrelStartup = false;
try {
    electronSquirrelStartup = (await import("electron-squirrel-startup")).default;
} catch (e) {
    console.log("Error importing electron-squirrel-startup:", e);
    applog.error("Error importing electron-squirrel-startup:", e);
}
if (electronSquirrelStartup) app.quit();

// Log operations
manageLogFiles();

let mainWindow;

// Allow requests from localhost:5173 (Vite's default development server)
expressApp.use(cors({ origin: "http://localhost:5173" }));

// Set up rate limiter: maximum of 2000 requests per 15 minutes
/*const limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000,
});*/

// Set up the express server to serve video files
expressApp.get("/video/:folderName/:fileName", async (req, res) => {
    const { folderName, fileName } = req.params;
    const documentsPath = await getSaveFolder(readUserSettings);
    const videoFolder = path.resolve(documentsPath, "video_files", folderName);
    const videoFilePath = path.resolve(videoFolder, fileName);

    if (!videoFilePath.startsWith(videoFolder)) {
        res.status(403).send("Access denied.");
        return;
    }

    try {
        await fsPromises.access(videoFilePath);
        const stat = await fsPromises.stat(videoFilePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            const file = fs.createReadStream(videoFilePath, { start, end });
            const head = {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": "video/mp4",
            };

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                "Content-Length": fileSize,
                "Content-Type": "video/mp4",
            };
            res.writeHead(200, head);
            fs.createReadStream(videoFilePath).pipe(res);
        }
    } catch {
        res.status(404).send("Video file not found.");
        return;
    }
});

// IPC event from the renderer
ipcMain.handle("open-external-link", async (event, url) => {
    await shell.openExternal(url); // Open the external link
});

// Handle saving a recording
ipcMain.handle("save-recording", async (event, key, arrayBuffer) => {
    const saveFolder = await getSaveFolder(readUserSettings);
    const recordingFolder = path.join(saveFolder, "saved_recordings");
    const filePath = path.join(recordingFolder, `${key}.wav`);

    // Ensure the directory exists
    try {
        await fsPromises.access(recordingFolder);
    } catch {
        await fsPromises.mkdir(recordingFolder, { recursive: true });
    }

    try {
        const buffer = Buffer.from(arrayBuffer);
        await fsPromises.writeFile(filePath, buffer);
        console.log("Recording saved to:", filePath);
        applog.log("Recording saved to:", filePath);
        return "Success";
    } catch (error) {
        console.error("Error saving the recording to disk:", error);
        throw error;
    }
});

// Handle checking if a recording exists
ipcMain.handle("check-recording-exists", async (event, key) => {
    const saveFolder = await getSaveFolder(readUserSettings);
    const filePath = path.join(saveFolder, "saved_recordings", `${key}.wav`);

    try {
        await fsPromises.access(filePath);
        return true;
    } catch {
        return false;
    }
});

// Handle playing a recording (this can be improved for streaming)
ipcMain.handle("play-recording", async (event, key) => {
    const filePath = path.join(
        await getSaveFolder(readUserSettings),
        "saved_recordings",
        `${key}.wav`
    );

    // Check if the file exists
    try {
        const data = await fsPromises.readFile(filePath);
        return data.buffer; // Return the ArrayBuffer to the renderer process
    } catch {
        console.error("File not found:", filePath);
        throw new Error("Recording file not found");
    }
});

/* Video file operations */

// Get video file data
getVideoFileDataIPC(__dirname);

// IPC event to get and open the video folder
getVideoSaveFolderIPC();

// Check video file downloads
checkDownloads();

// Check video file extracted folder
checkExtractedFolder();

/* End video file operations */

// IPC event to get the current server port
ipcMain.handle("get-port", () => {
    return server?.address()?.port || DEFAULT_PORT;
});

ipcMain.handle("open-log-folder", async () => {
    // Open the folder in the file manager
    const logFolder = await getLogFolder(readUserSettings);
    await shell.openPath(logFolder); // Open the folder
    return logFolder; // Send the path back to the renderer
});

// IPC event to verify and extract a zip file
verifyAndExtractIPC();

// Listen for logging messages from the renderer process
ipcMain.on("renderer-log", (event, logMessage) => {
    const { level, message } = logMessage;
    if (applog[level]) {
        applog[level](`Renderer log: ${message}`);
    }
});

// Handle uncaught exceptions globally and quit the app
process.on("uncaughtException", (error) => {
    console.error("An uncaught error occurred:", error);
    applog.error("An uncaught error occurred:", error);
    app.quit(); // Quit the app on an uncaught exception
});

// Handle unhandled promise rejections globally and quit the app
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled promise rejection at:", promise, "reason:", reason);
    applog.error("Unhandled promise rejection at:", promise, "reason:", reason);
    app.quit(); // Quit the app on an unhandled promise rejection
});

app.on("renderer-process-crashed", (event, webContents, killed) => {
    applog.error("Renderer process crashed", { event, killed });
    app.quit();
});

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Recreate the window on macOS when the dock icon is clicked.
app.on("activate", () => {
    if (mainWindow === null) {
        createWindow(__dirname, (srv) => {
            server = srv;
        });
    }
});

app.whenReady()
    .then(() => {
        // 1. Show splash window immediately
        createSplashWindow(__dirname);

        // 2. Start heavy work in parallel after splash is shown
        setImmediate(() => {
            // Create main window (can be shown after splash)
            createWindow(__dirname, (srv) => {
                server = srv;
            });

            // Wait for log settings and manage logs in background
            ipcMain.once("update-log-settings", (event, settings) => {
                setCurrentLogSettings(settings);
                applog.info("Log settings received from renderer:", settings);
                manageLogFiles().then(() => {
                    applog.info("Log files managed successfully.");
                });
            });
        });
    })
    .catch((error) => {
        // Catch any errors thrown in the app.whenReady() promise itself
        applog.error("Error in app.whenReady():", error);
    });

/* Custom save folder operations */

// IPC: Get current save folder (resolved)
getSaveFolderIPC();

// IPC: Get current custom save folder (raw, may be undefined)
getCustomSaveFolderIPC();

// IPC: Set custom save folder
setCustomSaveFolderIPC();

/* End custom save folder operations */

// IPC: Show open dialog for folder selection
ipcMain.handle("show-open-dialog", async (event, options) => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win, options);
    return result.filePaths;
});

ipcMain.handle("get-log-settings", async () => {
    return getCurrentLogSettings();
});

// DEBUG: Trace undefined logs
const origConsoleLog = console.log;
console.log = function (...args) {
    if (args.length === 1 && args[0] === undefined) {
        origConsoleLog.call(console, "console.log(undefined) called! Stack trace:");
        origConsoleLog.call(console, new Error().stack);
    }
    origConsoleLog.apply(console, args);
};
