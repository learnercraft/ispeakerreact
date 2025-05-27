import { ipcMain } from "electron";
import applog from "electron-log";
import express from "express";
import { Server } from "node:http";
import net from "node:net";

const DEFAULT_PORT = 8998;
const MIN_PORT = 1024; // Minimum valid port number
const MAX_PORT = 65535; // Maximum valid port number

const expressApp = express();
let currentPort: number | null = null;
let httpServer: Server | null = null;

const getRandomPort = () => Math.floor(Math.random() * (MAX_PORT - MIN_PORT + 1)) + MIN_PORT;

const checkPortAvailability = (port: number) => {
    return new Promise<boolean>((resolve, reject) => {
        const server = net.createServer();
        server.once("error", (err: NodeJS.ErrnoException) => {
            if (err.code === "EADDRINUSE" || err.code === "ECONNREFUSED") {
                resolve(false);
            } else {
                reject(err);
            }
        });
        server.once("listening", () => {
            server.close(() => resolve(true));
        });
        server.listen(port);
    });
};

const startExpressServer = async () => {
    let port = DEFAULT_PORT;
    let isPortAvailable = await checkPortAvailability(port);

    if (!isPortAvailable) {
        applog.warn(`Default port ${DEFAULT_PORT} is in use. Trying a random port...`);
        do {
            port = getRandomPort();
            isPortAvailable = await checkPortAvailability(port);
        } while (!isPortAvailable);
    }

    httpServer = expressApp.listen(port, () => {
        currentPort = port;
        applog.info(`Express server is running on http://localhost:${port}`);
    });
    return httpServer;
};

const getExpressPort = () => currentPort;

// IPC handler for renderer to get port
ipcMain.handle("get-port", () => getExpressPort());

export { expressApp, getExpressPort, startExpressServer };

