import { useTranslation } from "react-i18next";

const VideoDownloadMenu = ({ onClick }) => {
    const { t } = useTranslation();

    return (
        <div className="mt-4">
            <div className="flex gap-x-8 gap-y-6">
                <div className="flex basis-1/2 items-center space-y-1">
                    <p className="font-semibold">
                        {t("settingPage.videoDownloadSettings.videoDownloadHeading")}
                    </p>
                </div>
                <div className="flex basis-1/2 justify-end">
                    <button type="button" className="btn" onClick={onClick}>
                        {t("settingPage.videoDownloadSettings.videoDownloadOption")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoDownloadMenu;
