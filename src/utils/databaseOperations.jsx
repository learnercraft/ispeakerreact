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

            // Create the recording_data store if it doesn't already exist
            if (!db.objectStoreNames.contains("recording_data")) {
                db.createObjectStore("recording_data", { keyPath: "id" });
            }

            // Create the conversation_data store if it doesn't already exist
            if (!db.objectStoreNames.contains("conversation_data")) {
                db.createObjectStore("conversation_data", { keyPath: "id" });
            }
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
            const { recording, mimeType } = request.result; // Retrieve the recording and MIME type

            // Try using AudioContext for playback
            const audioContext = new AudioContext();
            audioContext.decodeAudioData(
                recording,
                (buffer) => {
                    const source = audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(audioContext.destination);

                    source.onended = () => {
                        if (onEnded) onEnded(); // Call onEnded callback when playback finishes
                    };

                    source.start();
                    if (onSuccess) onSuccess(null, source); // Pass AudioContext source
                },
                (error) => {
                    console.error("Error decoding audio data: ", error);

                    // Fallback to using Blob URL if AudioContext fails (especially for iOS)
                    const audioBlob = new Blob([recording], { type: mimeType });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);

                    audio.onended = onEnded;
                    audio.onerror = onError;

                    audio
                        .play()
                        .then(() => {
                            if (onSuccess) onSuccess(audio, null); // Pass Audio element
                        })
                        .catch((err) => {
                            console.error("Error playing audio via Blob URL: ", err);
                            if (onError) onError(err); // Call onError callback if playback fails
                        });
                }
            );
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
