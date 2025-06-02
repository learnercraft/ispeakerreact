import he from "he";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoChevronBackOutline } from "react-icons/io5";
import { MdChecklist, MdKeyboardVoice, MdOutlineOndemandVideo } from "react-icons/md";
import useScrollTo from "../../utils/useScrollTo.js";
import LoadingOverlay from "../general/LoadingOverlay.js";
import { SoundVideoDialogProvider } from "./hooks/useSoundVideoDialog.js";
import ReviewCard from "./ReviewCard.js";
import SoundPracticeCard from "./SoundPracticeCard.js";
import TongueTwister from "./TongueTwister.js";
import type {
    PhonemeData,
    AccentType,
    SoundData,
    SoundMenuItem,
    SoundsData,
    SoundType,
} from "./types.js";
import WatchVideoCard from "./WatchVideoCard.js";

interface PracticeSoundProps {
    sound: SoundMenuItem;
    accent: AccentType;
    onBack: () => void;
}

const SoundMain = ({ sound, accent, onBack }: PracticeSoundProps) => {
    const { t } = useTranslation();
    const [soundsData, setSoundsData] = useState<SoundsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("watchTab");
    const { ref: scrollRef, scrollTo } = useScrollTo();

    // Fetch sounds data
    useEffect(() => {
        const fetchSoundsData = async () => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}json/sounds_data.json`);
                const data = await response.json();
                setSoundsData(data);
            } catch (error) {
                console.error("Error fetching sounds data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSoundsData();
    }, []);

    // Find the sound data using the type and phoneme from sounds_menu.json
    const soundData = (soundsData?.[sound.type] as SoundData[] | undefined)?.find(
        (item) => item.id === sound.id
    );
    const accentData = (soundData?.[accent] as PhonemeData[] | null)?.[0];

    const handleReviewUpdate = () => {
        // This function is intentionally empty as the review update is handled by the ReviewCard component
        // We just need to pass a function to trigger the parent component's re-render
    };

    // Show loading while fetching data
    if (loading) {
        return <LoadingOverlay />;
    }

    return (
        <div className="flex flex-wrap gap-5 lg:flex-nowrap">
            <div className="w-full lg:w-1/4">
                <h3 className="mb-2 text-2xl font-semibold">
                    {t("sound_page.soundTop")} <span lang="en">{he.decode(sound.phoneme)}</span>
                </h3>
                <p className="mb-4">
                    {t("accent.accentSettings")}:{" "}
                    {accent === "american" ? t("accent.accentAmerican") : t("accent.accentBritish")}
                </p>
                <div className="divider divider-secondary"></div>
                {accentData && (
                    <>
                        <p className="mb-2 font-semibold">{t("sound_page.exampleWords")}</p>
                        {["initial", "medial", "final"].map((position) => (
                            <p
                                className="mb-2 italic"
                                lang="en"
                                key={position}
                                dangerouslySetInnerHTML={{
                                    __html: he.decode(
                                        (accentData as unknown as Record<string, string>)[position]
                                    ),
                                }}
                            ></p>
                        ))}
                    </>
                )}
                <button type="button" className="btn btn-secondary my-6" onClick={onBack}>
                    <IoChevronBackOutline className="h-5 w-5" /> {t("sound_page.backBtn")}
                </button>
            </div>
            <div className="w-full lg:w-3/4">
                <div className="bg-base-100 sticky top-[calc(5rem)] z-10 py-4">
                    <div className="flex flex-col items-center">
                        <div role="tablist" className="tabs tabs-box">
                            <a
                                role="tab"
                                onClick={() => {
                                    setActiveTab("watchTab");
                                    scrollTo();
                                }}
                                className={`tab md:text-base ${activeTab === "watchTab" ? "tab-active font-semibold" : ""}`}
                            >
                                <MdOutlineOndemandVideo className="me-1 h-6 w-6" />
                                {t("buttonConversationExam.watchBtn")}
                            </a>
                            <a
                                role="tab"
                                onClick={() => {
                                    setActiveTab("practieTab");
                                    scrollTo();
                                }}
                                className={`tab md:text-base ${activeTab === "practieTab" ? "tab-active font-semibold" : ""}`}
                            >
                                <MdKeyboardVoice className="me-1 h-6 w-6" />
                                {t("buttonConversationExam.practiceBtn")}
                            </a>
                            <a
                                role="tab"
                                onClick={() => {
                                    setActiveTab("reviewTab");
                                    scrollTo();
                                }}
                                className={`tab md:text-base ${activeTab === "reviewTab" ? "tab-active font-semibold" : ""}`}
                            >
                                <MdChecklist className="me-1 h-6 w-6" />
                                {t("buttonConversationExam.reviewBtn")}
                            </a>
                        </div>
                    </div>
                </div>

                <div ref={scrollRef} className="my-4">
                    {activeTab === "watchTab" &&
                        accentData &&
                        accentData.mainOnlineVideo &&
                        accentData.mainOfflineVideo && (
                            <WatchVideoCard
                                videoData={{
                                    mainOnlineVideo: accentData.mainOnlineVideo,
                                    mainOfflineVideo: accentData.mainOfflineVideo,
                                }}
                                accent={accent}
                                t={t}
                                phoneme={{
                                    type: sound.type,
                                    key: sound.key,
                                }}
                            />
                        )}
                    {activeTab === "practieTab" && (
                        <SoundVideoDialogProvider t={t}>
                            <div className="space-y-4">
                                {accentData && (
                                    <>
                                        {(["main", "initial", "medial", "final"] as const).map(
                                            (position, index) => {
                                                const isMain = position === "main";
                                                const videoUrl = isMain
                                                    ? accentData.mainOnlineVideo
                                                    : (accentData.practiceOnlineVideos[index] ??
                                                      "");
                                                const offlineVideo = isMain
                                                    ? accentData.mainOfflineVideo
                                                    : (accentData.practiceOfflineVideos[index] ??
                                                      "");
                                                const textContent = isMain
                                                    ? sound.phoneme
                                                    : typeof accentData[
                                                            position as keyof PhonemeData
                                                        ] === "string"
                                                      ? (accentData[
                                                            position as keyof PhonemeData
                                                        ] as string)
                                                      : "";
                                                const cardIndex = isMain ? 0 : index;
                                                const type =
                                                    sound.type === "consonants"
                                                        ? "constant"
                                                        : sound.type === "vowels"
                                                          ? "vowel"
                                                          : "dipthong";
                                                return (
                                                    (isMain ||
                                                        accentData[
                                                            position as keyof PhonemeData
                                                        ]) && (
                                                        <SoundPracticeCard
                                                            key={position}
                                                            textContent={textContent}
                                                            videoUrl={videoUrl}
                                                            offlineVideo={offlineVideo}
                                                            accent={accent}
                                                            t={t}
                                                            phoneme={sound.phoneme}
                                                            phonemeId={sound.id}
                                                            index={cardIndex}
                                                            type={type as SoundType}
                                                            shouldShowPhoneme={
                                                                isMain
                                                                    ? (
                                                                          soundData as {
                                                                              shouldShowPhoneme?: boolean;
                                                                          }
                                                                      )?.shouldShowPhoneme !== false
                                                                    : undefined
                                                            }
                                                        />
                                                    )
                                                );
                                            }
                                        )}
                                    </>
                                )}
                                <TongueTwister
                                    tongueTwisters={accentData?.tongueTwister ?? []}
                                    t={t}
                                    sound={sound}
                                    accent={accent}
                                />
                            </div>
                        </SoundVideoDialogProvider>
                    )}
                    {activeTab === "reviewTab" && (
                        <ReviewCard
                            sound={sound}
                            accent={accent}
                            t={t}
                            onReviewUpdate={handleReviewUpdate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SoundMain;
