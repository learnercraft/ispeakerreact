import { useEffect, useState } from "react";
import { Card, Form, Spinner } from "react-bootstrap";
import {
    deleteCachedJsonFiles,
    getFileFromIndexedDB,
    getHashJsonFromIndexedDB,
    saveFileToIndexedDB,
    saveHashJsonToIndexedDB,
} from "./offlineStorageDb";

const CachingSettings = () => {
    const [cacheMenuFiles, setCacheMenuFiles] = useState(false);
    const [menuErrorText, setMenuErrorText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // URLs for JSON files
    const jsonUrl = `${import.meta.env.BASE_URL}json/json_file_hashes.json`;

    // Initialize localStorage if necessary
    const initializeLocalStorage = () => {
        let ispeaker = JSON.parse(localStorage.getItem("ispeaker"));
        if (!ispeaker) {
            ispeaker = {
                webOptions: {
                    cachedJsons: false,
                },
            };
            localStorage.setItem("ispeaker", JSON.stringify(ispeaker));
        } else if (!ispeaker.webOptions) {
            ispeaker.webOptions = {
                cachedJsons: false,
            };
            localStorage.setItem("ispeaker", JSON.stringify(ispeaker));
        }
        return ispeaker;
    };

    // Check if JSON files are cached
    const areFilesCached = async () => {
        const hashJson = await getHashJsonFromIndexedDB("json");
        if (!hashJson) return false;

        const cachedFiles = await Promise.all(
            hashJson.map(async (fileObj) => {
                const cachedFile = await getFileFromIndexedDB(fileObj.file, "json");
                return cachedFile !== null;
            })
        );

        return cachedFiles.every(Boolean); // True if all files are cached
    };

    // Sync with localStorage and IndexedDB when component mounts
    useEffect(() => {
        const syncWithStorageAndIndexedDB = async () => {
            const ispeaker = initializeLocalStorage();
            const cachedJsonFiles = await areFilesCached();

            setCacheMenuFiles(cachedJsonFiles);
            ispeaker.webOptions.cachedJsons = cachedJsonFiles;
            localStorage.setItem("ispeaker", JSON.stringify(ispeaker));
        };

        syncWithStorageAndIndexedDB();
    }, []);

    // Handle toggling JSON caching
    const handleCacheToggle = async () => {
        setIsProcessing(true);

        if (cacheMenuFiles) {
            // Toggling off: Delete cached JSON files
            await deleteCachedJsonFiles();
            setCacheMenuFiles(false);
            updateLocalStorage(false);
        } else {
            // Toggling on: Download and cache JSON files
            try {
                const downloadedHashJson = await downloadHashJson(jsonUrl);
                if (!downloadedHashJson) {
                    setMenuErrorText("Failed to download menu files.");
                    setIsProcessing(false);
                    return;
                }

                await saveHashJsonToIndexedDB("json", downloadedHashJson);
                await downloadAndCacheFiles(downloadedHashJson);
                setCacheMenuFiles(true);
                updateLocalStorage(true);
            } catch (error) {
                console.error("Error caching files:", error);
                setMenuErrorText("Error downloading or caching files.");
            }
        }

        setIsProcessing(false);
    };

    // Update localStorage based on cache state
    const updateLocalStorage = (isCached) => {
        let ispeaker = initializeLocalStorage();
        ispeaker.webOptions.cachedJsons = isCached;
        localStorage.setItem("ispeaker", JSON.stringify(ispeaker));
    };

    // Download the hash JSON file
    const downloadHashJson = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to download hash JSON");
            return await response.json();
        } catch (error) {
            console.error("Error downloading hash JSON:", error);
            return null;
        }
    };

    // Download and cache JSON files
    const downloadAndCacheFiles = async (hashJson) => {
        for (const fileObj of hashJson) {
            const fileUrl = `${import.meta.env.BASE_URL}json/${fileObj.file}`;

            try {
                const response = await fetch(fileUrl);
                const fileContent = await response.blob();
                await saveFileToIndexedDB(fileObj.file, fileContent, "json");
            } catch (error) {
                console.error(`Error downloading file: ${fileObj.file}`, error);
                throw error;
            }
        }
    };

    return (
        <div>
            <h4>Caching settings</h4>
            <Card className="mt-4 mb-4">
                <Card.Body>
                    <Form.Group className="px-0 form-switch">
                        <div className="d-flex justify-content-between align-items-center">
                            <Form.Label className="fw-semibold mb-0 col-10" htmlFor="cacheJson" role="button">
                                Cache menu files for faster loading
                            </Form.Label>
                            {isProcessing ? (
                                <Spinner
                                    animation="border"
                                    style={{ width: "1.5rem", height: "1.5rem", marginTop: "0" }}
                                />
                            ) : (
                                <Form.Control
                                    className="form-check-input"
                                    type="checkbox"
                                    id="cacheJson"
                                    checked={cacheMenuFiles}
                                    onChange={handleCacheToggle}
                                    disabled={isProcessing}
                                    style={{ width: "3rem", height: "1.5rem", marginTop: "0" }}
                                />
                            )}
                        </div>
                    </Form.Group>
                    {menuErrorText && <p className="small text-danger mb-0">{menuErrorText}</p>}
                </Card.Body>
            </Card>
        </div>
    );
};

export default CachingSettings;
