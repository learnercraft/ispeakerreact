const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    openExternal: (url) => ipcRenderer.invoke("open-external-link", url),
    saveRecording: (key, arrayBuffer) => ipcRenderer.invoke("save-recording", key, arrayBuffer),
    checkRecordingExists: (key) => ipcRenderer.invoke("check-recording-exists", key),
    playRecording: (key) => ipcRenderer.invoke("play-recording", key),
    ipcRenderer: {
        invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
        send: (channel, ...args) => ipcRenderer.send(channel, ...args),
        on: (channel, func) => ipcRenderer.on(channel, func),
        removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
        removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
    },
    getDirName: () => __dirname,
    isUwp: () => process.windowsStore,
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    log: (level, message) => {
        // Send log message to the main process
        ipcRenderer.send("renderer-log", { level, message });
    },
    getRecordingBlob: async (key) => {
        // Use IPC to ask the main process for the blob
        return await ipcRenderer.invoke("get-recording-blob", key);
    },
    getFfmpegWasmPath: async () => {
        return await ipcRenderer.invoke("get-ffmpeg-wasm-path");
    },
    getFileAsBlobUrl: async (filePath, mimeType) => {
        const arrayBuffer = await ipcRenderer.invoke("read-file-buffer", filePath);
        const blob = new Blob([arrayBuffer], { type: mimeType });
        return URL.createObjectURL(blob);
    },
});
