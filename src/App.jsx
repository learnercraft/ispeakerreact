import { Suspense, lazy } from "react";
import { Container } from "react-bootstrap";
import { Route, BrowserRouter, HashRouter, Routes } from "react-router-dom";
import LoadingOverlay from "./components/general/LoadingOverlay";
import NotFound from "./components/general/NotFound";
import Homepage from "./components/Homepage";
import { isElectron } from "./utils/isElectron";
import { ThemeProvider } from "./utils/ThemeProvider";
import ThemeSwitcher from "./utils/ThemeSwitcher";

const SoundList = lazy(() => import("./components/sound_page/SoundList"));
const ConversationMenu = lazy(() => import("./components/conversation_page/ConversationMenu"));
const ExamPage = lazy(() => import("./components/exam_page/ExamPage"));
const ExercisePage = lazy(() => import("./components/exercise_page/ExercisePage"));
const SettingsPage = lazy(() => import("./components/setting_page/Settings"));

const App = () => {
    const RouterComponent = isElectron() ? HashRouter : BrowserRouter;
    const baseUrl = import.meta.env.BASE_URL;

    return (
        <ThemeProvider>
            <Container className="p-4 mb-5">
                <RouterComponent basename={!isElectron()? baseUrl : ""}>
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route
                            path="/sounds"
                            element={
                                <Suspense fallback={isElectron() ? null : <LoadingOverlay />}>
                                    <SoundList />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/conversations"
                            element={
                                <Suspense fallback={isElectron() ? null : <LoadingOverlay />}>
                                    <ConversationMenu />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/exams"
                            element={
                                <Suspense fallback={isElectron() ? null : <LoadingOverlay />}>
                                    <ExamPage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/exercises"
                            element={
                                <Suspense fallback={isElectron() ? null : <LoadingOverlay />}>
                                    <ExercisePage />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <Suspense fallback={isElectron() ? null : <LoadingOverlay />}>
                                    <SettingsPage />
                                </Suspense>
                            }
                        />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </RouterComponent>
                <ThemeSwitcher />
            </Container>
        </ThemeProvider>
    );
};

export default App;
