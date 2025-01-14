const applog = require("electron-log");
const { app, Menu, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const net = require("net");
const isDev = process.env.NODE_ENV === "development";
const fs = require("fs");
const JS7z = require("./libraries/js7z/js7z.cjs");
const crypto = require("crypto");

const express = require("express");
const RateLimit = require("express-rate-limit");
const DEFAULT_PORT = 8998;
const MIN_PORT = 1024; // Minimum valid port number
const MAX_PORT = 65535; // Maximum valid port number
const cors = require("cors");

const { version } = require("./package.json");

if (require("electron-squirrel-startup")) app.quit();

// Create Express server
const expressApp = express();

// Function to generate a random port number within the range
function getRandomPort() {
    return Math.floor(Math.random() * (MAX_PORT - MIN_PORT + 1)) + MIN_PORT;
}

// Function to check if a port is available
function checkPortAvailability(port) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();

        server.once("error", (err) => {
            if (err.code === "EADDRINUSE" || err.code === "ECONNREFUSED") {
                resolve(false); // Port is in use
                applog.log("Port is in use. Error:", err.code);
            } else {
                reject(err); // Some other error occurred
                applog.log("Another error related to the Express server. Error:", err.code);
            }
        });

        server.once("listening", () => {
            server.close(() => {
                resolve(true); // Port is available
            });
        });

        server.listen(port);
    });
}

// Function to start the Express server with the default port first, then randomize if necessary
async function startExpressServer() {
    let port = DEFAULT_PORT;
    let isPortAvailable = await checkPortAvailability(port);

    if (!isPortAvailable) {
        applog.warn(`Default port ${DEFAULT_PORT} is in use. Trying a random port...`);
        do {
            port = getRandomPort();
            isPortAvailable = await checkPortAvailability(port);
        } while (!isPortAvailable);
    }

    expressApp.listen(port, () => {
        applog.info(`Express server is running on http://localhost:${port}`);
    });
}

const getSaveFolder = () => {
    const documentsPath = app.getPath("documents");
    const saveFolder = path.join(documentsPath, "iSpeakerReact");

    // Ensure the directory exists
    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
    }

    return saveFolder;
};

const getLogFolder = () => {
    const saveFolder = path.join(getSaveFolder(), "logs");

    // Ensure the directory exists
    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
    }

    return saveFolder;
};

const logDirectory = getLogFolder();

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

ipcMain.handle("get-log-folder", async () => {
    const logFolderPath = path.join(getSaveFolder(), "logs");
    try {
        if (!fs.existsSync(logFolderPath)) {
            fs.mkdirSync(logFolderPath);
        }
        return logFolderPath;
    } catch (error) {
        console.error("Error getting log folder path:", error);
        applog.error("Error getting log folder path:", error);
        return null;
    }
});

// Default values
let currentLogSettings = {
    numOfLogs: 10,
    keepForDays: 0,
    logLevel: "info", // Default log level
    logFormat: "{h}:{i}:{s} {text}", // Default log format
    maxLogSize: 5 * 1024 * 1024, // Default max log size (5 MB)
};

// Configure electron-log to use the log directory
applog.transports.file.fileName = generateLogFileName();
applog.transports.file.resolvePathFn = () => path.join(logDirectory, applog.transports.file.fileName);
applog.transports.file.maxSize = currentLogSettings.maxLogSize;
applog.transports.console.level = currentLogSettings.logLevel;

// Handle updated log settings from the renderer
ipcMain.on("update-log-settings", (event, newSettings) => {
    currentLogSettings = newSettings;
    applog.info("Log settings updated:", currentLogSettings);

    manageLogFiles();
});

