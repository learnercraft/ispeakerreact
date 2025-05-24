import { ipcMain } from "electron";
import { Conf } from "electron-conf/main";
import fkill from "fkill";
import { spawn } from "node:child_process";
import * as fsPromises from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { getSaveFolder, readUserSettings, settingsConf } from "./filePath.js";

let currentPythonProcess = null;
let pendingCancel = false;
let isGloballyCancelled = false;

// Singleton instance for pronunciation install status
const installConf = new Conf({ name: "pronunciation-install" });

const checkPythonInstalled = async () => {
    let log = "";
    return new Promise((resolve) => {
        // Try python3 first
        const tryPython = (cmd, cb) => {
            const proc = spawn(cmd, ["--version"], { shell: true });
            let stdout = "";
            let stderr = "";
            proc.stdout.on("data", (data) => {
                stdout += data.toString();
            });
            proc.stderr.on("data", (data) => {
                stderr += data.toString();
            });
            proc.on("close", (code) => {
                cb(code, stdout, stderr);
            });
        };
        tryPython("python3", (err, stdout, stderr) => {
            log += "> python3 --version\n" + stdout + stderr + "\n";
            if (!err && stdout) {
                resolve({
                    found: true,
                    version: stdout.trim(),
                    stderr: stderr.trim(),
                    log: log.trim(),
                });
            } else {
                tryPython("python", (err2, stdout2, stderr2) => {
                    log += "> python --version\n" + stdout2 + stderr2 + "\n";
                    if (!err2 && stdout2) {
                        resolve({
                            found: true,
                            version: stdout2.trim(),
                            stderr: stderr2.trim(),
                            log: log.trim(),
                        });
                    } else {
                        resolve({
                            found: false,
                            version: null,
                            stderr: (stderr2 || stderr || "").trim(),
                            log: log.trim(),
                        });
                    }
                });
            }
        });
    });
};

const startProcess = (cmd, args, onExit) => {
    const proc = spawn(cmd, args, { shell: true });
    currentPythonProcess = proc;
    if (pendingCancel) {
        // Wait 0.5s, then kill the process
        setTimeout(() => {
            fkill(proc.pid, { force: true, tree: true })
                .then(() => {
                    console.log("[Cancel] Process killed after short delay due to pending cancel.");
                })
                .catch((err) => {
                    if (err.message && err.message.includes("Process doesn't exist")) {
                        // Already dead, ignore
                    } else {
                        console.error("[Cancel] Error killing process after delay:", err);
                    }
                });
            proc._wasCancelledImmediately = true; // Mark for downstream logic
        }, 500); // 0.5 second delay
        pendingCancel = false;
    }
    proc.on("close", (code) => {
        onExit && onExit(code !== 0 ? { code } : null);
    });
    return proc;
};

const dependencies = [
    "numpy",
    "torch",
    "transformers",
    "huggingface_hub[hf_xet]",
    "librosa",
    "protobuf", // for facebook models
    "phonemizer", // for facebook models
];

const resetGlobalCancel = () => {
    isGloballyCancelled = false;
};

// --- VENV HELPERS ---
const getVenvDir = async () => {
    const saveFolder = await getSaveFolder(readUserSettings);
    return path.join(saveFolder, "pronunciation-venv");
};

const getVenvPythonPath = async () => {
    const venvDir = await getVenvDir();
    if (process.platform === "win32") {
        return path.join(venvDir, "Scripts", "python.exe");
    } else {
        return path.join(venvDir, "bin", "python");
    }
};

const getVenvPipPath = async () => {
    const venvDir = await getVenvDir();
    if (process.platform === "win32") {
        return path.join(venvDir, "Scripts", "pip.exe");
    } else {
        return path.join(venvDir, "bin", "pip");
    }
};

const upgradeVenvPip = async () => {
    const venvPython = await getVenvPythonPath();
    return new Promise((resolve, reject) => {
        const proc = spawn(venvPython, ["-m", "pip", "install", "--upgrade", "pip"], {
            shell: true,
        });
        let output = "";
        let error = "";
        proc.stdout.on("data", (data) => {
            output += data.toString();
        });
        proc.stderr.on("data", (data) => {
            error += data.toString();
        });
        proc.on("close", (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(error || `pip upgrade failed with code ${code}`));
            }
        });
    });
};

