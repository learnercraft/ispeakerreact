import { useEffect, useState } from "react";
import { useTheme } from "./useTheme";

const useAutoDetectTheme = () => {
    const { theme } = useTheme();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [autoDetectedTheme, setAutoDetectedTheme] = useState(theme);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const updateTheme = () => {
            if (theme === "auto") {
                const systemPrefersDark = mediaQuery.matches;
                setAutoDetectedTheme(systemPrefersDark ? "dark" : "light");
                setIsDarkMode(systemPrefersDark);
            } else {
                setAutoDetectedTheme(theme);
                setIsDarkMode(theme === "dark");
            }
        };

        updateTheme();
        if (theme === "auto") {
            mediaQuery.addEventListener("change", updateTheme);
        }
        return () => {
            mediaQuery.removeEventListener("change", updateTheme);
        };
    }, [theme]);

    return { isDarkMode, autoDetectedTheme };
};

export default useAutoDetectTheme;
