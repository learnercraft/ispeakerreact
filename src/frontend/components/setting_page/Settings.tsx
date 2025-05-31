import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Container from "../../ui/Container.js";
import isElectron from "../../utils/isElectron.js";
import TopNavBar from "../general/TopNavBar.js";
import AppearanceSettings from "./Appearance.js";
import AppInfo from "./AppInfo.js";
import ExerciseTimer from "./ExerciseTimer.js";
import LanguageSwitcher from "./LanguageSwitcher.js";
import LogSettings from "./LogSettings.js";
import PronunciationSettings from "./PronunciationSettings.js";
import ResetSettings from "./ResetSettings.js";
import SavedRecordingLocationMenu from "./SavedRecordingLocationMenu.js";
import SaveFolderSettings from "./SaveFolderSettings.js";
import VideoDownloadMenu from "./VideoDownloadMenu.js";
import VideoDownloadSubPage from "./VideoDownloadSubPage.js";

const SettingsPage = () => {
    const { t } = useTranslation();

    useEffect(() => {
        if (isElectron()) {
            document.title = `iSpeakerReact v${__APP_VERSION__}`;
        } else {
            document.title = `${t("navigation.settings")} | iSpeakerReact v${__APP_VERSION__}`;
        }
    }, [t]);

    const [currentPage, setCurrentPage] = useState("settings");

    const handleVideoDownloadMenuPage = () => {
        setCurrentPage("video-download");
    };

    const handleGoBackToSettings = () => {
        setCurrentPage("settings");
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <TopNavBar />
            <Container>
                <div className="my-8 flex justify-center">
                    <div className="w-full md:w-2/3 lg:w-1/2">
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
                                    <LanguageSwitcher />
                                    <div className="divider"></div>
                                    <ExerciseTimer />
                                    <div className="divider"></div>
                                    <AppearanceSettings />
                                    {isElectron() && (
                                        <>
                                            <div className="divider"></div>
                                            <SaveFolderSettings />
                                        </>
                                    )}
                                    {isElectron() && (
                                        <>
                                            <div className="divider"></div>
                                            <SavedRecordingLocationMenu />
                                        </>
                                    )}
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
                                            <PronunciationSettings />
                                        </>
                                    )}
                                    {isElectron() && (
                                        <>
                                            <div className="divider"></div>
                                            <LogSettings />
                                        </>
                                    )}
                                    <div className="divider"></div>
                                    <ResetSettings />
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
