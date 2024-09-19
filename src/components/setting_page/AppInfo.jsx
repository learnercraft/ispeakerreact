import { useState } from "react";
import { Alert, Button, Col, Row, Spinner } from "react-bootstrap";

const AppInfo = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertVariant, setAlertVariant] = useState("success");
    const [currentVersion, setCurrentVersion] = useState(__APP_VERSION__);

    const checkForUpdates = async () => {
        setIsLoading(true);

        if (!navigator.onLine) {
            setAlertMessage("No internet connection. Please check your connection and try again.");
            setAlertVariant("warning");
            setAlertVisible(true);
            setIsLoading(false);
            return;
        }

        try {
            // Replace with your real GitHub API endpoint or raw package.json link
            const response = await fetch("https://api.github.com/repos/yell0wsuit/ispeaker/contents/package.json", {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "iSpeakerReact-yell0wsuit",
                    Accept: "application/vnd.github.v3+json",
                },
            });

            const data = await response.json();

            // Check if html_url contains the expected URL
            if (!data.html_url || !data.html_url.startsWith("https://github.com/yell0wsuit/ispeaker/")) {
                throw new Error("The html_url is invalid or does not match the expected repository.");
            }

            // GitHub returns the content in base64 encoding, so we need to decode it
            const decodedContent = JSON.parse(atob(data.content));
            const latestVersion = decodedContent.version;

            if (latestVersion !== currentVersion) {
                const updateMessage = window.electron.isUwp()
                    ? "A new version is available. Open the Microsoft Store app to update this app."
                    : "A new update is found. Go to the project's GitHub page for more information.";
                setAlertMessage(updateMessage);
                setAlertVariant("success");
                setAlertVisible(true);
            } else {
                setAlertMessage("You are already using the latest version.");
                setAlertVariant("info");
                setAlertVisible(true);
            }
        } catch (error) {
            console.error("Failed to fetch version:", error);
            window.electron.log("Failed to fetch version:", error);
            setAlertMessage("Error checking for updates.");
            setAlertVariant("danger");
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    const openGithubPage = () => {
        window.electron.openExternal("https://github.com/yell0wsuit/ispeaker/releases/latest");
    };

    const openMsStore = () => {
        window.electron.openExternal("ms-windows-store://home");
    };

    return (
        <div className="mt-4">
            {alertVisible && (
                <Alert variant={alertVariant} onClose={() => setAlertVisible(false)} dismissible>
                    {window.electron.isUwp() ? (
                        alertMessage.includes("Microsoft Store") ? (
                            <>
                                {alertMessage} <Alert.Link onClick={openMsStore}>Open Microsoft Store</Alert.Link>.
                            </>
                        ) : (
                            { alertMessage }
                        )
                    ) : alertMessage.includes("GitHub") ? (
                        <>
                            {alertMessage} <Alert.Link onClick={openGithubPage}>Open GitHub</Alert.Link>.
                        </>
                    ) : (
                        alertMessage
                    )}
                </Alert>
            )}
            <Row className="mb-3">
                <Col xs="auto" className="d-flex align-items-center justify-content-center">
                    <img
                        className="img-fluid"
                        src={`${import.meta.env.BASE_URL}images/icons/windows11/StoreLogo.scale-200.png`}
                        alt="App logo"
                    />
                </Col>
                <Col xs="auto" className="align-self-center h-100">
                    <h4 className="fw-semibold mb-2">iSpeakerReact</h4>
                    <p className="text-body-secondary mb-2">Version {currentVersion}</p>
                    <Button onClick={checkForUpdates} variant="primary">
                        {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
                        Check for new updates
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default AppInfo;
