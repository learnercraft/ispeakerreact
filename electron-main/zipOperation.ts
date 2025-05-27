import { ipcMain, IpcMainEvent } from "electron";
import applog from "electron-log";
import JS7z from "js7z-tools";
import crypto from "node:crypto";
import fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import path from "node:path";
import { getSaveFolder } from "./filePath.js";

// Function to calculate the SHA-256 hash of a file
const calculateFileHash = (filePath: string) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("data", (data) => hash.update(data));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", (err) => reject(err));
    });
};

const fileVerification = async (
    event: IpcMainEvent,
    zipContents: { extractedFiles: { name: string; hash: string }[] }[],
    extractedFolder: string
) => {
    // Verify existing extracted files
    const totalFiles = zipContents[0].extractedFiles.length;
    let filesProcessed = 0;
    const fileErrors: { type: string; name: string; message: string }[] = [];

    for (const file of zipContents[0].extractedFiles) {
        const extractedFilePath = path.join(extractedFolder, file.name);
        try {
            await fsPromises.access(extractedFilePath);
        } catch {
            console.log(`File missing: ${file.name}`);
            applog.log(`File missing: ${file.name}`);
            fileErrors.push({
                type: "missing",
                name: file.name,
                message: `File missing: ${file.name}. Make sure you do not rename or accidentally delete it.`,
            });
            continue;
        }

        const extractedFileHash = await calculateFileHash(extractedFilePath);
        if (extractedFileHash !== file.hash) {
            console.log(`Hash mismatch for file: ${file.name}`);
            applog.log(`Hash mismatch for file: ${file.name}`);
            fileErrors.push({
                type: "hash-mismatch",
                name: file.name,
                message: `Hash mismatch for file: ${file.name}. It seems like the file was either corrupted or tampered.`,
            });
            continue;
        }

        filesProcessed++;
        const progressPercentage = Math.floor((filesProcessed / totalFiles) * 100);
        event.sender.send("progress-update", progressPercentage); // Send progress update
        applog.log("Verifying extracted file:", file.name);
    }

    if (fileErrors.length === 0) {
        // If no missing or corrupted files, finish the verification
        event.sender.send("verification-success", {
            messageKey:
                "settingPage.videoDownloadSettings.electronVerifyMessage.extractedSuccessMsg",
            param: extractedFolder,
        });
        applog.log(`All extracted files are verified for "${extractedFolder}"`);
        return;
    } else {
        // Send all errors as an array
        event.sender.send("verification-errors", fileErrors);
        applog.log(
            `Verification found errors in extracted files for "${extractedFolder}"`,
            fileErrors
        );
        return;
    }
};