const ensureVenvExists = async () => {
    const venvDir = await getVenvDir();
    let venvPython = await getVenvPythonPath();
    try {
        await fsPromises.access(venvPython);
        // Already exists
        return venvPython;
    } catch {
        // Create venv
        // Use system python to create venv
        let systemPython = "python";
        // Try to use python3 if available
        try {
            await new Promise((resolve, reject) => {
                const proc = spawn("python3", ["--version"], { shell: true });
                proc.on("close", (code) => {
                    if (code === 0) resolve();
                    else reject();
                });
            });
            systemPython = "python3";
        } catch {
            // fallback to python
        }
        await new Promise((resolve, reject) => {
            const proc = spawn(systemPython, ["-m", "venv", venvDir], { shell: true });
            proc.on("close", (code) => {
                if (code === 0) resolve();
                else reject(new Error("Failed to create venv"));
            });
        });
        // Store venv path in settings
        settingsConf.set("pronunciationVenvPath", venvDir);
        return venvPython;
    }
};

const installDependencies = () => {
    ipcMain.handle("pronunciation-install-deps", async (event) => {
        if (isGloballyCancelled) {
            return { deps: [{ name: "all", status: "cancelled" }], log: "" };
        }
        let log = "";
        event.sender.send("pronunciation-dep-progress", { name: "all", status: "pending" });
        // Ensure venv exists
        let venvPip;
        try {
            await ensureVenvExists();
            venvPip = await getVenvPipPath();
            try {
                await upgradeVenvPip();
                log += "Upgraded pip to latest version.\n";
            } catch (err) {
                log += `Failed to upgrade pip: ${err.message}\n`;
            }
        } catch (err) {
            log += `Failed to create virtual environment: ${err.message}\n`;
            event.sender.send("pronunciation-dep-progress", {
                name: "all",
                status: "error",
                log: log.trim(),
            });
            return { deps: [{ name: "all", status: "error" }], log };
        }
        return new Promise((resolve) => {
            const pipArgs = ["install", ...dependencies, "-U"];
            const pipProcess = startProcess(venvPip, pipArgs, (err) => {
                const status = err ? "error" : "success";
                event.sender.send("pronunciation-dep-progress", {
                    name: "all",
                    status,
                    log: log.trim(),
                });
                resolve({ deps: [{ name: "all", status }], log });
            });
            pipProcess.stdout.on("data", (data) => {
                log += data.toString();
                event.sender.send("pronunciation-dep-progress", {
                    name: "all",
                    status: "pending",
                    log: log.trim(),
                });
            });
            pipProcess.stderr.on("data", (data) => {
                log += data.toString();
                event.sender.send("pronunciation-dep-progress", {
                    name: "all",
                    status: "pending",
                    log: log.trim(),
                });
            });
        });
    });
};

