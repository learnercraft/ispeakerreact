import { useTheme } from "../../utils/ThemeContext/useTheme";
import { useState, useEffect } from "react";

const LogoLightOrDark = ({ width, height }) => {
    const { theme } = useTheme();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const updateTheme = () => {
            const systemPrefersDark = mediaQuery.matches;
            const newIsDarkMode = theme === "auto" ? systemPrefersDark : theme === "dark";

            if (newIsDarkMode !== isDarkMode) {
                setIsDarkMode(newIsDarkMode);
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

    const logoSrc = isDarkMode
        ? `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background-darkmode.svg`
        : `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background.svg`;

    return <img alt="iSpeakerReact logo" src={logoSrc} width={width} height={height} />;
};

export default LogoLightOrDark;
