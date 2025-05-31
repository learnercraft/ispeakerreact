import * as fs from "node:fs";

fs.cpSync("data/js7z", "dist-electron/electron-main/js7z", { recursive: true });

// Rename preload.mjs to preload.cjs in ./dist-electron
/*const preloadSrc = "dist-electron/preload.mjs";
const preloadDest = "dist-electron/preload.cjs";
if (fs.existsSync(preloadSrc)) {
    fs.renameSync(preloadSrc, preloadDest);
}*/