// Function to check and manage log files based on the currentLogSettings
async function manageLogFiles() {
    try {
        const { numOfLogs, keepForDays } = currentLogSettings;

        applog.info("Log settings:", currentLogSettings);

        // Get all log files
        const logFiles = fs.readdirSync(logDirectory).map((file) => {
            const filePath = path.join(logDirectory, file);
            const stats = fs.statSync(filePath);
            return {
                path: filePath,
                birthtime: stats.birthtime, // Creation time of the log file
            };
        });

        // Sort log files by creation time (oldest first)
        logFiles.sort((a, b) => a.birthtime - b.birthtime);

        // Remove logs if they exceed the specified limit (excluding 0 for unlimited)
        if (numOfLogs > 0 && logFiles.length > numOfLogs) {
            const filesToDelete = logFiles.slice(0, logFiles.length - numOfLogs);
            filesToDelete.forEach((file) => {
                fs.unlinkSync(file.path);
                applog.info(`Deleted log file: ${file.path}`);
            });
        }

        // Remove logs older than the specified days (excluding 0 for never)
        if (keepForDays > 0) {
            const now = new Date();
            logFiles.forEach((file) => {
                const ageInDays = (now - new Date(file.birthtime)) / (1000 * 60 * 60 * 24);
                if (ageInDays > keepForDays) {
                    fs.unlinkSync(file.path);
                    applog.info(`Deleted old log file: ${file.path}`);
                }
            });
        }
    } catch (error) {
        applog.error("Error managing log files:", error);
    }
}

let mainWindow;
let splashWindow;

// Allow requests from localhost:5173 (Vite's default development server)
expressApp.use(cors({ origin: "http://localhost:5173" }));

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 854,
        height: 413,
        frame: false, // Remove window controls
        transparent: true, // Make the window background transparent
        alwaysOnTop: true,
    });

    // Load the splash screen HTML
    splashWindow.loadFile(path.join(__dirname, "data", "splash.html"));

    splashWindow.setTitle("Starting up...");

    // Splash window should close when the main window is ready
    splashWindow.on("closed", () => {
        splashWindow = null;
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"), // Point to your preload.js file
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            devTools: isDev ? true : false,
        },
    });

    if (isDev) {
        mainWindow.loadURL("http://localhost:5173"); // Point to Vite dev server
    } else {
        mainWindow.loadFile(path.join(__dirname, "./dist/index.html")); // Load the built HTML file
    }

    // Show the main window only when it’s ready
    mainWindow.once("ready-to-show", () => {
        setTimeout(() => {
            splashWindow.close();
            mainWindow.show();
        }, 2000);
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    mainWindow.on("enter-full-screen", () => {
        mainWindow.setMenuBarVisibility(false);
    });

    mainWindow.on("leave-full-screen", () => {
        mainWindow.setMenuBarVisibility(true);
    });

    const menu = Menu.buildFromTemplate([
        {
            label: "File",
            submenu: [{ role: "quit" }],
        },
        {
            label: "Edit",
            submenu: [
                { role: "undo" },
                { role: "redo" },
                { type: "separator" },
                { role: "cut" },
                { role: "copy" },
                { role: "paste" },
            ],
        },
        {
            label: "View",
            submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { type: "separator" },
                { role: "resetZoom" },
                { role: "zoomIn" },
                { role: "zoomOut" },
                { type: "separator" },
                { role: "togglefullscreen" },
                isDev ? { role: "toggleDevTools" } : null,
            ].filter(Boolean),
        },
        {
            label: "Window",
            submenu: [{ role: "minimize" }, { role: "zoom" }],
        },
        {
            label: "About",
            submenu: [
                {
                    label: "Project's GitHub page",
                    click: () => {
                        shell.openExternal("https://github.com/yllst-testing-labs/ispeakerreact");
                    },
                },
            ],
        },
    ]);

    Menu.setApplicationMenu(menu);

    app.on("second-instance", () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });

    applog.info(`App started. Version ${version}`);
}

// Set up rate limiter: maximum of 100 requests per 15 minutes
const limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per windowMs
});

