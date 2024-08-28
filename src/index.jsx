import React from "react";
import { Container } from "react-bootstrap";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Homepage from "./components/Homepage";
import SoundList from "./components/sound_page/SoundList";
import ConversationMenu from "./components/conversation_page/ConversationMenu";
import ExamPage from "./components/exam_page/ExamPage";
import { ThemeProvider } from "./utils/ThemeContext";
import ThemeSwitcher from "./utils/ThemeSwitcher";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Container className="p-4 mb-5">
        <React.StrictMode>
            <Router>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/sounds" element={<SoundList />} />
                    <Route path="/conversations" element={<ConversationMenu />} />
                    <Route path="/exams" element={<ExamPage />} />
                </Routes>
            </Router>
            <ThemeProvider>
                <ThemeSwitcher />
            </ThemeProvider>
        </React.StrictMode>
    </Container>
);
