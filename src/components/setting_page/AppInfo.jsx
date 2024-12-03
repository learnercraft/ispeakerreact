import { useState } from "react";
import { Alert, Button, Col, Row, Spinner } from "react-bootstrap";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

const AppInfo = () => {
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertVariant, setAlertVariant] = useState("success");
    const [currentVersion, setCurrentVersion] = useState(__APP_VERSION__);

    const checkForUpdates = async () => {
        setIsLoading(true);

        if (!navigator.onLine) {
            setAlertMessage(t("alert.alertAppNoInternet"));
            setAlertVariant("warning");
            setAlertVisible(true);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(
                "https://api.github.com/repos/yllst-testing-labs/ispeakerreact/contents/package.json",
                {
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "iSpeakerReact-yllst-testing-labs",
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );

            const data = await response.json();

            // Check if html_url contains the expected URL
            if (!data.html_url || !data.html_url.startsWith("https://github.com/yllst-testing-labs/ispeakerreact/")) {
                window.electron.log("error", "The html_url is invalid or does not match the expected repository.");
                throw new Error("The html_url is invalid or does not match the expected repository.");
            }

            // GitHub returns the content in base64 encoding, so we need to decode it
            const decodedContent = JSON.parse(atob(data.content));
            const latestVersion = decodedContent.version;

            if (latestVersion !== currentVersion) {
                setAlertMessage(t("alert.appNewVersionGitHub"));
                setAlertVariant("success");
                setAlertVisible(true);
            } else {
                setAlertMessage(t("alert.appVersionLatest"));
                setAlertVariant("info");
                setAlertVisible(true);
            }
        } catch (error) {
            console.error("Failed to fetch version:", error);
            window.electron.log("error", `Failed to fetch version. ${error}`);
            setAlertMessage(t("alert.appUpdateError"));
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
        window.electron.openExternal("ms-windows-store://pdp/?productid=9NWK49GLXGFP");
    };

    return (
        <div className="mt-4">
            {alertVisible && (
                <Alert variant={alertVariant} onClose={() => setAlertVisible(false)} dismissible>
                    {alertMessage.includes("GitHub") ? (
                        <>
                            {alertMessage}{" "}
                            <Alert.Link onClick={openGithubPage}>{t("settingPage.openGitHubAlertLink")}</Alert.Link>.
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
                    {window.electron.isUwp() ? (
                        <Button onClick={openMsStore} variant="primary">
                            {t("settingPage.checkUpdateMSBtn")} <BoxArrowUpRight />
                        </Button>
                    ) : (
                        <Button onClick={checkForUpdates} variant="primary">
                            {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
                            {t("settingPage.checkUpdateBtn")}
                        </Button>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default AppInfo;
