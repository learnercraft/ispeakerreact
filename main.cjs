const { app, Menu, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";
const fs = require("fs");
const JS7z = require("./libraries/js7z/js7z.cjs");
const crypto = require("crypto");

const express = require("express");
const cors = require("cors");

// Create Express server
const expressApp = express();

let mainWindow;

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
                { role: "toggleDevTools" },
            ],
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
                        shell.openExternal("https://github.com/yell0wsuit/ispeaker");
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
}

// Set up the express server to serve video files
expressApp.get("/video/:folderName/:fileName", (req, res) => {
    const { folderName, fileName } = req.params;
    const documentsPath = app.getPath("documents");
    const videoFolder = path.join(documentsPath, "iSpeakerReact", "video_files", folderName);
    const videoFilePath = path.join(videoFolder, fileName);

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

const getSaveFolder = () => {
    const documentsPath = app.getPath("documents");
    const saveFolder = path.join(documentsPath, "iSpeakerReact");

    // Ensure the directory exists
    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
    }

    return saveFolder;
};

// Handle saving a recording
ipcMain.handle("save-recording", (event, key, arrayBuffer) => {
    const saveFolder = getSaveFolder();
    const filePath = path.join(saveFolder, "saved_recordings", `${key}.wav`);

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
        event.sender.send("progress-text", "Verifying existing extracted files...");

        // Verify existing extracted files
        const totalFiles = zipContents[0].extractedFiles.length;
        let filesProcessed = 0;
        let missingOrCorruptedFiles = false;

        for (const file of zipContents[0].extractedFiles) {
            const extractedFilePath = path.join(extractedFolder, file.name);
            if (!fs.existsSync(extractedFilePath)) {
                console.log(`File missing: ${file.name}`);
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
        }

        if (!missingOrCorruptedFiles) {
            // If no missing or corrupted files, finish the verification
            event.sender.send("verification-success", `All extracted files are verified for ${extractedFolder}`);
            return;
        }
    }

    // If there are missing or corrupted files, proceed with verifying the ZIP file
    if (fs.existsSync(zipFilePath)) {
        console.log(`Starting verification for ${zipFile}`);

        try {
            const js7z = await JS7z({
                print: (text) => {
                    console.log(`7-Zip output: ${text}`);
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
                    event.sender.send("verification-error", `7-Zip error: ${errText}`);
                },
                onAbort: (reason) => {
                    console.error(`7-Zip aborted: ${reason}`);
                    event.sender.send("verification-error", `7-Zip aborted: ${reason}`);
                },
                onExit: (exitCode) => {
                    if (exitCode === 0) {
                        console.log(`7-Zip exited successfully with code ${exitCode}`);
                    } else {
                        console.error(`7-Zip exited with error code: ${exitCode}`);
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
                    event.sender.send("verification-error", `Error extracting ${zipFile}`);
                    return;
                }

                console.log(`Extraction successful for ${zipFile}`);

                // Step 3: Verifying extracted files
                event.sender.send("progress-text", "Verifying extracted files...");
                const totalFiles = zipContents[0].extractedFiles.length;
                let filesProcessed = 0;

                for (const file of zipContents[0].extractedFiles) {
                    const extractedFilePath = path.join(extractedFolder, file.name);
                    if (!fs.existsSync(extractedFilePath)) {
                        event.sender.send("verification-error", `File missing: ${file.name}`);
                        return;
                    }

                    const extractedFileHash = await calculateFileHash(extractedFilePath);
                    if (extractedFileHash !== file.hash) {
                        event.sender.send(
                            "verification-error",
                            `Hash mismatch for file: ${file.name}. It seems like the file was either corrupted or tampered.`
                        );
                        return;
                    }

                    filesProcessed++;
                    const progressPercentage = Math.floor((filesProcessed / totalFiles) * 100);
                    event.sender.send("progress-update", progressPercentage); // Send progress based on processed files
                }

                // Clean up the ZIP file after successful extraction and verification
                try {
                    fs.unlinkSync(zipFilePath);
                    console.log(`Deleted ZIP file: ${zipFilePath}`);
                } catch (err) {
                    console.error(`Failed to delete ZIP file: ${err.message}`);
                }

                event.sender.send("verification-success", `Successfully verified and extracted ${zipFile}`);
            };
        } catch (err) {
            event.sender.send("verification-error", `Error processing ${zipFile}: ${err.message}`);
        }
    } else {
        //event.sender.send("verification-error", `ZIP file does not exist: ${zipFilePath}`);
    }
});

// Retrieve offline video path
ipcMain.handle("get-offline-video-file-path", (event, folderName, videoFileName) => {
    const documentsPath = app.getPath("documents");
    const videoFolder = path.join(documentsPath, "iSpeakerReact", "video_files", folderName); // Use folderName passed from the renderer
    let videoFilePath = path.join(videoFolder, videoFileName);

    if (fs.existsSync(videoFilePath)) {
        videoFilePath = videoFilePath.replace(/\\/g, "/");
        return `video-file://${videoFilePath}`; // Return the full path to the video file
    } else {
        throw new Error(`File not found: ${videoFilePath}`);
    }
});

// Handle uncaught exceptions globally and quit the app
process.on("uncaughtException", (error) => {
    console.error("An uncaught error occurred:", error);
    app.quit(); // Quit the app on an uncaught exception
});

// Handle unhandled promise rejections globally and quit the app
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled promise rejection at:", promise, "reason:", reason);
    app.quit(); // Quit the app on an unhandled promise rejection
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

app.whenReady().then(() => {
    createSplashWindow();
    createWindow();

    // Start the Express server on port 8998
    expressApp.listen(8998, () => {
        console.log("Express server is running on http://localhost:8998");
    });
});
