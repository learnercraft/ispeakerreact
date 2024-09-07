import { useContext } from "react";
import { Card, Col, Dropdown, Form, Row } from "react-bootstrap";
import { ThemeContext } from "../../utils/ThemeProvider";

const AppearanceSettings = () => {
    const { theme, setTheme, showToggleButton, setShowToggleButton } = useContext(ThemeContext);
    // Function to handle theme change
    const handleThemeSelect = (selectedTheme) => {
        setTheme(selectedTheme);
    };

    // Function to handle the visibility of the "Toggle theme" button
    const handleToggleButtonVisibility = (e) => {
        setShowToggleButton(e.target.checked);
    };

    return (
        <>
            <h4 className="mb-3">Appearance</h4>

            <Card>
                <Card.Body>
                    <Row>
                        <Col xs={2} className="d-flex align-items-center fw-semibold">
                            <label htmlFor="themeSelect">Theme</label>
                        </Col>
                        <Col xs="auto" className="ms-auto">
                            <Dropdown>
                                <Dropdown.Toggle variant="outline-secondary" id="dropdown-selected">
                                    {theme === "auto"
                                        ? "Follow OS theme"
                                        : theme.charAt(0).toUpperCase() + theme.slice(1)}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleThemeSelect("light")}>Light</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleThemeSelect("dark")}>Dark</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleThemeSelect("auto")}>
                                        Follow OS theme
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
                        <div className="d-flex justify-content-between">
                            <Form.Label className="fw-semibold mb-0" htmlFor="toggleThemeButton" role="button">
                                Show 'Toggle theme' button
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
