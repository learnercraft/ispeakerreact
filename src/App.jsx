import { Container } from "react-bootstrap";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoadingOverlay from "./components/general/LoadingOverlay";
import { ThemeProvider } from "./utils/ThemeProvider";
import ThemeSwitcher from "./utils/ThemeSwitcher";
import Homepage from "./components/Homepage";
import SoundList from "./components/sound_page/SoundList";
import ConversationMenu from "./components/conversation_page/ConversationMenu";
import ExamPage from "./components/exam_page/ExamPage";
import ExcercisePage from "./components/exercise_page/ExercisePage";

const App = () => {
    return (
        <Container className="p-4 mb-5">
            <Router>
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/sounds" element={<SoundList />} />
                    <Route path="/conversations" element={<ConversationMenu />} />
                    <Route path="/exams" element={<ExamPage />} />
                    <Route path="/exercises" element={<ExcercisePage />} />
                </Routes>
            </Router>
            <ThemeProvider>
                <ThemeSwitcher />
            </ThemeProvider>
        </Container>
    );
};

export default App;