// Set up the express server to serve video files
expressApp.get("/video/:folderName/:fileName", limiter, (req, res) => {
    const { folderName, fileName } = req.params;
    const documentsPath = getSaveFolder();
    const videoFolder = path.resolve(documentsPath, "video_files", folderName);
    const videoFilePath = path.resolve(videoFolder, fileName);

    if (!videoFilePath.startsWith(videoFolder)) {
        res.status(403).send("Access denied.");
        return;
    }

    if (fs.existsSync(videoFilePath)) {
        const stat = fs.statSync(videoFilePath);
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
    } else {
        res.status(404).send("Video file not found.");
    }
});

// Handle the IPC event from the renderer
ipcMain.handle("open-external-link", async (event, url) => {
    await shell.openExternal(url); // Open the external link
});

// Handle saving a recording
ipcMain.handle("save-recording", (event, key, arrayBuffer) => {
    const saveFolder = getSaveFolder();
    const recordingFolder = path.join(saveFolder, "saved_recordings");
    const filePath = path.join(recordingFolder, `${key}.wav`);

    // Ensure the directory exists
    if (!fs.existsSync(recordingFolder)) {
        fs.mkdirSync(recordingFolder, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        try {
            // Convert ArrayBuffer to Node.js Buffer
            const buffer = Buffer.from(arrayBuffer);

            // Save the buffer to the file system
            fs.writeFile(filePath, buffer, (err) => {
                if (err) {
                    console.error("Error saving the recording to disk:", err);
                    reject(err);
                } else {
                    console.log("Recording saved to:", filePath);
                    applog.log("Recording saved to:", filePath);
                    resolve("Success");
                }
            });
        } catch (error) {
            console.error("Error processing the array buffer:", error);
            reject(error);
        }
    });
});

// Handle checking if a recording exists
ipcMain.handle("check-recording-exists", (event, key) => {
    const saveFolder = getSaveFolder();
    const filePath = path.join(saveFolder, "saved_recordings", `${key}.wav`);

    return fs.existsSync(filePath);
});

// Handle playing a recording (this can be improved for streaming)
ipcMain.handle("play-recording", async (event, key) => {
    const filePath = path.join(getSaveFolder(), "saved_recordings", `${key}.wav`);

    // Check if the file exists
    try {
        const data = await fs.promises.readFile(filePath);
        return data.buffer; // Return the ArrayBuffer to the renderer process
    } catch (error) {
        console.error("File not found:", filePath);
        throw new Error("Recording file not found");
    }
});

ipcMain.handle("check-downloads", () => {
    const saveFolder = getSaveFolder();
    const videoFolder = path.join(saveFolder, "video_files");
    const files = fs.readdirSync(videoFolder);
    // Return the list of zip files in the download folder
    return files.filter((file) => file.endsWith(".7z"));
});

ipcMain.handle("get-video-file-data", async () => {
    const jsonPath = path.join(__dirname, "data", "videoFilesInfo.json"); // Adjust to your actual file path
    try {
        const jsonData = fs.readFileSync(jsonPath, "utf-8"); // Synchronously read the JSON file
        return JSON.parse(jsonData); // Parse the JSON string and return it
    } catch (error) {
        console.error("Error reading JSON file:", error);
        throw error; // Ensure that any error is propagated back to the renderer process
    }
});

// Handle the IPC event to get and open the folder
ipcMain.handle("get-video-save-folder", (event) => {
    const saveFolder = getSaveFolder();
    const videoFolder = path.join(saveFolder, "video_files");

    // Ensure the directory exists
    if (!fs.existsSync(videoFolder)) {
        fs.mkdirSync(videoFolder, { recursive: true });
    }

    // Open the folder in the file manager
    shell.openPath(videoFolder); // Open the folder

    return videoFolder; // Send the path back to the renderer
});

ipcMain.handle("open-log-folder", (event) => {
    // Open the folder in the file manager
    shell.openPath(logDirectory); // Open the folder

    return logDirectory; // Send the path back to the renderer
});

// Function to calculate the SHA-256 hash of a file
const calculateFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("data", (data) => hash.update(data));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", (err) => reject(err));
    });
};

