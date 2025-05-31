import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
    openExternal: (url: string) => ipcRenderer.invoke("open-external-link", url),
    saveRecording: (key: string, arrayBuffer: ArrayBuffer) =>
        ipcRenderer.invoke("save-recording", key, arrayBuffer),
    checkRecordingExists: (key: string) => ipcRenderer.invoke("check-recording-exists", key),
    playRecording: (key: string) => ipcRenderer.invoke("play-recording", key),
    ipcRenderer: {
        invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
        send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
        on: (channel: string, func: (...args: unknown[]) => void) => ipcRenderer.on(channel, func),
        removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
        removeListener: (channel: string, func: (...args: unknown[]) => void) =>
            ipcRenderer.removeListener(channel, func),
    },
    getDirName: () => __dirname,
    isUwp: () => process.windowsStore,
    send: (channel: string, data: unknown) => {
        ipcRenderer.send(channel, data);
    },
    log: (level: string, message: string) => {
        // Send log message to the main process
        ipcRenderer.send("renderer-log", { level, message });
    },
    getRecordingBlob: async (key: string) => {
        // Use IPC to ask the main process for the blob
        return await ipcRenderer.invoke("get-recording-blob", key);
    },
    getFfmpegWasmPath: async () => {
        return await ipcRenderer.invoke("get-ffmpeg-wasm-path");
    },
    getFileAsBlobUrl: async (filePath: string, mimeType: string) => {
        const arrayBuffer = await ipcRenderer.invoke("read-file-buffer", filePath);
        const blob = new Blob([arrayBuffer], { type: mimeType });
        return URL.createObjectURL(blob);
    },
});
