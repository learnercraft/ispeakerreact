import { Suspense, lazy } from "react";
import { Container } from "react-bootstrap";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoadingOverlay from "./components/general/LoadingOverlay";
import { ThemeProvider } from "./utils/ThemeProvider";
import ThemeSwitcher from "./utils/ThemeSwitcher";

const Homepage = lazy(() => import("./components/Homepage"));
const SoundList = lazy(() => import("./components/sound_page/SoundList"));
const ConversationMenu = lazy(() => import("./components/conversation_page/ConversationMenu"));
const ExamPage = lazy(() => import("./components/exam_page/ExamPage"));
const ExcercisePage = lazy(() => import("./components/exercise_page/ExercisePage"));

const App = () => {
    return (
        <Container className="p-4 mb-5">
            <Router>
                <Suspense fallback={<LoadingOverlay />}>
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/sounds" element={<SoundList />} />
                        <Route path="/conversations" element={<ConversationMenu />} />
                        <Route path="/exams" element={<ExamPage />} />
                        <Route path="/exercises" element={<ExcercisePage />} />
                    </Routes>
                </Suspense>
            </Router>
            <ThemeProvider>
                <ThemeSwitcher />
            </ThemeProvider>
        </Container>
    );
};

export default App;
