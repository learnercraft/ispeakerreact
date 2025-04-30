import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useTheme } from "../../utils/ThemeContext/useTheme";

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
    }, [theme, isDarkMode]);

    const logoSrc = isDarkMode
        ? `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background-darkmode.svg`
        : `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background.svg`;

    return <img alt="iSpeakerReact logo" src={logoSrc} width={width} height={height} />;
};

LogoLightOrDark.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export default LogoLightOrDark;
