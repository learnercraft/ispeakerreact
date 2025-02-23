import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";

import { useEffect, useState } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { isElectron } from "../../utils/isElectron";
import { useTheme } from "../../utils/ThemeContext/useTheme";

const WatchVideoCard = ({ t, videoUrl, iframeLoadingStates, handleIframeLoad }) => {
    const { theme } = useTheme();
    const [, setCurrentTheme] = useState(theme);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const updateTheme = () => {
            if (theme === "auto") {
                const systemPrefersDark = mediaQuery.matches;
                setCurrentTheme(systemPrefersDark ? "dark" : "light");
                setIsDarkMode(systemPrefersDark);
            } else {
                setCurrentTheme(theme);
                setIsDarkMode(theme === "dark");
            }
        };

        // Initial check and listener
        updateTheme();
        if (theme === "auto") {
            mediaQuery.addEventListener("change", updateTheme);
        }

        return () => {
            mediaQuery.removeEventListener("change", updateTheme);
        };
    }, [theme]);

    const videoColorScheme = isDarkMode ? "dark" : "light";

    return (
        <div className="card card-lg card-border mb-6 w-full shadow-md dark:border-slate-600">
            <div className="card-body">
                <div className={`${iframeLoadingStates.modalIframe ? "overflow-hidden" : ""}`}>
                    <div className="aspect-video">
                        <div className="relative h-full w-full">
                            {isElectron() &&
                            videoUrl?.isLocal &&
                            videoUrl.value.includes("http://localhost") ? (
                                <MediaPlayer src={videoUrl.value}>
                                    <MediaProvider />
                                    <DefaultVideoLayout
                                        icons={defaultLayoutIcons}
                                        colorScheme={videoColorScheme}
                                    />
                                </MediaPlayer>
                            ) : (
                                <>
                                    {iframeLoadingStates.mainIframe && (
                                        <div className="skeleton absolute inset-0 h-full w-full"></div>
                                    )}
                                    <iframe
                                        src={videoUrl?.value}
                                        title="Phoneme Video"
                                        loading="lazy"
                                        allowFullScreen
                                        onLoad={() => {
                                            handleIframeLoad("mainIframe");
                                        }}
                                        className={`h-full w-full transition-opacity duration-300 ${
                                            iframeLoadingStates.mainIframe
                                                ? "opacity-0"
                                                : "opacity-100"
                                        }`}
                                    ></iframe>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {isElectron() && !videoUrl?.value.includes("http://localhost") ? (
                    <div role="alert" className="alert mt-5">
                        <IoInformationCircleOutline className="h-6 w-6" />
                        <span>{t("alert.alertOnlineVideo")}</span>
                    </div>
                ) : (
                    ""
                )}
            </div>
        </div>
    );
};

export default WatchVideoCard;
