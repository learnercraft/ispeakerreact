import { app, BrowserWindow, Menu, shell } from "electron";
import applog from "electron-log";
import path from "node:path";
import process from "node:process";
import { startExpressServer } from "./expressServer.js";

const isDev = process.env.NODE_ENV === "development";

let mainWindow: BrowserWindow | null;
let splashWindow: BrowserWindow | null;

const createSplashWindow = (rootDir: string, ipcMain: any, conf: any) => {
    splashWindow = new BrowserWindow({
        width: 854,
        height: 413,
        frame: false, // Remove window controls
        transparent: true, // Make the window background transparent
        alwaysOnTop: true,
        icon: path.join(rootDir, "dist", "appicon.png"),
        webPreferences: {
            preload: path.join(rootDir, "preload.cjs"),
            nodeIntegration: false,
            contextIsolation: true,
            devTools: isDev ? true : false,
        },
    });

    // For splash screen
    ipcMain.handle("get-conf", (key: string) => {
        return conf.get(key);
    });

    // Load the splash screen HTML
    splashWindow.loadFile(path.join(rootDir, "data", "splash.html"));

    splashWindow.setTitle("Starting up...");

    // Splash window should close when the main window is ready
    splashWindow.on("closed", () => {
        splashWindow = null;
    });
};

const createWindow = (rootDir: string) => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        webPreferences: {
            preload: path.join(rootDir, "preload.cjs"),
            nodeIntegration: false,
            contextIsolation: true,
            devTools: isDev ? true : false,
        },
        icon: path.join(rootDir, "dist", "appicon.png"),
    });

    if (isDev) {
        mainWindow.loadURL("http://localhost:5173"); // Point to Vite dev server
    } else {
        mainWindow.loadFile(path.join(rootDir, "./dist/index.html")); // Load the built HTML file
    }

    // Show the main window only when it's ready
    mainWindow.once("ready-to-show", () => {
        setTimeout(() => {
            if (splashWindow) {
                splashWindow.close();
            }
            if (mainWindow) {
                mainWindow.maximize();
                mainWindow.show();
            }
            // Start Express server in the background after main window is shown
            startExpressServer();
        }, 500);
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    mainWindow.on("enter-full-screen", () => {
        if (mainWindow) {
            mainWindow.setMenuBarVisibility(false);
        }
    });

    mainWindow.on("leave-full-screen", () => {
        if (mainWindow) {
            mainWindow.setMenuBarVisibility(true);
        }
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
                ...(isDev ? [{ role: "toggleDevTools" as const }] : []),
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
                        shell.openExternal("https://github.com/learnercraft/ispeakerreact");
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

    applog.info(`App started. Version ${app.getVersion()}`);
};

export { createSplashWindow, createWindow };
