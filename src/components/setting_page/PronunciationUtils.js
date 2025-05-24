const checkPythonInstalled = async () => {
    if (window.electron?.ipcRenderer) {
        return await window.electron.ipcRenderer.invoke("check-python-installed");
    } else {
        throw new Error("Not running in Electron environment.");
    }
};

const installDependenciesIPC = async () => {
    if (window.electron?.ipcRenderer) {
        return await window.electron.ipcRenderer.invoke("pronunciation-install-deps");
    } else {
        throw new Error("Not running in Electron environment.");
    }
};

const downloadModelStepIPC = async (modelName) => {
    if (window.electron?.ipcRenderer) {
        return await window.electron.ipcRenderer.invoke("pronunciation-download-model", modelName);
    } else {
        throw new Error("Not running in Electron environment.");
    }
};

export { checkPythonInstalled, downloadModelStepIPC, installDependenciesIPC };
