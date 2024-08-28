import { NavLink } from "react-router-dom";
import { Nav, Navbar, Container } from "react-bootstrap";

const TopNavBar = () => {
    return (
        <div className="mb-4">
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand as={NavLink} to="/" className="fw-semibold">
                        <img
                            alt=""
                            src="/images/icons/ios/128.png"
                            width="32"
                            height="32"
                            className="d-inline-block align-top"
                        />{" "}
                        Oxford iSpeaker
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="top-NavBar" />
                    <Navbar.Collapse id="top-NavBar">
                        <Nav className="me-auto" variant="underline">
                            <NavLink to="/" className="nav-link">
                                Home
                            </NavLink>
                            <NavLink to="/sounds" className="nav-link">
                                Sounds
                            </NavLink>
                            <Nav.Link href="#" disabled>
                                Exercises
                            </Nav.Link>
                            <NavLink to="/conversations" className="nav-link">
                                Conversations
                            </NavLink>
                            <NavLink to="/exams" className="nav-link">
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
