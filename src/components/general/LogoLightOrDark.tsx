import useAutoDetectTheme from "../../utils/ThemeContext/useAutoDetectTheme.js";

const LogoLightOrDark = ({ width, height }: { width: number; height: number }) => {
    const { autoDetectedTheme } = useAutoDetectTheme();

    const logoSrc =
        autoDetectedTheme === "dark"
            ? `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background-darkmode.svg`
            : `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background.svg`;

    return <img alt="iSpeakerReact logo" src={logoSrc} width={width} height={height} />;
};

export default LogoLightOrDark;
