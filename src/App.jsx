import { Suspense, lazy } from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import LoadingOverlay from "./components/general/LoadingOverlay";
import NotFound from "./components/general/NotFound";
import Homepage from "./components/Homepage";
import ErrorBoundary from "./ErrorBoundary";
import { isElectron } from "./utils/isElectron";
import { ThemeProvider } from "./utils/ThemeContext/ThemeProvider";
import { useTheme } from "./utils/ThemeContext/useTheme";
import VersionUpdateDialog from "./components/general/VersionUpdateDialog";
import { useState, useEffect } from "react";

const SoundList = lazy(() => import("./components/sound_page/SoundList"));
const WordList = lazy(() => import("./components/word_page/WordList"));
const ConversationMenu = lazy(() => import("./components/conversation_page/ConversationMenu"));
const ExamPage = lazy(() => import("./components/exam_page/ExamPage"));
const ExercisePage = lazy(() => import("./components/exercise_page/ExercisePage"));
const SettingsPage = lazy(() => import("./components/setting_page/Settings"));
const DownloadPage = lazy(() => import("./components/download_page/DownloadPage"));

const RouterComponent = isElectron() ? HashRouter : BrowserRouter;

const PROD_BASE_URL = "https://yllst-testing-labs.github.io/ispeakerreact/";

const isProdWeb =
    import.meta.env.PROD &&
    !isElectron() &&
    window.location.href.startsWith(PROD_BASE_URL);

// Ensure baseUrl does not add unnecessary slashes
const baseUrl = isElectron()
    ? ""
    : (() => {
          switch (import.meta.env.BASE_URL) {
              case "/":
              case "./":
                  return ""; // Use no basename for "/" or "./"
              default:
                  return import.meta.env.BASE_URL;
          }
      })();

// Clear web cache if a newer version is found

const AppContent = () => {
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const { theme } = useTheme();
    const toastTheme =
        theme === "dark" ||
        (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)
            ? "dark"
            : "light";

    useEffect(() => {
        if (isProdWeb) {
            setShowUpdateDialog(true);
        } else {
            console.warn("Dev mode or Electron version detected. Version check skipped.");
        }
    }, []);

    return (
        <>
            <VersionUpdateDialog
                open={showUpdateDialog}
                onRefresh={() => window.location.reload()}
            />
            <RouterComponent basename={!isElectron() ? baseUrl : ""}>
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
                        path="/words"
                        element={
                            <Suspense fallback={isElectron() ? null : <LoadingOverlay />}>
                                <WordList />
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
                    <Route
                        path="/download"
                        element={
                            <Suspense fallback={isElectron() ? null : <LoadingOverlay />}>
                                <DownloadPage />
                            </Suspense>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </RouterComponent>
            <Toaster
                className="flex justify-center"
                position="bottom-center"
                duration="7000"
                theme={toastTheme}
            />
        </>
    );
};

const App = () => (
    <ErrorBoundary>
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    </ErrorBoundary>
);

export default App;
