import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "auto");

    // Initialize showToggleButton from localStorage or default to true
    const [showToggleButton, setShowToggleButton] = useState(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker"));
        return savedSettings && savedSettings.showToggleButton !== undefined ? savedSettings.showToggleButton : true; // Default to true if not found
    });

    // Effect to apply the theme and save it to localStorage
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const applyTheme = (themeValue) => {
            const newTheme = themeValue === "auto" ? (mediaQuery.matches ? "dark" : "light") : themeValue;
            document.documentElement.setAttribute("data-bs-theme", newTheme);
            localStorage.setItem("theme", themeValue);
        };

        // Initial theme apply
        applyTheme(theme);

        // Listener for system theme changes
        const handleChange = () => {
            if (theme === "auto") {
                applyTheme("auto");
            }
        };
        mediaQuery.addEventListener("change", handleChange);

        // Cleanup
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    // Effect to save showToggleButton to localStorage
    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker")) || {};
        savedSettings.showToggleButton = showToggleButton;
        localStorage.setItem("ispeaker", JSON.stringify(savedSettings));
    }, [showToggleButton]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, showToggleButton, setShowToggleButton }}>
            {children}
        </ThemeContext.Provider>
    );
};
