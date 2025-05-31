// This script is to delete automatically the dist folders

import * as fs from "fs";
import path, { dirname } from "node:path";

const __dirname = path.resolve();

const deleteFolderRecursive = (directoryPath) => {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
};

["dist", "dist-electron", "dist-react"].forEach((dir) => {
    deleteFolderRecursive(path.join(__dirname, dir));
});
