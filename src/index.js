import React from "react";
import { Container } from "react-bootstrap";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Homepage from "./Homepage";
import HelpPage from "./HelpPage";
import SoundList from "./SoundList";
import { ThemeProvider } from "./ThemeContext";
import ThemeSwitcher from "./ThemeSwitcher";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Container className="p-4">
        <React.StrictMode>
            <Router>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/sounds" element={<SoundList />} />
                </Routes>
            </Router>
            <ThemeProvider>
                <ThemeSwitcher />
            </ThemeProvider>
        </React.StrictMode>
    </Container>
);
