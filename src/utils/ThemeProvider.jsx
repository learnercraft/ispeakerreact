import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "auto");

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

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
