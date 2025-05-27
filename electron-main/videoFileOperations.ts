import { ipcMain } from "electron";
import * as fsPromises from "node:fs/promises";
import path from "node:path";
import { getSaveFolder } from "./filePath.js";

const checkDownloads = () => {
    ipcMain.handle("check-downloads", async () => {
        const saveFolder = await getSaveFolder();
        const videoFolder = path.join(saveFolder, "video_files");
        // Ensure the directory exists
        try {
            await fsPromises.access(videoFolder);
        } catch {
            await fsPromises.mkdir(videoFolder, { recursive: true });
        }

        const files = await fsPromises.readdir(videoFolder);
        // Return the list of zip files in the download folder
        const zipFiles = files.filter((file: string) => file.endsWith(".7z"));
        return zipFiles.length === 0 ? "no zip files downloaded" : zipFiles;
    });
};

// Check video extracted folder
const checkExtractedFolder = () => {
    ipcMain.handle("check-extracted-folder", async (event, folderName, zipContents) => {
        const saveFolder = await getSaveFolder();
        const extractedFolder = path.join(saveFolder, "video_files", folderName);

        // Check if extracted folder exists
        try {
            await fsPromises.access(extractedFolder);
            const extractedFiles = await fsPromises.readdir(extractedFolder);

            // Check if all expected files are present in the extracted folder
            const allFilesExtracted = zipContents[0].extractedFiles.every((file: any) => {
                return extractedFiles.includes(file.name);
            });

            event.sender.send("progress-update", 0);

            return allFilesExtracted; // Return true if all files are extracted, else false
        } catch {
            return false; // Return false if the folder doesn't exist
        }
    });
};

export { checkDownloads, checkExtractedFolder };
