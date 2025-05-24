import { spawn } from "child_process";
import { ipcMain } from "electron";
import applog from "electron-log";
import * as fsPromises from "node:fs/promises";
import path from "node:path";
import { getSaveFolder, readUserSettings } from "./filePath.js";
import { getCurrentLogSettings } from "./logOperations.js";
import { getVenvPythonPath, ensureVenvExists } from "./pronunciationOperations.js";

const startProcess = (cmd, args) => {
    const proc = spawn(cmd, args, { shell: true });
    return proc;
};

// IPC handler to check pronunciation
const setupPronunciationCheckerIPC = () => {
    ipcMain.handle("pronunciation-check", async (event, audioPath, modelName) => {
        const saveFolder = await getSaveFolder(readUserSettings);
        // If modelName is not provided, read from user settings
        if (!modelName) {
            const userSettings = await readUserSettings();
            modelName = userSettings.modelName;
        }

        let modelDir;
        if (modelName) {
            const safeModelFolder = modelName.replace(/\//g, "_");
            modelDir = path.join(saveFolder, "phoneme-model", safeModelFolder);
            console.log(`[PronunciationChecker] modelDir: ${safeModelFolder}`);
        } else {
            modelDir = path.join(saveFolder, "phoneme-model");
        }
        const logSettings = getCurrentLogSettings();

        // Configure electron-log with current settings
        applog.transports.file.maxSize = logSettings.maxLogSize;
        applog.transports.console.level = logSettings.logLevel;

        applog.info(`[PronunciationChecker] audioPath: ${audioPath}`);
        applog.info(`[PronunciationChecker] modelDir: ${modelDir}`);

        // Robust Python script for model inference
        const pyCode = `
import sys
import json
import torch
import librosa
from transformers.models.wav2vec2 import (
    Wav2Vec2Processor,
    Wav2Vec2ForCTC,
    Wav2Vec2FeatureExtractor,
    Wav2Vec2CTCTokenizer,
)

# Set console encoding to UTF-8
if sys.platform == "win32":
    import codecs

    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.buffer, "strict")
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.buffer, "strict")

MODEL_DIR = r"""${modelDir}"""
AUDIO_PATH = r"""${audioPath}"""


def log_json(obj):
    # Send a single JSON string to stdout
    print(json.dumps(obj, ensure_ascii=False))


def main():
    try:
        log_json({"status": "progress", "message": "Loading processor..."})
        feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(MODEL_DIR)
        tokenizer = Wav2Vec2CTCTokenizer.from_pretrained(MODEL_DIR)
        processor = Wav2Vec2Processor(
            feature_extractor=feature_extractor, tokenizer=tokenizer
        )
        model = Wav2Vec2ForCTC.from_pretrained(MODEL_DIR)
        log_json({"status": "progress", "message": "Model loaded."})

        log_json({"status": "progress", "message": f"Loading audio: {AUDIO_PATH}"})
        speech_array, sampling_rate = librosa.load(
            AUDIO_PATH, sr=16000
        )  # Ensure 16kHz for wav2vec2
        log_json(
            {
                "status": "progress",
                "message": f"Audio loaded. Sample rate: {sampling_rate}",
            }
        )

        log_json({"status": "progress", "message": "Preparing inputs for model..."})
        inputs = processor(
            speech_array, sampling_rate=16000, return_tensors="pt", padding=True
        )
        log_json(
            {
                "status": "progress",
                "message": f"Input tensor shape: {inputs['input_values'].shape}, dtype: {inputs['input_values'].dtype}",
            }
        )

        log_json({"status": "progress", "message": "Running model..."})
        with torch.no_grad():
            logits = model(**inputs).logits
        log_json({"status": "progress", "message": "Model run complete."})

        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = processor.batch_decode(predicted_ids)
        if transcription == "":
            log_json(
                {
                    "status": "success",
                    "phonemes": None,
                    "message": "No phonemes detected.",
                }
            )
        else:
            log_json({"status": "success", "phonemes": transcription[0].strip()})

    except Exception as e:
        import traceback

        tb = traceback.format_exc()
        log_json({"status": "error", "message": str(e), "traceback": tb})
        sys.exit(1)


if __name__ == "__main__":
    main()
`;
        const tempPyPath = path.join(saveFolder, "pronunciation_checker_temp.py");
        await fsPromises.writeFile(tempPyPath, pyCode, "utf-8");
        applog.info(`[PronunciationChecker] tempPyPath: ${tempPyPath}`);
        let venvPython;
        try {
            await ensureVenvExists();
            venvPython = await getVenvPythonPath();
        } catch (err) {
            applog.error(`[PronunciationChecker] Failed to create or find venv: ${err.message}`);
            return { status: "error", message: `Failed to create or find venv: ${err.message}` };
        }
        applog.info(`[PronunciationChecker] About to run: ${venvPython} -u ${tempPyPath}`);
        return new Promise((resolve) => {
            const py = startProcess(venvPython, ["-u", tempPyPath], (err) => {
                fsPromises.unlink(tempPyPath).catch(() => {
                    applog.warn(
                        "[PronunciationChecker] Failed to delete temp pronunciation checker file"
                    );
                });
                if (err) {
                    applog.error(
                        `[PronunciationChecker] Python process exited with code: ${err.code}`
                    );
                }
            });
            let lastJson = null;
            py.stdout.on("data", (data) => {
                const lines = data.toString().split(/\r?\n/);
                for (const line of lines) {
                    if (line.trim().startsWith("{") && line.trim().endsWith("}")) {
                        try {
                            const jsonData = JSON.parse(line.trim());
                            lastJson = jsonData;

                            // Log with appropriate level based on status
                            const logMessage = {
                                component: "PronunciationChecker",
                                ...jsonData,
                            };

                            switch (jsonData.status) {
                                case "progress":
                                    applog.info(logMessage);
                                    break;
                                case "success":
                                    applog.info(logMessage);
                                    break;
                                case "error":
                                    applog.error(logMessage);
                                    break;
                                default:
                                    applog.info(logMessage);
                            }
                        } catch {
                            applog.error(
                                `[PronunciationChecker] Failed to parse JSON: ${line.trim()}`
                            );
                        }
                    }
                }
            });
            py.stderr.on("data", (data) => {
                const lines = data.toString().split(/\r?\n/);
                for (const line of lines) {
                    if (line.trim()) {
                        applog.error({
                            component: "PronunciationChecker",
                            status: "error",
                            message: line.trim(),
                        });
                    }
                }
            });
            py.on("close", (code) => {
                if (lastJson && lastJson.status === "error") {
                    // Return the detailed error from Python
                    resolve(lastJson);
                } else if (code === 0 && lastJson) {
                    resolve(lastJson);
                } else {
                    resolve({
                        status: "error",
                        message: `Process exited with code ${code}`,
                    });
                }
            });
        });
    });
};

// IPC handler to get the recording blob for a given key
const setupGetRecordingBlobIPC = () => {
    ipcMain.handle("get-recording-blob", async (_event, key) => {
        const saveFolder = await getSaveFolder(readUserSettings);
        const filePath = path.join(saveFolder, "saved_recordings", `${key}.wav`);
        try {
            const data = await fsPromises.readFile(filePath);
            return data.buffer; // ArrayBuffer for renderer
        } catch (err) {
            throw new Error(`Failed to read recording: ${err.message}`);
        }
    });
};

export { setupGetRecordingBlobIPC, setupPronunciationCheckerIPC };