// Check video extracted folder
ipcMain.handle("check-extracted-folder", (event, folderName, zipContents) => {
    const saveFolder = getSaveFolder();
    const extractedFolder = path.join(saveFolder, "video_files", folderName);

    // Check if extracted folder exists
    if (fs.existsSync(extractedFolder)) {
        const extractedFiles = fs.readdirSync(extractedFolder);

        // Check if all expected files are present in the extracted folder
        const allFilesExtracted = zipContents[0].extractedFiles.every((file) => {
            return extractedFiles.includes(file.name);
        });

        return allFilesExtracted; // Return true if all files are extracted, else false
    }

    return false; // Return false if the folder doesn't exist
});

async function fileVerification(event, zipContents, extractedFolder) {
    // Verify existing extracted files
    const totalFiles = zipContents[0].extractedFiles.length;
    let filesProcessed = 0;
    let missingOrCorruptedFiles = false;

    for (const file of zipContents[0].extractedFiles) {
        const extractedFilePath = path.join(extractedFolder, file.name);
        if (!fs.existsSync(extractedFilePath)) {
            console.log(`File missing: ${file.name}`);
            applog.log(`File missing: ${file.name}`);
            event.sender.send(
                "verification-error",
                `File missing: ${file.name}. Make sure you do not rename or accidentally delete it.`
            );
            missingOrCorruptedFiles = true;
            break; // Stop further verification
        }

        const extractedFileHash = await calculateFileHash(extractedFilePath);
        if (extractedFileHash !== file.hash) {
            console.log(`Hash mismatch for file: ${file.name}`);
            applog.log(`Hash mismatch for file: ${file.name}`);
            event.sender.send(
                "verification-error",
                `Hash mismatch for file: ${file.name}. It seems like the file was either corrupted or tampered.`
            );
            missingOrCorruptedFiles = true;
            break; // Stop further verification
        }

        filesProcessed++;
        const progressPercentage = Math.floor((filesProcessed / totalFiles) * 100);
        event.sender.send("progress-update", progressPercentage); // Send progress update
        applog.log("Verifying extracted file:", file.name);
    }

    if (!missingOrCorruptedFiles) {
        // If no missing or corrupted files, finish the verification
        event.sender.send("verification-success", `All extracted files are verified for ${extractedFolder}`);
        applog.log(`All extracted files are verified for ${extractedFolder}`);
        return;
    }
}

