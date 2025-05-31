import { useEffect, useState } from "react";
import useAutoDetectTheme from "../../utils/ThemeContext/useAutoDetectTheme.js";
import type { WaveformThemeColors } from "./types";

const useWaveformTheme = (
    waveformLight: string,
    waveformDark: string,
    progressLight: string,
    progressDark: string,
    cursorLight: string,
    cursorDark: string
): WaveformThemeColors => {
    const { autoDetectedTheme } = useAutoDetectTheme();
    const [colors, setColors] = useState<WaveformThemeColors>({
        waveformColor: waveformLight,
        progressColor: progressLight,
        cursorColor: cursorLight,
    });

    useEffect(() => {
        setColors({
            waveformColor: autoDetectedTheme === "dark" ? waveformDark : waveformLight,
            progressColor: autoDetectedTheme === "dark" ? progressDark : progressLight,
            cursorColor: autoDetectedTheme === "dark" ? cursorDark : cursorLight,
        });
    }, [
        autoDetectedTheme,
        waveformLight,
        waveformDark,
        progressLight,
        progressDark,
        cursorLight,
        cursorDark,
    ]);

    return colors;
};

export default useWaveformTheme;
