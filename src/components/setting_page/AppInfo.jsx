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
                setAlertMessage("A new update is found. Go to the project's GitHub page for more information.");
                setAlertVariant("success");
                setAlertVisible(true);
            } else {
                setAlertMessage("You are already using the latest version.");
                setAlertVariant("info");
                setAlertVisible(true);
            }
        } catch (error) {
            console.error("Failed to fetch version:", error);
            setAlertMessage("Error checking for updates.");
            setAlertVariant("danger");
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    const openGithubPage = () => {
        window.electron.openExternal("https://github.com/yell0wsuit/ispeaker"); // Use the API exposed in preload
    };

    return (
        <div className="mt-4">
            {alertVisible && (
                <Alert variant={alertVariant} onClose={() => setAlertVisible(false)} dismissible>
                    {alertMessage.includes("GitHub") ? (
                        <>
                            {alertMessage} <Alert.Link onClick={openGithubPage}>Open GitHub</Alert.Link>.
                        </>
                    ) : (
                        alertMessage
                    )}
                </Alert>
            )}
            <Row className="mb-3">
                <Col xs="auto">
                    <img
                        className="img-fluid"
                        src={`${import.meta.env.BASE_URL}images/icons/windows11/StoreLogo.scale-200.png`}
                        alt="App logo"
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    <h4 className="fw-semibold">iSpeakerReact</h4>
                    <p className="text-body-secondary mb-1">Version {currentVersion}</p>
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
