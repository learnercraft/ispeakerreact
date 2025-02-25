import { Suspense, lazy } from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import LoadingOverlay from "./components/general/LoadingOverlay";
import NotFound from "./components/general/NotFound";
import Homepage from "./components/Homepage";
import { isElectron } from "./utils/isElectron";
import { ThemeProvider } from "./utils/ThemeContext/ThemeProvider";
import { useTheme } from "./utils/ThemeContext/useTheme";

const SoundList = lazy(() => import("./components/sound_page/SoundList"));
const WordList = lazy(() => import("./components/word_page/WordList"));
const ConversationMenu = lazy(() => import("./components/conversation_page/ConversationMenu"));
const ExamPage = lazy(() => import("./components/exam_page/ExamPage"));
const ExercisePage = lazy(() => import("./components/exercise_page/ExercisePage"));
const SettingsPage = lazy(() => import("./components/setting_page/Settings"));

const RouterComponent = isElectron() ? HashRouter : BrowserRouter;

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

const currentVersion = __APP_VERSION__;

const RATE_LIMIT_KEY = "github_ratelimit_timestamp";

const clearCacheForNewVersion = async () => {
    // Prevent running in either development mode or Electron version
    if (process.env.NODE_ENV === "development" || isElectron()) {
        console.warn("Dev mode or Electron version detected, skipping version check.");
        return;
    }

    try {
        const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const savedResetTime = localStorage.getItem(RATE_LIMIT_KEY);

        // If a reset time is stored and it's in the future, skip API request
        if (savedResetTime && now < parseInt(savedResetTime, 10)) {
            console.warn("Skipping version check due to rate limiting.");
            return;
        }

        const response = await fetch(
            "https://api.github.com/repos/yllst-testing-labs/ispeakerreact/contents/package.json",
            {
                headers: {
                    "User-Agent": "iSpeakerReact-yllst-testing-labs",
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );

        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

        // Get rate limit headers
        const rateLimitRemaining = parseInt(
            response.headers.get("x-ratelimit-remaining") || "0",
            10
        );
        const rateLimitReset = parseInt(response.headers.get("x-ratelimit-reset") || "0", 10);

        // If GitHub sends a reset time, store it before proceeding
        if (rateLimitReset) {
            localStorage.setItem(RATE_LIMIT_KEY, (rateLimitReset + 5 * 3600).toString());
        }

        // If we are near the rate limit, stop further checks
        if (rateLimitRemaining < 50 && rateLimitReset) {
            console.warn(
                `Rate limit is low (${rateLimitRemaining} remaining). Skipping update check.`
            );
            return;
        }

        // Process package.json from GitHub API
        const data = await response.json();
        if (!data.content) throw new Error("No content in response");

        const decodedContent = JSON.parse(atob(data.content));
        const latestVersion = decodedContent.version;

        if (latestVersion !== currentVersion) {
            console.log(
                `New version found: ${latestVersion}. Clearing cache and refreshing page...`
            );
            alert(`New version found: ${latestVersion}. Refreshing in 3 seconds...`);

            caches.keys().then((names) => {
                names.forEach((name) => {
                    if (name !== "permanent-cache") {
                        caches.delete(name);
                    }
                });
            });

            setTimeout(() => {
                window.location.reload();
            }, "3000");
        }
    } catch (error) {
        console.error("Failed to fetch version:", error);
    }
};

const AppContent = () => {
    clearCacheForNewVersion();

    const { theme } = useTheme();
    const toastTheme =
        theme === "dark" ||
        (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)
            ? "dark"
            : "light";

    return (
        <>
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
    <ThemeProvider>
        <AppContent />
    </ThemeProvider>
);

export default App;
