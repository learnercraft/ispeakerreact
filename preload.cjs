const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    openExternal: (url) => ipcRenderer.invoke("open-external-link", url),
});
