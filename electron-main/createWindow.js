import { app, BrowserWindow, Menu, shell } from "electron";
import applog from "electron-log";
import path from "node:path";
import process from "node:process";
import { startExpressServer } from "./expressServer.js";
import pkg from "../package.json" with { type: "json" };

const { version } = pkg;
const isDev = process.env.NODE_ENV === "development";

let mainWindow;
let splashWindow;

const createSplashWindow = (rootDir) => {
    splashWindow = new BrowserWindow({
        width: 854,
        height: 413,
        frame: false, // Remove window controls
        transparent: true, // Make the window background transparent
        alwaysOnTop: true,
        icon: path.join(rootDir, "dist", "appicon.png"),
    });

    // Load the splash screen HTML
    splashWindow.loadFile(path.join(rootDir, "data", "splash.html"));

    splashWindow.setTitle("Starting up...");

    // Splash window should close when the main window is ready
    splashWindow.on("closed", () => {
        splashWindow = null;
    });
};

const createWindow = (rootDir, onServerReady) => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        webPreferences: {
            preload: path.join(rootDir, "preload.cjs"), // Point to your preload.js file
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
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
            splashWindow.close();
            mainWindow.maximize();
            mainWindow.show();

            // Start Express server in the background after main window is shown
            startExpressServer().then((srv) => {
                if (onServerReady) onServerReady(srv);
            });
        }, 500);
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

    applog.info(`App started. Version ${version}`);
};

export { createSplashWindow, createWindow };