// Extracted model download logic
const downloadModelToDir = async (modelDir, modelName, onProgress) => {
    if (isGloballyCancelled) {
        if (onProgress) onProgress({ status: "cancelled", message: "Cancelled before start" });
        return { status: "cancelled", message: "Cancelled before start" };
    }
    // Ensure modelDir exists
    try {
        await fsPromises.access(modelDir);
    } catch {
        await fsPromises.mkdir(modelDir, { recursive: true });
    }
    // Ensure venv exists and get venv Python path
    let venvPython;
    try {
        await ensureVenvExists();
        venvPython = await getVenvPythonPath();
    } catch (err) {
        if (onProgress)
            onProgress({
                status: "error",
                message: `Failed to create virtual environment: ${err.message}`,
            });
        return { status: "error", message: `Failed to create virtual environment: ${err.message}` };
    }
    // Write Python code to temp file in save folder
    const pyCode = `
import os, sys, json

try:
    from huggingface_hub import snapshot_download, list_repo_files
except ImportError:
    print(json.dumps({"status": "error", "message": "huggingface_hub not installed"}))
    sys.exit(1)

model_dir = r"""${modelDir}"""
repo_id = "${modelName}"

try:
    files = list_repo_files(repo_id)
except Exception as e:
    print(
        json.dumps(
            {"status": "error", "message": f"Failed to list repo files: {str(e)}"}
        )
    )
    sys.exit(1)

has_safetensors = any(f.endswith(".safetensors") for f in files)
has_bin = any(f.endswith(".bin") for f in files)

if has_safetensors and has_bin:
    print(
        json.dumps(
            {
                "status": "downloading",
                "message": "Both .safetensors and .bin found. Downloading all except .bin...",
            }
        )
    )
    try:
        snapshot_download(
            repo_id=repo_id, local_dir=model_dir, ignore_patterns=["*.bin"]
        )
        print(
            json.dumps(
                {"status": "success", "message": "Downloaded all files except .bin"}
            )
        )
    except Exception as e:
        print(json.dumps({"status": "error", "message": f"Download failed: {str(e)}"}))
        sys.exit(1)
elif has_safetensors:
    print(
        json.dumps(
            {
                "status": "downloading",
                "message": "Only .safetensors found. Downloading all files...",
            }
        )
    )
    try:
        snapshot_download(repo_id=repo_id, local_dir=model_dir)
        print(
            json.dumps(
                {
                    "status": "success",
                    "message": "Downloaded all files (including .safetensors)",
                }
            )
        )
    except Exception as e:
        print(json.dumps({"status": "error", "message": f"Download failed: {str(e)}"}))
        sys.exit(1)
elif has_bin:
    print(
        json.dumps(
            {
                "status": "downloading",
                "message": "Only .bin found. Downloading all files...",
            }
        )
    )
    try:
        snapshot_download(repo_id=repo_id, local_dir=model_dir)
        print(
            json.dumps(
                {
                    "status": "success",
                    "message": "Downloaded all files (including .bin)",
                }
            )
        )
    except Exception as e:
        print(json.dumps({"status": "error", "message": f"Download failed: {str(e)}"}))
        sys.exit(1)
else:
    print(
        json.dumps(
            {
                "status": "error",
                "message": "No model file (.safetensors or .bin) found in repo.",
            }
        )
    )
    sys.exit(1)
`;
    const saveFolder = await getSaveFolder(readUserSettings);
    const tempPyPath = path.join(saveFolder, "download_model_temp.py");
    await fsPromises.writeFile(tempPyPath, pyCode, "utf-8");
    // Emit 'downloading' status before launching Python process
    if (onProgress)
        onProgress({ status: "downloading", message: "Preparing to download model..." });
    return new Promise((resolve) => {
        const py = startProcess(venvPython, ["-u", tempPyPath], (err) => {
            currentPythonProcess = null;
            fsPromises.unlink(tempPyPath).catch(() => {
                console.log("Failed to delete temp file");
            });
            if (err) {
                if (onProgress)
                    onProgress({
                        status: "error",
                        message: `Model download process exited with code ${err.code}`,
                    });
                resolve({
                    status: "error",
                    message: `Model download process exited with code ${err.code}`,
                });
            } else {
                if (onProgress)
                    onProgress({ status: "success", message: "Model download complete." });
                resolve({ status: "success", message: "Model download complete." });
            }
        });
        // If process was cancelled immediately, resolve and do not proceed
        if (py._wasCancelledImmediately) {
            if (onProgress)
                onProgress({ status: "cancelled", message: "Process cancelled before start" });
            resolve({ status: "cancelled", message: "Process cancelled before start" });
            return;
        }
        let lastStatus = null;
        let hadError = false;
        py.stdout.on("data", (data) => {
            const str = data.toString();
            // Always forward raw output to renderer for logging
            if (onProgress) onProgress({ status: "log", message: str });
            // Try to parse JSON lines as before
            str.split(/\r?\n/).forEach((line) => {
                if (line.trim()) {
                    try {
                        const msg = JSON.parse(line);
                        lastStatus = msg;
                        if (msg.status === "error") {
                            hadError = true;
                            if (onProgress) onProgress(msg);
                        } else {
                            if (onProgress) onProgress(msg);
                        }
                    } catch {
                        // Ignore parse errors for non-JSON lines
                    }
                }
            });
        });
        py.stderr.on("data", (data) => {
            // Only log stderr, do not send error status unless process exits with error
            if (onProgress) onProgress({ status: "log", message: data.toString() });
        });
        py.on("exit", (code) => {
            currentPythonProcess = null;
            fsPromises.unlink(tempPyPath).catch(() => {
                console.log("Failed to delete temp file");
            });
            // If process exited with error and no JSON error was sent, send a generic error
            if (code !== 0 && !hadError) {
                if (onProgress)
                    onProgress({
                        status: "error",
                        message: `Model download process exited with code ${code}`,
                    });
                resolve({
                    status: "error",
                    message: `Model download process exited with code ${code}`,
                });
            } else {
                resolve(lastStatus);
            }
        });
    });
};

