import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Container from "../../ui/Container";
import { isElectron } from "../../utils/isElectron";
import { useTheme } from "../../utils/ThemeContext/useTheme";
import TopNavBar from "../general/TopNavBar";
import AppearanceSettings from "./Appearance";
import AppInfo from "./AppInfo";
import ExerciseTimer from "./ExerciseTimer";
import LogSettings from "./LogSettings";
import ResetSettings from "./ResetSettings";
import VideoDownloadMenu from "./VideoDownloadMenu";
import VideoDownloadSubPage from "./VideoDownloadSubPage";

const SettingsPage = () => {
    const { t } = useTranslation();
    const { resetTheme } = useTheme();

    useEffect(() => {
        document.title = `${t("navigation.settings")} | iSpeakerReact v${__APP_VERSION__}`;
    }, [t]);

    const [resetFlag, setResetFlag] = useState(false); // Boolean flag to force remount
    const [currentPage, setCurrentPage] = useState("settings");

    const handleReset = () => {
        // Change the key to remount the CachingSettings component
        setResetFlag((prevFlag) => !prevFlag);
        resetTheme();
    };

    const handleVideoDownloadMenuPage = () => {
        setCurrentPage("video-download");
    };

    const handleGoBackToSettings = () => {
        setCurrentPage("settings");
    };

    return (
        <>
            <TopNavBar />
            <Container>
                <div className="my-8 flex justify-center">
                    <div className="w-full md:w-2/3 lg:w-1/2" key={resetFlag}>
                        {currentPage === "settings" && (
                            <>
                                <h1 className="text-3xl font-semibold md:text-4xl">
                                    {t("settingPage.heading")}
                                </h1>
                                <div className="divider divider-secondary"></div>
                                <div className="mt-4">
                                    {isElectron() && (
                                        <>
                                            <AppInfo />
                                            <div className="divider"></div>
                                        </>
                                    )}
                                    <ExerciseTimer />
                                    <div className="divider"></div>
                                    <AppearanceSettings />
                                    {isElectron() && (
                                        <>
                                            <div className="divider"></div>
                                            <VideoDownloadMenu
                                                onClick={handleVideoDownloadMenuPage}
                                            />
                                        </>
                                    )}
                                    {isElectron() && (
                                        <>
                                            <div className="divider"></div>
                                            <LogSettings />
                                        </>
                                    )}
                                    <div className="divider"></div>
                                    <ResetSettings onReset={handleReset} />
                                </div>
                            </>
                        )}

                        {currentPage === "video-download" && (
                            <VideoDownloadSubPage onGoBack={handleGoBackToSettings} />
                        )}
                    </div>
                </div>
            </Container>
        </>
    );
};

export default SettingsPage;
