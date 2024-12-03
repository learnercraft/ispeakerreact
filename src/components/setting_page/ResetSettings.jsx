import { useState } from "react";
import { Button, Card, Col, Modal, Row, Spinner } from "react-bootstrap";
import { ChevronRight } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { isElectron } from "../../utils/isElectron";

const ResetSettings = ({ onReset }) => {
    const { t } = useTranslation();

    const [showLocalStorageModal, setShowLocalStorageModal] = useState(false);
    const [showIndexedDbModal, setShowIndexedDbModal] = useState(false);
    const [isResettingLocalStorage, setIsResettingLocalStorage] = useState(false);
    const [isResettingIndexedDb, setIsResettingIndexedDb] = useState(false);

    const handleShowLocalStorage = () => setShowLocalStorageModal(true);
    const handleCloseLocalStorage = () => setShowLocalStorageModal(false);

    const handleShowIndexedDb = () => setShowIndexedDbModal(true);
    const handleCloseIndexedDb = () => setShowIndexedDbModal(false);

    const resetLocalStorage = () => {
        setIsResettingLocalStorage(true); // Show spinner and disable button

        // Close connections to "CacheDatabase" before deleting
        const closeDatabaseConnections = (dbName) => {
            return new Promise((resolve) => {
                const dbRequest = window.indexedDB.open(dbName);
                dbRequest.onsuccess = (event) => {
                    const db = event.target.result;
                    db.close(); // Close the connection
                    console.log(`${dbName} database connection closed.`);
                    resolve();
                };
                dbRequest.onerror = () => {
                    resolve(); // Resolve even on error
                };
            });
        };

        // Close "CacheDatabase" connections and then delete the database
        closeDatabaseConnections("CacheDatabase").then(() => {
            const deleteRequest = window.indexedDB.deleteDatabase("CacheDatabase");
            deleteRequest.onsuccess = () => {
                console.log("CacheDatabase deleted successfully.");

                // Clear localStorage after IndexedDB is cleared
                localStorage.clear();

                setIsResettingLocalStorage(false);
                handleCloseLocalStorage(); // Close the modal after reset
                onReset(); // Call onReset to remount the CachingSettings component
            };
            deleteRequest.onerror = (event) => {
                console.log("Error deleting CacheDatabase:", event);
                setIsResettingLocalStorage(false);
            };
            deleteRequest.onblocked = () => {
                console.log("Delete request for CacheDatabase blocked.");
                setIsResettingLocalStorage(false);
            };
        });
    };

    const resetIndexedDb = () => {
        setIsResettingIndexedDb(true); // Show spinner and disable button

        // Close connections to "iSpeaker_data" before deleting
        const closeDatabaseConnections = (dbName) => {
            return new Promise((resolve) => {
                const dbRequest = window.indexedDB.open(dbName);
                dbRequest.onsuccess = (event) => {
                    const db = event.target.result;
                    db.close(); // Close the connection
                    console.log(`${dbName} database connection closed.`);
                    resolve();
                };
                dbRequest.onerror = () => {
                    resolve(); // Resolve even on error
                };
            });
        };

        // Close "iSpeaker_data" connections and then delete the database
        closeDatabaseConnections("iSpeaker_data").then(() => {
            const deleteRequest = window.indexedDB.deleteDatabase("iSpeaker_data");
            deleteRequest.onsuccess = () => {
                console.log("iSpeaker_data deleted successfully.");

                setIsResettingIndexedDb(false);
                handleCloseIndexedDb(); // Close the modal after reset
            };
            deleteRequest.onerror = (event) => {
                console.log("Error deleting iSpeaker_data:", event);
                setIsResettingIndexedDb(false);
            };
            deleteRequest.onblocked = () => {
                console.log("Delete request for iSpeaker_data blocked.");
                setIsResettingIndexedDb(false);
            };
        });
    };

    return (
        <>
            <div className="mt-4">
                <h4 className="mb-3">{t("settingPage.resetSettings.resetHeading")}</h4>
                <Card className="mt-3">
                    <Card.Body>
                        <Row>
                            <Col xs={10} className="d-flex align-items-center">
                                <Button
                                    variant="link"
                                    className="text-start fw-semibold p-0 link-underline link-underline-opacity-0 stretched-link text-reset"
                                    onClick={handleShowLocalStorage}
                                    disabled={isResettingLocalStorage}>
                                    {isResettingLocalStorage ? (
                                        <Spinner animation="border" size="sm" style={{ marginRight: "0.5rem" }} />
                                    ) : null}
                                    {t("settingPage.resetSettings.resetSettingsData")}
                                </Button>
                            </Col>
                            <Col xs="auto" className="d-flex ms-auto align-items-center justify-content-center">
                                <ChevronRight />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {!isElectron() && (
                    <Card className="mt-3">
                        <Card.Body>
                            <Row>
                                <Col xs="auto" className="d-flex align-items-center">
                                    <Button
                                        variant="link"
                                        className="text-start fw-semibold p-0 link-underline link-underline-opacity-0 stretched-link text-reset"
                                        onClick={handleShowIndexedDb}
                                        disabled={isResettingIndexedDb}>
                                        {isResettingIndexedDb ? (
                                            <Spinner animation="border" size="sm" style={{ marginRight: "0.5rem" }} />
                                        ) : null}
                                        {t("settingPage.resetSettings.deleteRecordingData")}
                                    </Button>
                                </Col>
                                <Col xs="auto" className="d-flex ms-auto align-items-center justify-content-center">
                                    <ChevronRight />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                )}
            </div>

            {/* Modal for resetting localStorage */}
            <Modal
                show={showLocalStorageModal}
                onHide={!isResettingLocalStorage ? handleCloseLocalStorage : null} // Disable close button during reset
                backdrop={isResettingLocalStorage ? "static" : true}
                keyboard={!isResettingLocalStorage} // Disable keyboard close (Esc) during reset
            >
                <Modal.Header closeButton={!isResettingLocalStorage}>
                    <Modal.Title>{t("settingPage.resetSettings.resetModalHeading")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{t("settingPage.resetSettings.deleteRecordingDataModalMessage")}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseLocalStorage} disabled={isResettingLocalStorage}>
                        {t("settingPage.exerciseSettings.cancelBtn")}
                    </Button>
                    <Button variant="danger" onClick={resetLocalStorage} disabled={isResettingLocalStorage}>
                        {isResettingLocalStorage ? (
                            <Spinner animation="border" size="sm" style={{ marginRight: "0.5rem" }} />
                        ) : null}
                        {t("settingPage.resetSettings.resetConfirmBtn")}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for resetting IndexedDB */}
            {!isElectron() && (
                <Modal
                    show={showIndexedDbModal}
                    onHide={!isResettingIndexedDb ? handleCloseIndexedDb : null} // Disable close button during reset
                    backdrop={isResettingIndexedDb ? "static" : true}
                    keyboard={!isResettingIndexedDb} // Disable keyboard close (Esc) during reset
                >
                    <Modal.Header closeButton={!isResettingIndexedDb}>
                        <Modal.Title>{t("settingPage.resetSettings.resetModalHeading")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{t("settingPage.resetSettings.deleteRecordingDataModalMessage")}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseIndexedDb} disabled={isResettingIndexedDb}>
                            {t("settingPage.exerciseSettings.cancelBtn")}
                        </Button>
                        <Button variant="danger" onClick={resetIndexedDb} disabled={isResettingIndexedDb}>
                            {isResettingIndexedDb ? (
                                <Spinner animation="border" size="sm" style={{ marginRight: "0.5rem" }} />
                            ) : null}
                            {t("settingPage.resetSettings.resetConfirmBtn")}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default ResetSettings;
