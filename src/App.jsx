import { Suspense, lazy } from "react";
import { Container } from "react-bootstrap";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoadingOverlay from "./components/general/LoadingOverlay";
import Homepage from "./components/Homepage";
import NotFound from "./components/general/NotFound";
import { ThemeProvider } from "./utils/ThemeProvider";
import ThemeSwitcher from "./utils/ThemeSwitcher";

const SoundList = lazy(() => import("./components/sound_page/SoundList"));
const ConversationMenu = lazy(() => import("./components/conversation_page/ConversationMenu"));
const ExamPage = lazy(() => import("./components/exam_page/ExamPage"));
const ExercisePage = lazy(() => import("./components/exercise_page/ExercisePage"));
const SettingsPage = lazy(() => import("./components/setting_page/Settings"));

const App = () => {
    return (
        <ThemeProvider>
            <Container className="p-4 mb-5">
                <Router basename={import.meta.env.BASE_URL}>
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route
                            path="/sounds"
                            element={
                                <Suspense fallback={<LoadingOverlay />}>
                                    <SoundList />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/conversations"
                            element={
                                <Suspense fallback={<LoadingOverlay />}>
                                    <ConversationMenu />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/exams"
                            element={
                                <Suspense fallback={<LoadingOverlay />}>
                                    <ExamPage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/exercises"
                            element={
                                <Suspense fallback={<LoadingOverlay />}>
                                    <ExercisePage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <Suspense fallback={<LoadingOverlay />}>
                                    <SettingsPage />
                                </Suspense>
                            }
                        />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
                <ThemeSwitcher />
            </Container>
        </ThemeProvider>
    );
};

export default App;
