import isElectron from "./isElectron.js";

const openExternal = (url: string) => {
    if (isElectron()) {
        window.electron.openExternal(url);
    } else {
        window.open(url, "_blank", "noopener,noreferrer");
    }
};

export default openExternal;
