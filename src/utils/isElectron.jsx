import { useMemo } from "react";

export function useIsElectron() {
    const isElectron = useMemo(() => {
        // https://github.com/cheton/is-electron/blob/master/index.js
        // Renderer process
        if (typeof window !== "undefined" && typeof window.process === "object" && window.process.type === "renderer") {
            return true;
        }

        // Main process
        if (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron) {
            return true;
        }

        // Detect the user agent when the `nodeIntegration` option is set to false
        if (
            typeof navigator === "object" &&
            typeof navigator.userAgent === "string" &&
            navigator.userAgent.indexOf("Electron") >= 0
        ) {
            return true;
        }

        return false;
    }, []); // [] only runs once (on mount)

    return isElectron;
}
