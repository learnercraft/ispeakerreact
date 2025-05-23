import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Container from "../../ui/Container";
import isElectron from "../../utils/isElectron";
import TopNavBar from "../general/TopNavBar";
import AppearanceSettings from "./Appearance";
import AppInfo from "./AppInfo";
import ExerciseTimer from "./ExerciseTimer";
import LanguageSwitcher from "./LanguageSwitcher";
import LogSettings from "./LogSettings";
import ResetSettings from "./ResetSettings";
import SavedRecordingLocationMenu from "./SavedRecordingLocationMenu";
import SaveFolderSettings from "./SaveFolderSettings";
import VideoDownloadMenu from "./VideoDownloadMenu";
import VideoDownloadSubPage from "./VideoDownloadSubPage";

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
