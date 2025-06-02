import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import { useEffect, useState } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import isElectron from "../../utils/isElectron.js";
import useAutoDetectTheme from "../../utils/ThemeContext/useAutoDetectTheme.js";
import type { WatchVideoCardProps } from "./types.js";

const WatchVideoCard = ({ videoData, accent, t, phoneme }: WatchVideoCardProps) => {
    const [iframeLoading, setIframeLoading] = useState<boolean>(true);
    const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
    const [useOnlineVideo, setUseOnlineVideo] = useState<boolean>(false);
    const { autoDetectedTheme } = useAutoDetectTheme();

    useEffect(() => {
        const checkLocalVideo = async () => {
            if (isElectron() && videoData?.mainOfflineVideo) {
                try {
                    const port = await window.electron?.ipcRenderer?.invoke("get-port");
                    const folderName = `iSpeakerReact_SoundVideos_${accent === "british" ? "GB" : "US"}`;
                    const localUrl = `http://localhost:${port}/video/${folderName}/${videoData.mainOfflineVideo}`;

                    // Check if the local video exists
                    const response = await fetch(localUrl, { method: "HEAD" });
                    if (response.ok) {
                        setLocalVideoUrl(localUrl);
                        setUseOnlineVideo(false);
                    } else {
                        console.warn("Local video not found, falling back to online version");
                        setUseOnlineVideo(true);
                    }
                } catch (error) {
                    console.warn(
                        "Error checking local video, falling back to online version:",
                        error
                    );
                    setUseOnlineVideo(true);
                }
            } else {
                setUseOnlineVideo(true);
            }
        };

        checkLocalVideo();
    }, [videoData, accent]);

    const handleIframeLoad = () => {
        setIframeLoading(false);
    };

    const videoUrl = isElectron() && !useOnlineVideo ? localVideoUrl : videoData?.mainOnlineVideo;

    // Get the pronunciation instructions based on the phoneme type
    const getPronunciationInstructions = (): string[] | null => {
        if (!phoneme) return null;

        const phonemeType = phoneme.type; // 'consonant', 'vowel', or 'diphthong'
        const phonemeKey = phoneme.key; // e.g., 'pPen', 'eeSee', 'aySay'

        const instructions = t(`sound_page.soundInstructions.${phonemeType}.${phonemeKey}`, {
            returnObjects: true,
        });
        // t may return string or string[]
        if (Array.isArray(instructions)) return instructions as string[];
        if (typeof instructions === "string") return [instructions];
        return null;
    };

    const pronunciationInstructions = getPronunciationInstructions();

    return (
        <>
            <div className="card card-lg card-border mb-6 w-full shadow-md dark:border-slate-600">
                <div className="card-body">
                    <div className="text-xl font-semibold">
                        {t("tabConversationExam.watchCard")}
                    </div>
                    <div className="divider divider-secondary mt-0 mb-4"></div>
                    <div className={`${iframeLoading ? "overflow-hidden" : ""}`}>
                        <div className="aspect-video">
                            <div className="relative h-full w-full">
                                {localVideoUrl && !useOnlineVideo ? (
                                    <MediaPlayer src={localVideoUrl} className="h-full w-full">
                                        <MediaProvider />
                                        <DefaultVideoLayout
                                            icons={defaultLayoutIcons}
                                            colorScheme={
                                                autoDetectedTheme as
                                                    | "default"
                                                    | "light"
                                                    | "dark"
                                                    | "system"
                                            }
                                        />
                                    </MediaPlayer>
                                ) : (
                                    <>
                                        {iframeLoading && (
                                            <div className="skeleton absolute inset-0 h-full w-full"></div>
                                        )}
                                        <iframe
                                            src={videoUrl ?? undefined}
                                            title="Phoneme Video"
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
                    </div>
                    {isElectron() && useOnlineVideo ? (
                        <div role="alert" className="alert mt-5">
                            <IoInformationCircleOutline className="h-6 w-6" />
                            <span>{t("alert.alertOnlineVideo")}</span>
                        </div>
                    ) : (
                        ""
                    )}
                </div>
            </div>

            {pronunciationInstructions && (
                <div className="card card-lg card-border mb-6 w-full shadow-md dark:border-slate-600">
                    <div className="card-body">
                        <h3 className="card-title font-semibold">
                            {t("sound_page.soundInstructions.howToPronounce")}
                        </h3>
                        <div className="divider divider-secondary m-0"></div>
                        <div className="space-y-4">
                            {pronunciationInstructions.map((instruction: string, index: number) => (
                                <p key={index} className="text-base">
                                    {instruction}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WatchVideoCard;
