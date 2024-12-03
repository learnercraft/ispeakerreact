import { useEffect, useState } from "react";
import { Button, Card, Col, Collapse, Form, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const defaultTimerSettings = {
    enabled: false,
    dictation: 5,
    matchup: 5,
    reordering: 5,
    sound_n_spelling: 5,
    sorting: 5,
    odd_one_out: 5,
    snap: 5,
};

const ExerciseTimer = () => {
    const { t } = useTranslation();

    const [timerSettings, setTimerSettings] = useState(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker"));
        if (savedSettings && savedSettings.timerSettings) {
            return savedSettings.timerSettings;
        }
        return defaultTimerSettings;
    });

    const [collapseOpen, setCollapseOpen] = useState(timerSettings.enabled);
    const [tempSettings, setTempSettings] = useState(timerSettings);
    const [isValid, setIsValid] = useState(true);
    const [isModified, setIsModified] = useState(false);

    // Automatically save settings to localStorage whenever timerSettings change
    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker")) || {};
        savedSettings.timerSettings = timerSettings;
        localStorage.setItem("ispeaker", JSON.stringify(savedSettings));
    }, [timerSettings]);

    const handleTimerToggle = (enabled) => {
        setTimerSettings((prev) => ({
            ...prev,
            enabled,
        }));
        setCollapseOpen(enabled);
    };

    // Validation function to check if the inputs are valid (0-10 numbers only)
    const validateInputs = (settings) => {
        return Object.values(settings).every((value) => value !== "" && !isNaN(value) && value >= 0 && value <= 10);
    };

    const checkIfModified = (settings) => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker"))?.timerSettings || defaultTimerSettings;
        return JSON.stringify(settings) !== JSON.stringify(savedSettings);
    };

    const handleInputChange = (e, settingKey) => {
        const { value } = e.target;
        if (/^\d*$/.test(value) && value.length <= 2) {
            const numValue = value === "" ? "" : parseInt(value, 10);
            setTempSettings((prev) => ({
                ...prev,
                [settingKey]: numValue,
            }));
        }
    };

    const handleApply = (e) => {
        e.preventDefault();

        if (validateInputs(tempSettings)) {
            setTimerSettings(tempSettings);
            setIsModified(false); // Reset modified state after apply
        }
    };

    const handleCancel = () => {
        setTempSettings(timerSettings); // revert to original settings
        setIsModified(false); // Reset modified state
    };

    // Update validity and modified state when temporary settings change
    useEffect(() => {
        setIsValid(validateInputs(tempSettings));
        setIsModified(checkIfModified(tempSettings)); // Check if values differ from localStorage or defaults
    }, [tempSettings]);

    const exerciseNames = {
        dictation: t("exercise_page.dictationHeading"),
        matchup: t("exercise_page.matchUpHeading"),
        reordering: t("exercise_page.reorderingHeading"),
        sound_n_spelling: t("exercise_page.soundSpellingHeading"),
        sorting: t("exercise_page.sortingHeading"),
        odd_one_out: t("exercise_page.oddOneOutHeading"),
        snap: t("exercise_page.snapHeading"),
    };

    return (
        <div className="mt-4">
            <h4 className="mb-3">{t("settingPage.exerciseSettings.timerHeading")}</h4>
            <Card>
                <Card.Body>
                    <Form.Group className="px-0 form-switch">
                        <div className="d-flex justify-content-between">
                            <Form.Label className="fw-semibold" htmlFor="enableTimer" role="button">
                                {t("settingPage.exerciseSettings.timerOption")}
                            </Form.Label>
                            <Form.Control
                                className="form-check-input"
                                type="checkbox"
                                id="enableTimer"
                                checked={timerSettings.enabled}
                                onChange={(e) => handleTimerToggle(e.target.checked)}
                                style={{ width: "3rem", height: "1.5rem", marginTop: "0" }}
                            />
                        </div>
                    </Form.Group>

                    <p className="mb-0 small text-secondary-emphasis">
                        {t("settingPage.exerciseSettings.timerDescription")}
                    </p>
                    <Collapse in={collapseOpen}>
                        <div>
                            <Form onSubmit={handleApply}>
                                <Row className="my-3 g-2">
                                    {Object.keys(exerciseNames).map((exercise) => (
                                        <Col key={exercise} md={4}>
                                            <Form.Group controlId={exercise}>
                                                <Form.Label className="fw-semibold">
                                                    {exerciseNames[exercise]}
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={tempSettings[exercise]}
                                                    onChange={(e) => handleInputChange(e, exercise)}
                                                    maxLength={2}
                                                    isInvalid={
                                                        tempSettings[exercise] === "" ||
                                                        tempSettings[exercise] < 0 ||
                                                        tempSettings[exercise] > 10
                                                    }
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {t("settingPage.exerciseSettings.textboxError")}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    ))}
                                </Row>

                                <p className="mb-4 small text-secondary-emphasis">
                                    {t("settingPage.exerciseSettings.hint")}
                                </p>
                                <div className="d-flex justify-content-end">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-25 me-2"
                                        onClick={handleApply}
                                        disabled={!isValid || !isModified}>
                                        {t("settingPage.exerciseSettings.applyBtn")}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-25"
                                        onClick={handleCancel}
                                        disabled={!isModified}>
                                        {t("settingPage.exerciseSettings.cancelBtn")}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </Collapse>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ExerciseTimer;
