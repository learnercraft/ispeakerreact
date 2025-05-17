import applog from "electron-log";
import express from "express";
import net from "net";

const DEFAULT_PORT = 8998;
const MIN_PORT = 1024; // Minimum valid port number
const MAX_PORT = 65535; // Maximum valid port number

// Create Express server
const expressApp = express();
// Function to generate a random port number within the range
const getRandomPort = () => {
    return Math.floor(Math.random() * (MAX_PORT - MIN_PORT + 1)) + MIN_PORT;
};

// Function to check if a port is available
const checkPortAvailability = (port) => {
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
};

// Function to start the Express server with the default port first, then randomize if necessary
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

    return expressApp.listen(port, () => {
        applog.info(`Express server is running on http://localhost:${port}`);
    });
};

export { expressApp, startExpressServer };
