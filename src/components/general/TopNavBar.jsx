import { Container, Nav, Navbar } from "react-bootstrap";
import { CardChecklist, ChatDots, ClipboardCheck, House, Mic } from "react-bootstrap-icons";
import { NavLink } from "react-router-dom";

const TopNavBar = () => {
    return (
        <div className="mb-4">
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand as={NavLink} to="/" className="fw-semibold">
                        <img
                            alt="SpeakerReact logo"
                            src="/images/icons/ios/128.png"
                            width="32"
                            height="32"
                            className="d-inline-block align-top"
                        />{" "}
                        SpeakerReact
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
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};

export default TopNavBar;
