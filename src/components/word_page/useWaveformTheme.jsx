import { useState, useEffect } from "react";

const useWaveformTheme = (
    theme,
    waveformLight,
    waveformDark,
    progressLight,
    progressDark,
    cursorLight,
    cursorDark
) => {
    const [colors, setColors] = useState({
        waveformColor: waveformLight,
        progressColor: progressLight,
        cursorColor: cursorLight,
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const updateColors = () => {
            const systemPrefersDark = mediaQuery.matches;
            const isDarkMode = theme === "auto" ? systemPrefersDark : theme === "dark";

            setColors({
                waveformColor: isDarkMode ? waveformDark : waveformLight,
                progressColor: isDarkMode ? progressDark : progressLight,
                cursorColor: isDarkMode ? cursorDark : cursorLight,
            });
        };

        updateColors();

        if (theme === "auto") {
            mediaQuery.addEventListener("change", updateColors);
        }

        return () => {
            mediaQuery.removeEventListener("change", updateColors);
        };
    }, [theme, waveformLight, waveformDark, progressLight, progressDark, cursorLight, cursorDark]);

    return colors;
};

export default useWaveformTheme;
