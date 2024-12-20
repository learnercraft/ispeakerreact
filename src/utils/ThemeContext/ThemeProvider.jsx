import { useEffect, useState } from "react";
import ThemeProviderContext from "./ThemeProviderContext";

export function ThemeProvider({
    children,
    defaultTheme = "auto",
    storageKey = "ispeakerreact-ui-theme",
}) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem(storageKey) || defaultTheme;
    });

    useEffect(() => {
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
    }, [theme]);

    // Method to reset the theme
    const resetTheme = () => {
        localStorage.removeItem(storageKey); // Remove the theme from localStorage
        setTheme(defaultTheme); // Reset to the default theme
    };

    const value = {
        theme,
        setTheme: (newTheme) => {
            localStorage.setItem(storageKey, newTheme);
            setTheme(newTheme);
        },
        resetTheme, // Add resetTheme to the context value
    };

    return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}