// Handle verify and extract process using JS7z
ipcMain.on("verify-and-extract", async (event, zipFileData) => {
    const { zipFile, zipHash, zipContents } = zipFileData;
    const saveFolder = getSaveFolder();
    const videoFolder = path.join(saveFolder, "video_files");
    const zipFilePath = path.join(videoFolder, zipFile);
    const extractedFolder = path.join(videoFolder, zipFile.replace(".7z", ""));

    // Step 0: Check if extracted folder already exists
    if (fs.existsSync(extractedFolder)) {
        console.log(`Extracted folder already exists: ${extractedFolder}`);
        applog.log(`Extracted folder already exists: ${extractedFolder}`);
        event.sender.send("progress-text", "Verifying existing extracted files...");
        await fileVerification(event, zipContents, extractedFolder);
    }

    // If there are missing or corrupted files, proceed with verifying the ZIP file
    if (fs.existsSync(zipFilePath)) {
        console.log(`Starting verification for ${zipFile}`);
        applog.log(`Starting verification for ${zipFile}`);

        try {
            const js7z = await JS7z({
                print: (text) => {
                    console.log(`7-Zip output: ${text}`);
                    applog.log(`7-Zip output: ${text}`);
                    if (text.includes("%")) {
                        const match = text.match(/\s+(\d+)%/); // Extract percentage from output
                        if (match) {
                            const percentage = parseInt(match[1], 10);
                            event.sender.send("progress-update", percentage);
                        }
                    }
                },
                printErr: (errText) => {
                    console.error(`7-Zip error: ${errText}`);
                    applog.error(`7-Zip error: ${errText}`);
                    event.sender.send("verification-error", `7-Zip error: ${errText}`);
                },
                onAbort: (reason) => {
                    console.error(`7-Zip aborted: ${reason}`);
                    applog.error(`7-Zip aborted: ${reason}`);
                    event.sender.send("verification-error", `7-Zip aborted: ${reason}`);
                },
                onExit: (exitCode) => {
                    if (exitCode === 0) {
                        console.log(`7-Zip exited successfully with code ${exitCode}`);
                        applog.log(`7-Zip exited successfully with code ${exitCode}`);
                    } else {
                        console.error(`7-Zip exited with error code: ${exitCode}`);
                        applog.error(`7-Zip exited with error code: ${exitCode}`);
                        event.sender.send("verification-error", `7-Zip exited with error code: ${exitCode}`);
                    }
                },
            });

            // Mount the local file system to the JS7z instance using NODEFS
            js7z.FS.mkdir("/mnt");
            js7z.FS.mount(js7z.NODEFS, { root: videoFolder }, "/mnt");

            const emZipFilePath = `/mnt/${zipFile}`;
            const emExtractedFolder = `/mnt/${zipFile.replace(".7z", "")}`;

            // Step 1: Verifying ZIP file hash
            event.sender.send("progress-text", "Verifying ZIP file");
            const fileHash = await calculateFileHash(zipFilePath);
            if (fileHash !== zipHash) {
                applog.error(
                    `Hash mismatch for ${zipFile}. It seems like the zip file was either corrupted or tampered.`
                );
                event.sender.send(
                    "verification-error",
                    `Hash mismatch for ${zipFile}. It seems like the zip file was either corrupted or tampered.`
                );
                return;
            }
            event.sender.send("progress-text", "ZIP file verified");

            // Step 2: Extracting ZIP file
            event.sender.send("progress-text", "Extracting ZIP file");
            js7z.callMain(["x", emZipFilePath, `-o${emExtractedFolder}`]);

            js7z.onExit = async (exitCode) => {
                if (exitCode !== 0) {
                    applog.error(`Error extracting ${zipFile}`);
                    event.sender.send("verification-error", `Error extracting ${zipFile}`);
                    return;
                }

                console.log(`Extraction successful for ${zipFile}`);
                applog.log(`Extraction successful for ${zipFile}`);

                // Step 3: Verifying extracted files
                event.sender.send("progress-text", "Verifying extracted files...");
                await fileVerification(event, zipContents, extractedFolder);

                // Clean up the ZIP file after successful extraction and verification
                try {
                    fs.unlinkSync(zipFilePath);
                    console.log(`Deleted ZIP file: ${zipFilePath}`);
                    applog.log(`Extraction successful for ${zipFile}`);
                } catch (err) {
                    console.error(`Failed to delete ZIP file: ${err.message}`);
                    applog.error(`Failed to delete ZIP file: ${err.message}`);
                }

                event.sender.send("verification-success", `Successfully verified and extracted ${zipFile}`);
                applog.log(`Successfully verified and extracted ${zipFile}`);
            };
        } catch (err) {
            console.error(`Error processing ${zipFile}: ${err.message}`);
            event.sender.send("verification-error", `Error processing ${zipFile}: ${err.message}`);
        }
    } else {
        //event.sender.send("verification-error", `ZIP file does not exist: ${zipFilePath}`);
    }
});

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
        createWindow();
    }
});

app.whenReady()
    .then(async () => {
        try {
            // Create splash window and main window
            createSplashWindow();
            createWindow();
            // Start the Express server
            await startExpressServer();

            // Wait for log settings from renderer
            await new Promise((resolve) => {
                ipcMain.once("update-log-settings", (event, settings) => {
                    currentLogSettings = settings;
                    applog.info("Log settings received from renderer:", settings);
                    resolve();
                });
            });

            // Call manageLogFiles after receiving settings
            await manageLogFiles();
            applog.info("Log files managed successfully.");
        } catch (error) {
            // Catch and log any errors during the app initialization process
            applog.error("Error during app initialization:", error);
        }
    })
    .catch((error) => {
        // Catch any errors thrown in the app.whenReady() promise itself
        applog.error("Error in app.whenReady():", error);
    });
