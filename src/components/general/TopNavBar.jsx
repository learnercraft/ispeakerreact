import { useContext, useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { CardChecklist, ChatDots, ClipboardCheck, House, Mic, Gear } from "react-bootstrap-icons";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../../utils/ThemeProvider";

const TopNavBar = () => {
    const { theme } = useContext(ThemeContext);
    const [currentTheme, setCurrentTheme] = useState(theme);
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        // Function to update the logo based on the theme or system preference
        const updateTheme = () => {
            if (theme === "auto") {
                // If theme is auto, check if system prefers dark mode
                setCurrentTheme(mediaQuery.matches ? "dark" : "light");
            } else {
                setCurrentTheme(theme);
            }
        };

        // Initial check
        updateTheme();

        // Add listener for system theme changes if "auto" is selected
        mediaQuery.addEventListener("change", updateTheme);

        // Cleanup the listener on unmount
        return () => mediaQuery.removeEventListener("change", updateTheme);
    }, [theme]);

    const logoSrc =
        currentTheme === "dark"
            ? `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background-darkmode.svg`
            : `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background.svg`;

    console.log(theme);

    return (
        <div className="mb-4">
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand as={NavLink} to="/" className="fw-semibold">
                        <img
                            alt="iSpeakerReact logo"
                            src={logoSrc}
                            width="32"
                            height="32"
                            className="d-inline-block align-top"
                        />{" "}
                        iSpeakerReact
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="top-NavBar" />
                    <Navbar.Collapse id="top-NavBar" className="mt-3 mt-md-0">
                        <Nav className="me-auto" variant="underline">
                            <NavLink to="/" className="nav-link">
                                <House className="me-2" />
                                Home
                            </NavLink>
                            <NavLink to="/sounds" className="nav-link">
                                <Mic className="me-2" />
                                Sounds
                            </NavLink>
                            <NavLink to="/exercises" className="nav-link">
                                <CardChecklist className="me-2" />
                                Exercises
                            </NavLink>
                            <NavLink to="/conversations" className="nav-link">
                                <ChatDots className="me-2" />
                                Conversations
                            </NavLink>
                            <NavLink to="/exams" className="nav-link">
                                <ClipboardCheck className="me-2" />
                                Exams
                            </NavLink>
                            <NavLink to="/settings" className="nav-link">
                                <Gear className="me-2" />
                                Settings
                            </NavLink>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};

export default TopNavBar;
