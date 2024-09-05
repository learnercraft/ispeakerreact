import { Suspense, lazy } from "react";
import { Container } from "react-bootstrap";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoadingOverlay from "./components/general/LoadingOverlay";
import { ThemeProvider } from "./utils/ThemeProvider";
import ThemeSwitcher from "./utils/ThemeSwitcher";
import Homepage from "./components/Homepage";

const SoundList = lazy(() => import("./components/sound_page/SoundList"));
const ConversationMenu = lazy(() => import("./components/conversation_page/ConversationMenu"));
const ExamPage = lazy(() => import("./components/exam_page/ExamPage"));
const ExercisePage = lazy(() => import("./components/exercise_page/ExercisePage"));

const App = () => {
    return (
        <Container className="p-4 mb-5">
            <Router basname="/ispeaker">
                <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/sounds" element={
                        <Suspense fallback={<LoadingOverlay />}>
                            <SoundList />
                        </Suspense>
                    } />
                    <Route path="/conversations" element={
                        <Suspense fallback={<LoadingOverlay />}>
                            <ConversationMenu />
                        </Suspense>
                    } />
                    <Route path="/exams" element={
                        <Suspense fallback={<LoadingOverlay />}>
                            <ExamPage />
                        </Suspense>
                    } />
                    <Route path="/exercises" element={
                        <Suspense fallback={<LoadingOverlay />}>
                            <ExercisePage />
                        </Suspense>
                    } />
                </Routes>
            </Router>
            <ThemeProvider>
                <ThemeSwitcher />
            </ThemeProvider>
        </Container>
    );
};

export default App;
