import { useEffect, useState } from "react";
import isElectron from "../isElectron.js";
import ThemeProviderContext from "./ThemeProviderContext.jsx";

const ThemeProvider = ({
    children,
    defaultTheme = "auto",
    storageKey = "ispeakerreact-ui-theme",
}: {
    children: React.ReactNode;
    defaultTheme: string;
    storageKey: string;
}) => {
    const [theme, setTheme] = useState(defaultTheme);
    const [loaded, setLoaded] = useState(false);

    // Load theme from storage on mount
    useEffect(() => {
        if (isElectron()) {
            window.Electron.ipcRenderer.invoke("get-theme", storageKey).then((storedTheme) => {
                setTheme(storedTheme || defaultTheme);
                setLoaded(true);
            });
        } else {
            const storedTheme = localStorage.getItem(storageKey);
            setTheme(storedTheme || defaultTheme);
            setLoaded(true);
        }
    }, [defaultTheme, storageKey]);

    useEffect(() => {
        if (!loaded) return;
        const root = window.document.documentElement;

        // Function to update the theme
        const updateTheme = () => {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";

            switch (theme) {
                case "auto":
                    root.setAttribute("data-theme", systemTheme === "dark" ? "dim" : systemTheme);
                    break;
                case "dark":
                    root.setAttribute("data-theme", "dim");
                    break;
                default:
                    root.setAttribute("data-theme", theme);
                    break;
            }
        };

        // Initial theme setup
        updateTheme();

        // Add event listener for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "auto") {
                updateTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);

        // Cleanup event listener
        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, [theme, loaded]);

    const value = {
        theme,
        setTheme: async (newTheme: string) => {
            if (isElectron()) {
                await window.Electron.ipcRenderer.invoke("set-theme", newTheme);
            } else {
                localStorage.setItem(storageKey, newTheme);
            }
            setTheme(newTheme);
        },
    };

    // Don't render children until theme is loaded
    if (!loaded) return null;

    return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
};

export default ThemeProvider;
