import Dexie from "dexie";

// Extend Dexie to declare the HashCache, CachedAudioFiles, and CachedJsonFiles tables
class CacheDatabase extends Dexie {
    constructor() {
        super("CacheDatabase");
        this.version(1).stores({
            HashCache: "type", // 'type' (menu or audio) will be the primary key
            CachedJsonFiles: "fileName", // 'fileName' is the primary key for cached JSON files
        });
    }
}

// Initialize Dexie database
const db = new CacheDatabase();

// Function to save the downloaded file to IndexedDB
// We now separate saving logic for audio and JSON files
export const saveFileToIndexedDB = async (fileName, fileContent, fileType) => {
    try {
        if (fileType === "json") {
            await db.CachedJsonFiles.put({
                fileName, // Store file name
                fileContent, // Store the file content (JSON as a Blob or string)
            });
            console.log(`${fileName} saved to IndexedDB in CachedJsonFiles table`);
        }
    } catch (error) {
        console.error(`Error saving ${fileName} to IndexedDB:`, error);
    }
};

// Function to retrieve cached file from IndexedDB
// Separate retrieval for audio and JSON files
export const getFileFromIndexedDB = async (fileName, fileType) => {
    try {
        let file = null;
        if (fileType === "json") {
            file = await db.CachedJsonFiles.get(fileName);
        }
        return file ? file.fileContent : null;
    } catch (error) {
        console.error(`Error retrieving ${fileName} from IndexedDB:`, error);
        return null;
    }
};

// Function to save the hash JSON to IndexedDB
export const saveHashJsonToIndexedDB = async (type, hashJson) => {
    try {
        await db.HashCache.put({ type, hashJson });
        console.log(`${type} hash file saved to IndexedDB`);
    } catch (error) {
        console.error(`Error saving ${type} hash file to IndexedDB:`, error);
    }
};

// Function to retrieve hash JSON from IndexedDB
export const getHashJsonFromIndexedDB = async (type) => {
    try {
        const hashData = await db.HashCache.get(type);
        return hashData ? hashData.hashJson : null;
    } catch (error) {
        console.error(`Error retrieving ${type} hash file from IndexedDB:`, error);
        return null;
    }
};

// Function to delete all cached JSON files from IndexedDB
export const deleteCachedJsonFiles = async () => {
    try {
        // Clear all entries in the CachedJsonFiles table
        await db.CachedJsonFiles.clear();
        console.log("All JSON files deleted from IndexedDB CachedJsonFiles table");
    } catch (error) {
        console.error("Error deleting JSON files from IndexedDB:", error);
    }
};
