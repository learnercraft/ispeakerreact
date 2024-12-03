import { useContext } from "react";
import { Card, Col, Dropdown, Form, Row } from "react-bootstrap";
import { Check2 } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../../utils/ThemeProvider";

const AppearanceSettings = () => {
    const { t } = useTranslation();

    const { theme, setTheme, showToggleButton, setShowToggleButton } = useContext(ThemeContext);
    // Function to handle theme change
    const handleThemeSelect = (selectedTheme) => {
        setTheme(selectedTheme);
    };

    // Function to handle the visibility of the "Toggle theme" button
    const handleToggleButtonVisibility = (e) => {
        setShowToggleButton(e.target.checked);
    };

    function getThemeOptionLabel(theme) {
        switch (theme) {
            case "auto":
                return t("settingPage.appearanceSettings.themeAuto");
            case "light":
                return t("settingPage.appearanceSettings.themeLight");
            default:
                return t("settingPage.appearanceSettings.themeDark");
        }
    }

    return (
        <>
            <h4 className="mb-3">{t("settingPage.appearanceSettings.appearanceHeading")}</h4>

            <Card>
                <Card.Body>
                    <Row>
                        <Col xs={2} className="d-flex align-items-center fw-semibold">
                            <label htmlFor="themeSelect">{t("settingPage.appearanceSettings.themeOption")}</label>
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
                                    {getThemeOptionLabel(theme)}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item
                                        onClick={() => handleThemeSelect("light")}
                                        active={theme === "light"}>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>{t("settingPage.appearanceSettings.themeLight")}</span>
                                            {theme === "light" && <Check2 />}
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleThemeSelect("dark")} active={theme === "dark"}>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>{t("settingPage.appearanceSettings.themeDark")}</span>
                                            {theme === "dark" && <Check2 />}
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleThemeSelect("auto")} active={theme === "auto"}>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>{t("settingPage.appearanceSettings.themeAuto")}</span>
                                            {theme === "auto" && <Check2 className="ms-2" />}
                                        </div>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="mt-4 mb-4">
                <Card.Body>
                    <Form.Group className="px-0 form-switch">
                        <div className="d-flex justify-content-between align-items-center">
                            <Form.Label className="fw-semibold mb-0" htmlFor="toggleThemeButton" role="button">
                                {t("settingPage.appearanceSettings.themeToggleOption")}
                            </Form.Label>
                            <Form.Control
                                className="form-check-input"
                                type="checkbox"
                                id="toggleThemeButton"
                                checked={showToggleButton}
                                onChange={handleToggleButtonVisibility}
                                style={{ width: "3rem", height: "1.5rem", marginTop: "0" }}
                            />
                        </div>
                    </Form.Group>
                </Card.Body>
            </Card>
        </>
    );
};

export default AppearanceSettings;
