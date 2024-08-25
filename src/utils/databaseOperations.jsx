let db;

export function openDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db); // If db is already defined, resolve immediately
            return;
        }
        const request = window.indexedDB.open("iSpeaker_data", 1);

        request.onerror = function (event) {
            console.error("Database error: ", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = function (event) {
            db = event.target.result; // Set db to the successfully opened database
            resolve(db);
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore("recording_data", { keyPath: "id" });
        };
    });
}

export async function saveRecording(blob, key, mimeType) {
    try {
        // First, convert Blob to ArrayBuffer outside of the transaction
        const arrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(blob);
        });

        const db = await openDatabase();
        const transaction = db.transaction(["recording_data"], "readwrite");
        const store = transaction.objectStore("recording_data");

        // Now that we have the ArrayBuffer, store it
        const request = store.put({ id: key, recording: arrayBuffer, mimeType });
        request.onsuccess = () => console.log("Recording saved successfully");
        request.onerror = (error) => console.error("Error saving recording:", error);
    } catch (error) {
        console.error("Error saving recording: ", error);
    }
}

export async function checkRecordingExists(key) {
    try {
        const db = await openDatabase(); // Ensure the db is opened before using it
        const transaction = db.transaction(["recording_data"]);
        const store = transaction.objectStore("recording_data");
        const request = store.get(key);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                if (request.result) resolve(true);
                else resolve(false);
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Error opening database: ", error);
    }
}

export async function playRecording(key, onSuccess, onError, onEnded) {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(["recording_data"]);
        const store = transaction.objectStore("recording_data");
        const request = store.get(key);

        request.onsuccess = function () {
            const result = request.result;
            if (!result) {
                console.error("No recording found for key:", key);
                if (onError) onError(new Error("Recording not found"));
                return;
            }

            const { recording, mimeType } = result;
            console.log("Successfully retrieved recording from IndexedDB:", recording);

            const audioContext = new AudioContext();

            // Resume AudioContext on iOS if it's suspended
            if (audioContext.state === "suspended") {
                audioContext.resume().then(() => {
                    console.log("AudioContext resumed");
                    playBuffer(audioContext, recording, onSuccess, onError, onEnded);
                });
            } else {
                playBuffer(audioContext, recording, onSuccess, onError, onEnded);
            }
        };

        request.onerror = () => {
            console.error("Error getting recording from IndexedDB: ", request.error);
            if (onError) onError(request.error); // Handle error when fetching from IndexedDB fails
        };
    } catch (error) {
        console.error("Error playing recording: ", error);
        if (onError) onError(error); // Handle general errors
        throw error;
    }
}

function playBuffer(audioContext, recording, onSuccess, onError, onEnded) {
    audioContext.decodeAudioData(
        recording,
        (buffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);

            source.onended = () => {
                if (onEnded) onEnded();
            };

            source.start();
            if (onSuccess) onSuccess(null, source);
        },
        (error) => {
            console.error("Error decoding audio data:", error);
            if (onError) onError(error);
        }
    );
}