// Handle verify and extract process using JS7z
const verifyAndExtractIPC = () => {
    ipcMain.on("verify-and-extract", async (event, zipFileData) => {
        const { zipFile, zipHash, zipContents } = zipFileData;
        const saveFolder = await getSaveFolder();
        const videoFolder = path.join(saveFolder, "video_files");
        const zipFilePath = path.join(videoFolder, zipFile);
        const extractedFolder = path.join(videoFolder, zipFile.replace(".7z", ""));

        // Step 0: Check if ZIP file exists first
        let zipExists = false;
        try {
            await fsPromises.access(zipFilePath);
            zipExists = true;
        } catch {
            zipExists = false;
        }

        if (zipExists) {
            // ZIP exists: proceed with hash verification and extraction
            console.log(`Starting verification for ${zipFile}`);
            applog.log(`Starting verification for ${zipFile}`);
            try {
                // @ts-expect-error - JS7z is not typed
                const js7z = await JS7z({
                    print: (text: string) => {
                        console.log(`7-Zip output: ${text}`);
                        applog.log(`7-Zip output: ${text}`);
                        if (text.includes("%")) {
                            const match = text.match(/\s+(\d+)%/); // Extract percentage from output
                            if (match) {
                                const percentage = parseInt(match[1], 10);
                                event.sender.send("progress-update", percentage);
                            }
                        }
                    },
                    printErr: (errText: string) => {
                        console.error(`7-Zip error: ${errText}`);
                        applog.error(`7-Zip error: ${errText}`);
                        event.sender.send("verification-error", `7-Zip error: ${errText}`);
                    },
                    onAbort: (reason: string) => {
                        console.error(`7-Zip aborted: ${reason}`);
                        applog.error(`7-Zip aborted: ${reason}`);
                        event.sender.send("verification-error", `7-Zip aborted: ${reason}`);
                    },
                    onExit: (exitCode: number) => {
                        if (exitCode === 0) {
                            console.log(`7-Zip exited successfully with code ${exitCode}`);
                            applog.log(`7-Zip exited successfully with code ${exitCode}`);
                        } else {
                            console.error(`7-Zip exited with error code: ${exitCode}`);
                            applog.error(`7-Zip exited with error code: ${exitCode}`);
                            event.sender.send(
                                "verification-error",
                                `7-Zip exited with error code: ${exitCode}`
                            );
                        }
                    },
                });

                // Mount the local file system to the JS7z instance using NODEFS
                js7z.FS.mkdir("/mnt");
                js7z.FS.mount(js7z.NODEFS, { root: videoFolder }, "/mnt");

                const emZipFilePath = `/mnt/${zipFile}`;
                const emExtractedFolder = `/mnt/${zipFile.replace(".7z", "")}`;

                // Step 1: Verifying ZIP file hash
                event.sender.send(
                    "progress-text",
                    "settingPage.videoDownloadSettings.electronVerifyMessage.zipFileVerifying"
                );
                const fileHash = await calculateFileHash(zipFilePath);
                if (fileHash !== zipHash) {
                    applog.error(
                        `Hash mismatch for ${zipFile}. It seems like the zip file was either corrupted or tampered.`
                    );
                    event.sender.send("verification-error", {
                        messageKey:
                            "settingPage.videoDownloadSettings.electronVerifyMessage.zipHashMismatchMsg",
                        param: zipFile,
                    });
                    return;
                }
                event.sender.send("progress-text", "ZIP file verified");

                // Step 2: Extracting ZIP file
                event.sender.send(
                    "progress-text",
                    "settingPage.videoDownloadSettings.electronVerifyMessage.zipExtractingMsg"
                );
                const extractionResult = await js7z.callMain([
                    "x",
                    emZipFilePath,
                    `-o${emExtractedFolder}`,
                ]);

                if (extractionResult !== 0) {
                    applog.error(`Error extracting ${zipFile}`);
                    event.sender.send("verification-error", {
                        messageKey:
                            "settingPage.videoDownloadSettings.electronVerifyMessage.zipErrorMsg",
                        param: zipFile,
                    });
                    return;
                }

                console.log(`Extraction successful for ${zipFile}`);
                applog.log(`Extraction successful for ${zipFile}`);

                // Step 3: Verifying extracted files
                event.sender.send(
                    "progress-text",
                    "settingPage.videoDownloadSettings.verifyinProgressMsg"
                );
                await fileVerification(event, zipContents, extractedFolder);

                // Clean up the ZIP file after successful extraction and verification
                try {
                    await fsPromises.unlink(zipFilePath);
                    console.log(`Deleted ZIP file: ${zipFilePath}`);
                    applog.log(`Extraction successful for ${zipFile}`);
                } catch (err) {
                    const errorMsg = err instanceof Error ? err.message : String(err);
                    console.error(`Failed to delete ZIP file: ${errorMsg}`);
                    applog.error(`Failed to delete ZIP file: ${errorMsg}`);
                }

                event.sender.send("verification-success", {
                    messageKey:
                        "settingPage.videoDownloadSettings.electronVerifyMessage.zipSuccessMsg",
                    param: zipFile,
                });
                applog.log(`Successfully verified and extracted ${zipFile}`);
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                console.error(`Error processing ${zipFile}: ${errorMsg}`);
                event.sender.send("verification-error", {
                    messageKey:
                        "settingPage.videoDownloadSettings.electronVerifyMessage.zipErrorMsg",
                    param: zipFile,
                    errorMessage: errorMsg,
                });
            }
        } else {
            // ZIP does not exist: check for extracted folder and verify its contents
            console.log(
                `ZIP file does not exist: ${zipFilePath}. It could be extracted before. Proceeding with extracted folder verification...`
            );
            applog.log(
                `ZIP file does not exist: ${zipFilePath}. It could be extracted before. Proceeding with extracted folder verification...`
            );
            try {
                await fsPromises.access(extractedFolder);
                console.log(`Extracted folder already exists: ${extractedFolder}`);
                applog.log(`Extracted folder already exists: ${extractedFolder}`);
                event.sender.send(
                    "progress-text",
                    "settingPage.videoDownloadSettings.verifyinProgressMsg"
                );
                await fileVerification(event, zipContents, extractedFolder);
            } catch {
                console.log(`Extracted folder does not exist: ${extractedFolder}`);
                applog.log(`Extracted folder does not exist: ${extractedFolder}`);
                event.sender.send("verification-error", {
                    messageKey: "settingPage.videoDownloadSettings.verifyFailedMessage",
                    param: extractedFolder,
                });
            }
        }
    });
};

export { fileVerification, verifyAndExtractIPC };
