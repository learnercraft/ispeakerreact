import { useEffect, useState } from "react";
import { Card, Col, Collapse, Form, Row } from "react-bootstrap";

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
    const [timerSettings, setTimerSettings] = useState(() => {
        // Check if settings exist in localStorage
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker"));

        // If timerSettings exist in localStorage, use them; otherwise use defaults
        if (savedSettings && savedSettings.timerSettings) {
            return savedSettings.timerSettings;
        }

        // Fallback to default settings if no saved settings exist
        return defaultTimerSettings;
    });

    // Automatically save settings to localStorage whenever timerSettings change
    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker")) || {};
        savedSettings.timerSettings = timerSettings; // Merge with existing settings
        localStorage.setItem("ispeaker", JSON.stringify(savedSettings)); // Save the merged object
    }, [timerSettings]);

    const handleTimerToggle = (enabled) => {
        setTimerSettings((prev) => ({
            ...prev,
            enabled,
        }));
    };

    const handleInputChange = (e, settingKey) => {
        const value = parseInt(e.target.value, 10);
        if (value >= 0 && value <= 8) {
            setTimerSettings((prev) => ({
                ...prev,
                [settingKey]: value,
            }));
        }
    };

    const exerciseNames = {
        dictation: "Dictation",
        matchup: "Match-up",
        reordering: "Reordering",
        sound_n_spelling: "Sounds and Spelling",
        sorting: "Sorting",
        odd_one_out: "Odd One Out",
        snap: "Snap!",
    };

    return (
        <div className="mt-4">
            <h4 className="mb-3">Exercise timer</h4>
            <Card>
                <Card.Body>
                    <Form.Group className="px-0 form-switch">
                        <div className="d-flex justify-content-between">
                            <Form.Label className="fw-semibold" htmlFor="enableTimer" role="button">
                                Enable timer
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

                    <p className="mb-0 small text-secondary">
                        Extra challenge by completing as many exercises as possible within the time limit.
                    </p>
                    <Collapse in={timerSettings.enabled}>
                        <div>
                            {timerSettings.enabled && (
                                <>
                                    <Row className="my-3 g-2">
                                        {Object.keys(exerciseNames).map((exercise) => (
                                            <Col key={exercise} md={4}>
                                                <Form.Group controlId={exercise}>
                                                    <Form.Label className="fw-semibold">
                                                        {exerciseNames[exercise]}
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={timerSettings[exercise]}
                                                        onChange={(e) => handleInputChange(e, exercise)}
                                                        min="0"
                                                        max="10"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        ))}
                                    </Row>
                                    <p className="mb-0 small text-secondary">
                                        Setting to 0 to disable timer for specific exercises.
                                    </p>
                                </>
                            )}
                        </div>
                    </Collapse>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ExerciseTimer;
