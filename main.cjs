const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

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

app.whenReady().then(createWindow);
