import isElectron from "./isElectron";

const openExternal = (url) => {
    if (isElectron()) {
        window.electron.openExternal(url);
    } else {
        window.open(url, "_blank", "noopener,noreferrer");
    }
};

export default openExternal;
