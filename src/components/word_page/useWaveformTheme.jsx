import { useEffect, useState } from "react";
import { useAutoDetectTheme } from "../../utils/ThemeContext/useAutoDetectTheme";

const useWaveformTheme = (
    waveformLight,
    waveformDark,
    progressLight,
    progressDark,
    cursorLight,
    cursorDark
) => {
    const { autoDetectedTheme } = useAutoDetectTheme();
    const [colors, setColors] = useState({
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