const downloadModel = () => {
    ipcMain.handle("pronunciation-download-model", async (event, modelName) => {
        const saveFolder = await getSaveFolder(readUserSettings);
        // Replace / with _ for folder name
        const safeModelFolder = modelName.replace(/\//g, "_");
        const modelDir = path.join(saveFolder, "phoneme-model", safeModelFolder);
        // Forward progress to renderer
        const finalStatus = await downloadModelToDir(modelDir, modelName, (msg) => {
            event.sender.send("pronunciation-model-progress", msg);
        });
        // After successful download, update user settings with modelName
        console.log(
            `[PronunciationOperations] finalStatus: ${JSON.stringify(finalStatus, null, 2)}`
        );
        if (finalStatus && (finalStatus.status === "success" || finalStatus.status === "found")) {
            settingsConf.set("modelName", modelName);
            console.log(`[PronunciationOperations] modelName updated to ${modelName}`);
            console.log(`[PronunciationOperations] settingsConf: ${settingsConf.get("modelName")}`);
        }
        // Return summary to renderer
        return finalStatus;
    });
};

const cancelProcess = () => {
    ipcMain.handle("pronunciation-cancel-process", async (event) => {
        isGloballyCancelled = true;
        console.log(
            "[Cancel] Cancellation requested. currentPythonProcess:",
            currentPythonProcess ? "exists" : "null"
        );
        if (currentPythonProcess) {
            try {
                await fkill(currentPythonProcess.pid, { force: true, tree: true });
                console.log("[Cancel] Python process tree killed with fkill.");
            } catch (err) {
                console.error("[Cancel] Error killing Python process tree:", err);
            }
            currentPythonProcess = null;
        } else {
            console.log("[Cancel] No Python process to kill. Setting pendingCancel flag.");
            pendingCancel = true;
        }
        // Update installConf with cancelled state
        const prevStatus = installConf.get("status", {}) || {};
        installConf.set("status", { ...prevStatus, cancelled: true, timestamp: Date.now() });
        event.sender.send("pronunciation-cancelled");
        console.log("[Cancel] Pronunciation process cancelled (event sent to renderer)");
    });
};

// Add a function to kill the current Python process (for app quit cleanup)
const killCurrentPythonProcess = async () => {
    if (currentPythonProcess) {
        try {
            await fkill(currentPythonProcess.pid, { force: true, tree: true });
            console.log("[Cleanup] Python process tree killed on app quit.");
        } catch (err) {
            console.error("[Cleanup] Error killing Python process tree on app quit:", err);
        }
        currentPythonProcess = null;
    }
};

// The install status is now structured as:
// {
//   python: { found, version },
//   dependencies: [ { name, status, log }, ... ],
//   model: { status, message, log },
//   stderr: <string>,
//   log: <string>,
//   timestamp: <number>
// }
const setupPronunciationInstallStatusIPC = () => {
    ipcMain.handle("get-pronunciation-install-status", async () => {
        return installConf.get("status", null);
    });
    ipcMain.handle("set-pronunciation-install-status", async (_event, status) => {
        // If the status is already in the new structure, save as is
        if (
            status &&
            status.python &&
            status.dependencies &&
            status.model &&
            "stderr" in status &&
            "log" in status
        ) {
            installConf.set("status", { ...status, timestamp: Date.now() });
        } else {
            // If the status is in the old format, attempt to migrate
            const migrated = migrateOldStatusToStructured(status);
            installConf.set("status", migrated);
        }
        return true;
    });
};

// Helper to migrate old flat status to new structured format
const migrateOldStatusToStructured = (status) => {
    if (!status) return null;
    // Try to extract python info
    const python = {
        found: status.found,
        version: status.version,
    };
    // Dependencies: if array, use as is; if single dep, wrap in array
    let dependencies = status.deps;
    if (!Array.isArray(dependencies)) {
        dependencies = dependencies ? [dependencies] : [];
    }
    // Model info
    const model = {
        status: status.modelStatus || status.status,
        message: status.modelMessage || status.message,
        log: status.modelLog || "",
    };
    return {
        python,
        dependencies,
        model,
        stderr: status.stderr || "",
        log: status.log || "",
        timestamp: Date.now(),
    };
};

export {
    cancelProcess,
    checkPythonInstalled,
    downloadModel,
    installDependencies,
    killCurrentPythonProcess,
    resetGlobalCancel,
    setupPronunciationInstallStatusIPC,
    ensureVenvExists,
    getVenvPythonPath,
};
