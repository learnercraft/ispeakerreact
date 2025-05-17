import PropTypes from "prop-types";
import { useAutoDetectTheme } from "../../utils/ThemeContext/useAutoDetectTheme";

const LogoLightOrDark = ({ width, height }) => {
    const { autoDetectedTheme } = useAutoDetectTheme();

    const logoSrc =
        autoDetectedTheme === "dark"
            ? `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background-darkmode.svg`
            : `${import.meta.env.BASE_URL}images/logos/ispeakerreact-no-background.svg`;

    return <img alt="iSpeakerReact logo" src={logoSrc} width={width} height={height} />;
};

LogoLightOrDark.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

export default LogoLightOrDark;
