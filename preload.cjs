const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    openExternal: (url) => ipcRenderer.invoke("open-external-link", url),
    saveRecording: (key, arrayBuffer) => ipcRenderer.invoke("save-recording", key, arrayBuffer),
    checkRecordingExists: (key) => ipcRenderer.invoke("check-recording-exists", key),
    playRecording: (key) => ipcRenderer.invoke("play-recording", key),
});
