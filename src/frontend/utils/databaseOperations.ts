import { fixWebmDuration } from "@fix-webm-duration/fix";
import isElectron from "./isElectron.js";

let db: IDBDatabase | null = null;

// Helper function to convert Blob to ArrayBuffer
const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(blob);
    });
};

// Open IndexedDB database
const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = window.indexedDB.open("iSpeaker_data", 1);

        request.onerror = (event: Event) => {
            console.error("Database error: ", (event.target as IDBRequest).error);
            reject((event.target as IDBRequest).error);
        };

        request.onsuccess = (event: Event) => {
            db = (event.target as IDBRequest).result as IDBDatabase;
            resolve(db);
        };

        request.onupgradeneeded = (event: Event) => {
            const db = (event.target as IDBRequest).result as IDBDatabase;

            // Create required object stores if they don't exist
            const storeNames = ["recording_data", "conversation_data", "exam_data"];
            storeNames.forEach((storeName) => {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: "id" });
                }
            });
        };
    });
};

// Save recording to either Electron or IndexedDB
const saveRecording = async (
    blob: Blob,
    key: string,
    mimeType: string,
    duration?: number
): Promise<void> => {
    // If duration is not provided, calculate it from the blob
    if (!duration) {
        const audioContext = new AudioContext();
        const arrayBuffer = await blobToArrayBuffer(blob);
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer as ArrayBuffer);
        duration = audioBuffer.duration * 1000; // Convert to milliseconds
    }

    const fixedBlob = await fixWebmDuration(blob, duration);
    const arrayBuffer = await blobToArrayBuffer(fixedBlob);

    if (isElectron()) {
        // Electron environment
        try {
            await window.electron.saveRecording(key, arrayBuffer as ArrayBuffer);
            console.log("Recording saved successfully via Electron API");
        } catch (error) {
            console.error("Error saving recording in Electron:", error);
        }
    } else {
        // Browser environment with IndexedDB
        try {
            const db = await openDatabase();
            if (!db) return;

            const transaction = db.transaction(["recording_data"], "readwrite");
            const store = transaction.objectStore("recording_data");

            const request = store.put({ id: key, recording: arrayBuffer, mimeType: mimeType });

            return new Promise<void>((resolve, reject) => {
                request.onsuccess = () => {
                    console.log("Recording saved successfully to IndexedDB");
                    resolve();
                };
                request.onerror = (error: Event) => {
                    console.error("Error saving recording:", error);
                    reject(error);
                };
            });
        } catch (error) {
            console.error("Error saving recording to IndexedDB:", error);
        }
    }
};

// Check if recording exists
const checkRecordingExists = async (key: string): Promise<boolean> => {
    if (isElectron()) {
        return window.electron.checkRecordingExists(key) as Promise<boolean>;
    } else {
        const db = await openDatabase();
        if (!db) return false;

        return new Promise<boolean>((resolve) => {
            try {
                const transaction = db.transaction(["recording_data"]);
                const store = transaction.objectStore("recording_data");
                const request = store.get(key);

                request.onsuccess = () => {
                    if (request.result) resolve(true);
                    else resolve(false);
                };
                request.onerror = () => resolve(false);
            } catch {
                console.error("Error checking recording existence in IndexedDB.");
                resolve(false);
            }
        });
    }
};

// Play recording from either Electron or IndexedDB
const playRecording = async (
    key: string,
    onSuccess?: (audio: HTMLAudioElement | null, source: AudioBufferSourceNode | null) => void,
    onError?: (error: unknown) => void,
    onEnded?: () => void
): Promise<void> => {
    if (isElectron()) {
        try {
            // Get the audio data as an ArrayBuffer from the main process
            const arrayBuffer = await window.electron.playRecording(key);

            // Create a Blob from the ArrayBuffer
            const audioBlob = new Blob([arrayBuffer as ArrayBuffer], { type: "audio/wav" });

            // Create a Blob URL
            const blobUrl = URL.createObjectURL(audioBlob);

            console.log("Blob URL:", blobUrl);

            // Use the Blob URL for audio playback
            const audio = new Audio(blobUrl);
            audio.onended = () => {
                // Revoke the Blob URL after playback to free up memory
                URL.revokeObjectURL(blobUrl);
                if (onEnded) onEnded();
            };
            audio.onerror = (error) => {
                // Revoke the Blob URL in case of an error
                URL.revokeObjectURL(blobUrl);
                if (onError) onError(error);
            };

            // Play the audio
            await audio.play();

            // Call success callback
            if (onSuccess) onSuccess(audio, null);
        } catch (error) {
            console.error("Error playing audio file in Electron:", error);

            // Call error callback
            if (onError) onError(error);
        }
    } else {
        // Browser environment with IndexedDB
        try {
            const db = await openDatabase();
            if (!db) return;

            const transaction = db.transaction(["recording_data"]);
            const store = transaction.objectStore("recording_data");
            const request = store.get(key);

            request.onsuccess = async () => {
                const result = request.result;
                if (!result) {
                    if (onError) onError(new Error("Recording not found"));
                    return;
                }
                const { recording, mimeType } = result;

                try {
                    // Use AudioContext for playback
                    const audioContext = new AudioContext();
                    const buffer = await audioContext.decodeAudioData(recording as ArrayBuffer);
                    const source = audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(audioContext.destination);

                    source.onended = onEnded || null;
                    source.start();

                    if (onSuccess) onSuccess(null, source);
                } catch (decodeError) {
                    console.error("Error decoding audio data:", decodeError);

                    // Fallback to Blob URL
                    const audioBlob = new Blob([recording as ArrayBuffer], { type: mimeType });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);

                    audio.onended = onEnded || null;
                    audio.onerror = onError || null;

                    audio
                        .play()
                        .then(() => {
                            if (onSuccess) onSuccess(audio, null);
                        })
                        .catch((playError) => {
                            console.error("Error playing audio via Blob URL:", playError);
                            if (onError) onError(playError);
                        });
                }
            };

            request.onerror = (error: Event) => {
                console.error("Error retrieving recording from IndexedDB:", error);
                if (onError) onError(error);
            };
        } catch (error) {
            console.error("Error playing recording from IndexedDB:", error);
            if (onError) onError(error);
        }
    }
};

export { checkRecordingExists, openDatabase, playRecording, saveRecording };
