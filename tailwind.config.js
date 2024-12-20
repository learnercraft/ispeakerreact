/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

export default {
    content: ["./index.html", "./src/**/*.{html,js,jsx}"],
    theme: {
        extend: {},
    },
    safelist: ["not-italic"],
    plugins: [typography, daisyui],
    daisyui: {
        themes: [
            {
                light: {
                    "color-scheme": "light",
                    primary: "rgb(56, 107, 1)",
                    "primary-content": "oklch(100% 0 0)",
                    secondary: "oklch(83.66% 0.1165 66.29)",
                    "secondary-content": "oklch(0% 0 0)",
                    accent: "rgb(111, 56, 159)",
                    "accent-content": "oklch(100% 0 0)",
                    neutral: "rgb(56, 102, 100)",
                    "neutral-content": "oklch(100% 0 0)",
                    "base-100": "rgb(253, 253, 245)",
                    "base-200": "rgb(237, 241, 226)",
                    "base-300": "rgb(225, 233, 211)",
                    info: "rgb(56, 104, 159)",
                    "info-content": "white",
                    success: "oklch(52.73% 0.1371 150.07)",
                    "success-content": "white",
                    warning: "rgb(251 191 36)",
                    "warning-content": "black",
                    error: "rgb(186, 26, 26)",
                    "error-content": "white",
                },
            },
            "dim",
        ],
        darkTheme: "dim",
    },
    darkMode: ["selector", '[data-theme="dim"]'],
};
