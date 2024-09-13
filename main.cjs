const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";
const fs = require("fs");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"), // Point to your preload.js file
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    if (isDev) {
        mainWindow.loadURL("http://localhost:5173"); // Point to Vite dev server
    } else {
        mainWindow.loadFile(path.join(__dirname, "./dist/index.html")); // Load the built HTML file
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

// Handle the IPC event from the renderer
ipcMain.handle("open-external-link", async (event, url) => {
    await shell.openExternal(url); // Open the external link
});

const getSaveFolder = () => {
    const documentsPath = app.getPath("documents");
    const saveFolder = path.join(documentsPath, "iSpeakerReact", "saved_recordings");

    // Ensure the directory exists
    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
    }

    return saveFolder;
};

// Handle saving a recording
ipcMain.handle("save-recording", (event, key, arrayBuffer) => {
    const saveFolder = getSaveFolder();
    const filePath = path.join(saveFolder, `${key}.wav`);

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
    const filePath = path.join(saveFolder, `${key}.wav`);

    return fs.existsSync(filePath);
});

// Handle playing a recording (this can be improved for streaming)
ipcMain.handle("play-recording", async (event, key) => {
    const filePath = path.join(getSaveFolder(), `${key}.wav`);

    // Check if the file exists
    try {
        const data = await fs.promises.readFile(filePath);
        return data.buffer; // Return the ArrayBuffer to the renderer process
    } catch (error) {
        console.error("File not found:", filePath);
        throw new Error("Recording file not found");
    }
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
    createWindow();
});
