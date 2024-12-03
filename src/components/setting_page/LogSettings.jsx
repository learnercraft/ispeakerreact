import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Dropdown, Row } from "react-bootstrap";
import { BoxArrowUpRight, Check2 } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

const LogSettings = () => {
    const { t } = useTranslation();

    const [folderPath, setFolderPath] = useState(null);

    const maxLogOptions = useMemo(
        () => [
            { value: "5", label: `5 ${t("settingPage.logSettings.numOfLogsNumLog")}`, numOfLogs: 5 },
            { value: "10", label: `10 ${t("settingPage.logSettings.numOfLogsNumLog")}`, numOfLogs: 10 },
            { value: "25", label: `25 ${t("settingPage.logSettings.numOfLogsNumLog")}`, numOfLogs: 25 },
            { value: "unlimited", label: t("settingPage.logSettings.numOfLogsUnlimited"), numOfLogs: 0 },
        ],
        [t]
    );

    const deleteLogsOptions = useMemo(
        () => [
            { value: "1", label: `1 ${t("settingPage.logSettings.deleteOldLogNumDay")}`, keepForDays: 1 },
            { value: "7", label: `7 ${t("settingPage.logSettings.deleteOldLogNumDay")}`, keepForDays: 7 },
            { value: "14", label: `14 ${t("settingPage.logSettings.deleteOldLogNumDay")}`, keepForDays: 14 },
            { value: "30", label: `30 ${t("settingPage.logSettings.deleteOldLogNumDay")}`, keepForDays: 30 },
            { value: "never", label: t("settingPage.logSettings.deleteOldLogNever"), keepForDays: 0 },
        ],
        []
    );

    // State initialization using the initial values from localStorage or defaults
    const getInitialSettings = () => {
        const storedSettings = JSON.parse(localStorage.getItem("ispeaker")) || {};
        const electronSettings = storedSettings.electronSettings || {
            numOfLogs: 10,
            keepForDays: 0,
        };

        // Find the corresponding options based on stored values
        const initialMaxLog =
            maxLogOptions.find((option) => option.numOfLogs === electronSettings.numOfLogs)?.value || "unlimited";

        const initialDeleteLog =
            deleteLogsOptions.find((option) => option.keepForDays === electronSettings.keepForDays)?.value || "never";

        return { initialMaxLog, initialDeleteLog };
    };

    const { initialMaxLog, initialDeleteLog } = getInitialSettings();
    const [maxLogWritten, setMaxLogWritten] = useState(initialMaxLog);
    const [deleteLogsOlderThan, setDeleteLogsOlderThan] = useState(initialDeleteLog);

    // Memoize the function so that it doesn't change on every render
    const handleApplySettings = useCallback(
        (maxLogWrittenValue, deleteLogsOlderThanValue) => {
            const selectedMaxLogOption = maxLogOptions.find((option) => option.value === maxLogWrittenValue);
            const selectedDeleteLogOption = deleteLogsOptions.find(
                (option) => option.value === deleteLogsOlderThanValue
            );

            const electronSettings = {
                numOfLogs: selectedMaxLogOption.numOfLogs,
                keepForDays: selectedDeleteLogOption.keepForDays,
            };

            // Save the settings into localStorage under 'ispeaker'
            const settings = JSON.parse(localStorage.getItem("ispeaker")) || {};
            settings.electronSettings = electronSettings;
            localStorage.setItem("ispeaker", JSON.stringify(settings));

            console.log("Log settings applied:", electronSettings);

            window.electron.ipcRenderer.send("update-log-settings", electronSettings);
        },
        [maxLogOptions, deleteLogsOptions]
    );

    // Automatically apply settings when maxLogWritten or deleteLogsOlderThan changes
    useEffect(() => {
        handleApplySettings(maxLogWritten, deleteLogsOlderThan);
    }, [maxLogWritten, deleteLogsOlderThan, handleApplySettings]);

    // Helper function to get the label based on the current value
    const getLabel = (options, value) => {
        const selectedOption = options.find((option) => option.value === value);
        return selectedOption ? selectedOption.label : value;
    };

    const handleOpenLogFolder = async () => {
        // Send an IPC message to open the folder and get the folder path
        const logFolder = await window.electron.ipcRenderer.invoke("open-log-folder");
        setFolderPath(logFolder); // Save the folder path in state
    };

    return (
        <>
            <h4>{t("settingPage.logSettings.logSettingsHeading")}</h4>
            <p className="small text-secondary-emphasis">{t("settingPage.logSettings.logSettingsDescription")}</p>

            <Card>
                <Card.Body>
                    <Row>
                        <Col xs="auto" className="d-flex align-items-center fw-semibold">
                            <label htmlFor="logNumber">{t("settingPage.logSettings.numOfLogsOption")}</label>
                        </Col>
                        <Col xs="auto" className="ms-auto">
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="none"
                                    id="dropdown-selected"
                                    style={{
                                        "--bs-btn-border-color": "var(--bs-body-color)",
                                        "--bs-btn-hover-border-color": "var(--bs-secondary-color)",
                                    }}>
                                    {getLabel(maxLogOptions, maxLogWritten)}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {maxLogOptions.map((option) => (
                                        <Dropdown.Item
                                            key={option.value}
                                            onClick={() => setMaxLogWritten(option.value)}
                                            active={maxLogWritten === option.value}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <span>{option.label}</span>
                                                {maxLogWritten === option.value && <Check2 />}
                                            </div>
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="my-3">
                <Card.Body>
                    <Row>
                        <Col xs="auto" className="d-flex align-items-center fw-semibold">
                            <label htmlFor="deleteLogs">{t("settingPage.logSettings.deleteOldLogsOption")}</label>
                        </Col>
                        <Col xs="auto" className="ms-auto">
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="none"
                                    id="dropdown-delete-logs"
                                    style={{
                                        "--bs-btn-border-color": "var(--bs-body-color)",
                                        "--bs-btn-hover-border-color": "var(--bs-secondary-color)",
                                    }}>
                                    {getLabel(deleteLogsOptions, deleteLogsOlderThan)}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {deleteLogsOptions.map((option) => (
                                        <Dropdown.Item
                                            key={option.value}
                                            onClick={() => setDeleteLogsOlderThan(option.value)}
                                            active={deleteLogsOlderThan === option.value}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <span>{option.label}</span>
                                                {deleteLogsOlderThan === option.value && <Check2 />}
                                            </div>
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="mt-3 mb-4">
                <Card.Body>
                    <Row>
                        <Col xs="auto" className="d-flex align-items-center">
                            <Button
                                variant="link"
                                className="text-start fw-semibold p-0 link-underline link-underline-opacity-0 stretched-link text-reset"
                                onClick={handleOpenLogFolder}>
                                {t("settingPage.logSettings.openLogBtn")}
                            </Button>
                        </Col>
                        <Col xs="auto" className="d-flex ms-auto align-items-center justify-content-center">
                            <BoxArrowUpRight />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
};

export default LogSettings;
