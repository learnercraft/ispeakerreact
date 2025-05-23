import { MediaPlayer, MediaProvider, Track } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import PropTypes from "prop-types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoInformationCircleOutline } from "react-icons/io5";
import isElectron from "../../utils/isElectron";
import useAutoDetectTheme from "../../utils/ThemeContext/useAutoDetectTheme";

const WatchAndStudyTab = ({ videoUrl, subtitleUrl, dialog, skillCheckmark }) => {
    const { t } = useTranslation();
    const [highlightState, setHighlightState] = useState({});
    const [iframeLoading, setiFrameLoading] = useState(true);

    const { autoDetectedTheme } = useAutoDetectTheme();

    const handleIframeLoad = () => setiFrameLoading(false);

    // Handle checkbox change
    const handleCheckboxChange = (index) => {
        setHighlightState((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
                <div className="text-xl font-semibold">{t("tabConversationExam.watchCard")}</div>
                <div className="divider divider-secondary mt-0 mb-4"></div>
                <div className="bg-base-100 top-[calc(14rem)] md:sticky md:z-10">
                    <div className="aspect-video">
                        <div className="relative h-full w-full">
                            {isElectron() && videoUrl && videoUrl.startsWith("http://localhost") ? (
                                <MediaPlayer src={videoUrl}>
                                    <MediaProvider />
                                    <DefaultVideoLayout
                                        icons={defaultLayoutIcons}
                                        colorScheme={autoDetectedTheme}
                                    />
                                    <Track
                                        src={subtitleUrl}
                                        kind="subtitles"
                                        label="English"
                                        lang="en"
                                        type="srt"
                                        default
                                    />
                                </MediaPlayer>
                            ) : (
                                <>
                                    {iframeLoading && (
                                        <div className="skeleton absolute inset-0 h-full w-full"></div>
                                    )}
                                    <iframe
                                        src={videoUrl}
                                        title="Conversation video"
                                        loading="lazy"
                                        allowFullScreen
                                        onLoad={handleIframeLoad}
                                        className={`h-full w-full transition-opacity duration-300 ${
                                            iframeLoading ? "opacity-0" : "opacity-100"
                                        }`}
                                    ></iframe>
                                </>
                            )}
                        </div>
                    </div>
                    {isElectron() && !videoUrl.startsWith("http://localhost") ? (
                        <div role="alert" className="alert mt-5">
                            <IoInformationCircleOutline className="h-6 w-6" />
                            <span>{t("alert.alertOnlineVideo")}</span>
                        </div>
                    ) : (
                        ""
                    )}
                </div>
            </div>
            <div>
                <div className="text-xl font-semibold">{t("tabConversationExam.studyCard")}</div>
                <div className="divider divider-secondary mt-0 mb-4"></div>
                <div className="collapse-arrow bg-base-200 collapse dark:bg-slate-700">
                    <input type="checkbox" />
                    <button type="button" className="collapse-title text-start font-semibold">
                        {t("tabConversationExam.studyExpandBtn")}
                    </button>
                    <div className="collapse-content">
                        <div className="dialog-section">
                            {dialog.map((line, index) => (
                                <p lang="en" key={index} className="mb-2">
                                    <strong>{line.speaker}:</strong>{" "}
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: line.speech.replace(
                                                /highlight-dialog-(\d+)/g,
                                                (match, p1) =>
                                                    highlightState[p1]
                                                        ? `${p1 === "1" ? "bg-primary text-primary-content font-semibold" : "bg-secondary text-secondary-content font-semibold"}`
                                                        : ""
                                            ),
                                        }}
                                    ></span>
                                </p>
                            ))}
                        </div>
                        <div className="divider"></div>
                        <div className="px-3">
                            {skillCheckmark.map((skill, index) => (
                                <div key={index} className="mb-2">
                                    <label
                                        htmlFor={`skilllabel-${index}`}
                                        className="cursor-pointer"
                                    >
                                        <span
                                            className={`${
                                                highlightState[index + 1]
                                                    ? index === 0
                                                        ? "bg-primary text-primary-content"
                                                        : "bg-secondary text-secondary-content"
                                                    : ""
                                            }`}
                                        >
                                            {t(skill.label)}
                                        </span>
                                        <input
                                            id={`skilllabel-${index}`}
                                            type="checkbox"
                                            className={`checkbox checkbox-sm ms-2 align-text-bottom ${
                                                highlightState[index + 1]
                                                    ? index === 0
                                                        ? "checkbox-primary"
                                                        : "checkbox-secondary"
                                                    : ""
                                            }`}
                                            checked={!!highlightState[index + 1]}
                                            onChange={() => handleCheckboxChange(index + 1)}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

WatchAndStudyTab.propTypes = {
    videoUrl: PropTypes.string.isRequired,
    subtitleUrl: PropTypes.string.isRequired,
    dialog: PropTypes.array.isRequired,
    skillCheckmark: PropTypes.array.isRequired,
};

export default WatchAndStudyTab;
