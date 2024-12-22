import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isElectron } from "../../utils/isElectron";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast";

const ResetSettings = () => {
    const { t } = useTranslation();

    const [isResettingLocalStorage, setIsResettingLocalStorage] = useState(false);
    const [isResettingIndexedDb, setIsResettingIndexedDb] = useState(false);

    const localStorageModal = useRef(null);
    const indexedDbModal = useRef(null);

    const checkAndCloseDatabase = async (dbName) => {
        // Check if the database exists
        const databases = await window.indexedDB.databases();
        const exists = databases.some((db) => db.name === dbName);

        if (!exists) {
            return false; // Database does not exist
        }

        // If it exists, open and close the database
        return new Promise((resolve) => {
            const dbRequest = window.indexedDB.open(dbName);
            dbRequest.onsuccess = (event) => {
                const db = event.target.result;
                db.close();
                resolve(true); // Database exists and is closed
            };
            dbRequest.onerror = () => {
                resolve(false); // Database exists but couldn't be opened
            };
        });
    };

    const resetLocalStorage = () => {
        setIsResettingLocalStorage(true);

        checkAndCloseDatabase("CacheDatabase").then(() => {
            const deleteRequest = window.indexedDB.deleteDatabase("CacheDatabase");
            deleteRequest.onsuccess = () => {
                localStorage.clear();
                setIsResettingLocalStorage(false);
                localStorageModal.current?.close();
                window.location.reload();
                sonnerSuccessToast(t("settingPage.changeSaved"));
            };
            deleteRequest.onerror = () => setIsResettingLocalStorage(false);
            deleteRequest.onblocked = () => setIsResettingLocalStorage(false);
        });
    };

    const resetIndexedDb = async () => {
        setIsResettingIndexedDb(true);

        // Check if the database exists
        const exists = await checkAndCloseDatabase("iSpeaker_data");

        if (!exists) {
            console.log("Database does not exist");
            setIsResettingIndexedDb(false);
            indexedDbModal.current?.close();
            sonnerSuccessToast(t("settingPage.noDataToDelete"));
            return; // Exit early
        }

        console.log("Database exists, proceeding to delete...");

        // Proceed to delete the database
        const deleteRequest = window.indexedDB.deleteDatabase("iSpeaker_data");

        deleteRequest.onsuccess = async () => {
            console.log("Database deleted successfully");
            setIsResettingIndexedDb(false);
            indexedDbModal.current?.close();
        };

        deleteRequest.onerror = () => {
            console.error("Error deleting database");
            setIsResettingIndexedDb(false);
            indexedDbModal.current?.close();
        };

        deleteRequest.onblocked = () => {
            console.warn("Database deletion is blocked");
            setIsResettingIndexedDb(false);
            indexedDbModal.current?.close();
            window.location.reload(); // Reload the page to close the database
        };
    };

    return (
        <>
            <div className="flex flex-wrap gap-x-8 gap-y-6 md:flex-nowrap">
                <div className="basis-1/2 space-y-1">
                    <p className="text-base font-semibold">
                        {t("settingPage.resetSettings.resetHeading")}
                    </p>
                </div>
                <div className="flex flex-grow basis-1/2 justify-end">
                    <div>
                        <button
                            type="button"
                            className="btn btn-error"
                            onClick={() => localStorageModal.current?.showModal()}
                            disabled={isResettingLocalStorage}
                        >
                            {isResettingLocalStorage && (
                                <span className="loading loading-spinner loading-md"></span>
                            )}
                            {t("settingPage.resetSettings.resetSettingsData")}
                        </button>

                        {!isElectron() && (
                            <button
                                type="button"
                                className="btn btn-error mt-4"
                                onClick={() => indexedDbModal.current?.showModal()}
                                disabled={isResettingIndexedDb}
                            >
                                {isResettingIndexedDb && (
                                    <span className="loading loading-spinner loading-md"></span>
                                )}
                                {t("settingPage.resetSettings.deleteRecordingData")}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* LocalStorage Modal */}
            <dialog ref={localStorageModal} className="modal">
                <form method="dialog" className="modal-box">
                    <h3 className="text-lg font-bold">
                        {t("settingPage.resetSettings.resetModalHeading")}
                    </h3>
                    <p className="py-4">
                        {t("settingPage.resetSettings.deleteRecordingDataModalMessage")}
                    </p>
                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={() => localStorageModal.current?.close()}
                            disabled={isResettingLocalStorage}
                        >
                            {t("settingPage.exerciseSettings.cancelBtn")}
                        </button>
                        <button
                            type="button"
                            className="btn btn-error"
                            onClick={resetLocalStorage}
                            disabled={isResettingLocalStorage}
                        >
                            {isResettingLocalStorage && (
                                <span className="loading loading-spinner loading-md"></span>
                            )}
                            {t("settingPage.resetSettings.resetConfirmBtn")}
                        </button>
                    </div>
                </form>
            </dialog>

            {/* IndexedDB Modal */}
            {!isElectron() && (
                <dialog ref={indexedDbModal} className="modal">
                    <form method="dialog" className="modal-box">
                        <h3 className="text-lg font-bold">
                            {t("settingPage.resetSettings.resetModalHeading")}
                        </h3>
                        <p className="py-4">
                            {t("settingPage.resetSettings.deleteRecordingDataModalMessage")}
                        </p>
                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => indexedDbModal.current?.close()}
                                disabled={isResettingIndexedDb}
                            >
                                {t("settingPage.exerciseSettings.cancelBtn")}
                            </button>
                            <button
                                type="button"
                                className="btn btn-error"
                                onClick={resetIndexedDb}
                                disabled={isResettingIndexedDb}
                            >
                                {isResettingIndexedDb && (
                                    <span className="loading loading-spinner loading-md"></span>
                                )}
                                {t("settingPage.resetSettings.resetConfirmBtn")}
                            </button>
                        </div>
                    </form>
                </dialog>
            )}
        </>
    );
};

export default ResetSettings;
