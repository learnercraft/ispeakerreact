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
    },
    getDirName: () => __dirname,
});
