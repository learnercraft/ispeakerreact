import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import he from "he";
import { useCallback, useEffect, useRef, useState } from "react";
import { BsRecordCircleFill } from "react-icons/bs";
import { IoChevronBackOutline, IoInformationCircleOutline } from "react-icons/io5";
import { MdChecklist, MdKeyboardVoice, MdOutlineOndemandVideo } from "react-icons/md";

import { Trans, useTranslation } from "react-i18next";
import { checkRecordingExists } from "../../utils/databaseOperations";
import { isElectron } from "../../utils/isElectron";
import { useTheme } from "../../utils/ThemeContext/useTheme";
import LoadingOverlay from "../general/LoadingOverlay";
import { usePlaybackFunction } from "./hooks/usePlaybackFunction";
import { useRecordingFunction } from "./hooks/useRecordingFunction";
import { useSoundVideoMapping } from "./hooks/useSoundVideoMapping";
import ReviewCard from "./ReviewCard";
import SoundPracticeCard from "./SoundPracticeCard";
import WatchVideoCard from "./WatchVideoCard";

const PracticeSound = ({ sound, accent, onBack, index, soundsData }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("watchTab");

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

    const accentKey = accent === "american" ? "a" : "b";
    const accentData = sound[accentKey][0];

    const soundVideoModal = useRef(null);

    const findPhonemeDetails = useCallback(
        (phoneme) => {
            let phonemeIndex = soundsData.consonants.findIndex((p) => p.phoneme === phoneme);
            if (phonemeIndex !== -1) return { index: phonemeIndex, type: "consonant" };

            phonemeIndex = soundsData.vowels_n_diphthongs.findIndex((p) => p.phoneme === phoneme);
            if (phonemeIndex !== -1) return { index: phonemeIndex, type: "vowel" };

            return { index: -1, type: null };
        },
        [soundsData.consonants, soundsData.vowels_n_diphthongs]
    );

    const { index: phonemeIndex, type } = findPhonemeDetails(sound.phoneme);

    const { videoUrls, videoUrl } = useSoundVideoMapping(type, accent, soundsData, phonemeIndex);

    const imgPhonemeThumbSrc =
        accent === "american"
            ? `${import.meta.env.BASE_URL}images/ispeaker/sound_images/sounds_american.jpg`
            : `${import.meta.env.BASE_URL}images/ispeaker/sound_images/sounds_british.jpg`;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Video modals

    const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
    const [selectedVideoModalIndex, setSelectedVideoModalIndex] = useState("");

    const handleShow = (videoIndex) => {
        const newVideoUrl = videoUrls[videoIndex];

        // Only reset loading if the selected video URL is different
        if (selectedVideoUrl !== newVideoUrl) {
            setIframeLoadingStates((prevStates) => ({
                ...prevStates,
                modalIframe: true, // Reset loading only if a new video is selected
            }));
        }

        setSelectedVideoModalIndex(videoIndex);
        setSelectedVideoUrl(newVideoUrl);

        soundVideoModal.current?.showModal();
    };

    const handleClose = () => {
        soundVideoModal.current?.close();
    };

    // iframe loading
    const [iframeLoadingStates, setIframeLoadingStates] = useState({
        mainIframe: true,
        modalIframe: true,
    });

    const handleIframeLoad = (iframeKey) => {
        setIframeLoadingStates((prevStates) => ({
            ...prevStates,
            [iframeKey]: false,
        }));
    };

    // Recording & playback

    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecordingPlaying, setIsRecordingPlaying] = useState(false);
    const [activeRecordingCard, setActiveRecordingCard] = useState(null);
    const [recordingAvailability, setRecordingAvailability] = useState({});
    const [playingRecordings, setPlayingRecordings] = useState({});
    const [activePlaybackCard, setActivePlaybackCard] = useState(null);

    const [currentAudioSource, setCurrentAudioSource] = useState(null); // For AudioContext source node
    const [currentAudioElement, setCurrentAudioElement] = useState(null); // For Audio element (fallback)

    const { getRecordingKey, isRecordingPlayingActive, isRecordingAvailable, handleRecording } =
        useRecordingFunction(
            activeRecordingCard,
            setActiveRecordingCard,
            setIsRecording,
            setMediaRecorder,
            setRecordingAvailability,
            isRecording,
            mediaRecorder,
            findPhonemeDetails,
            sound,
            accent,
            recordingAvailability,
            playingRecordings
        );

    useEffect(() => {
        // Assume checkRecordingExists is a function that checks if a recording exists and returns a promise that resolves to a boolean
        const checks = [];
        for (let i = 1; i <= 4; i++) {
            const key = getRecordingKey(i);
            checks.push(checkRecordingExists(key).then((exists) => ({ key, exists })));
        }

        Promise.all(checks).then((results) => {
            const newAvailability = results.reduce((acc, { key, exists }) => {
                acc[key] = exists;
                return acc;
            }, {});
            setRecordingAvailability(newAvailability);
        });
    }, [getRecordingKey]);

    const handlePlayRecording = usePlaybackFunction(
        getRecordingKey,
        isRecordingPlaying,
        activePlaybackCard,
        currentAudioSource,
        setCurrentAudioSource,
        currentAudioElement,
        setCurrentAudioElement,
        setIsRecordingPlaying,
        setActivePlaybackCard,
        setPlayingRecordings
    );

    useEffect(() => {
        // Cleanup function to stop recording and playback
        return () => {
            // Stop the recording if it's active
            if (isRecording && mediaRecorder) {
                mediaRecorder.stop();
                setIsRecording(false);
            }

            // Stop AudioContext playback
            if (currentAudioSource) {
                try {
                    currentAudioSource.stop();
                } catch (error) {
                    console.error("Error stopping AudioContext source during cleanup:", error);
                }
                setCurrentAudioSource(null);
            }

            // Stop Audio element playback
            if (currentAudioElement) {
                currentAudioElement.pause();
                currentAudioElement.currentTime = 0;
                setCurrentAudioElement(null);
            }
        };
    }, [isRecording, mediaRecorder, currentAudioSource, currentAudioElement]);

    if (!videoUrl) {
        return <LoadingOverlay />;
    }

    return (
        <>
            <div className="flex flex-wrap gap-5 lg:flex-nowrap">
                <div className="w-full lg:w-1/4">
                    <h3 className="mb-2 text-2xl font-semibold">
                        {t("sound_page.soundTop")} <span lang="en">{he.decode(sound.phoneme)}</span>
                    </h3>
                    <p className="mb-4">
                        {t("accent.accentSettings")}:{" "}
                        {accent == "american"
                            ? t("accent.accentAmerican")
                            : t("accent.accentBritish")}
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
                                        __html: he.decode(accentData[position]),
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
                    <div className="sticky top-[calc(5rem)] z-10 bg-base-100 py-4">
                        <div className="flex flex-col items-center">
                            {/* Menu */}
                            <ul className="menu menu-horizontal w-auto rounded-box bg-base-200 dark:bg-slate-600">
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("watchTab")}
                                        className={`md:text-base ${
                                            activeTab === "watchTab" ? "active font-semibold" : ""
                                        }`}
                                    >
                                        <MdOutlineOndemandVideo className="h-6 w-6" />{" "}
                                        {t("buttonConversationExam.watchBtn")}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("practieTab")}
                                        className={`md:text-base ${
                                            activeTab === "practieTab" ? "active font-semibold" : ""
                                        }`}
                                    >
                                        <MdKeyboardVoice className="h-6 w-6" />{" "}
                                        {t("buttonConversationExam.practiceBtn")}
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("reviewTab")}
                                        className={`md:text-base ${
                                            activeTab === "reviewTab" ? "active font-semibold" : ""
                                        }`}
                                    >
                                        <MdChecklist className="h-6 w-6" />{" "}
                                        {t("buttonConversationExam.reviewBtn")}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-4">
                        {activeTab === "watchTab" && (
                            <WatchVideoCard
                                videoUrl={videoUrl}
                                iframeLoadingStates={iframeLoadingStates}
                                t={t}
                                handleIframeLoad={handleIframeLoad}
                            />
                        )}
                        {activeTab === "practieTab" && (
                            <div className="card card-bordered mb-6 w-full shadow-md dark:border-slate-600">
                                <div className="card-body">
                                    <p className="mb-2">
                                        <Trans
                                            i18nKey="sound_page.recordInstructions"
                                            components={[
                                                <BsRecordCircleFill
                                                    className="inline-block"
                                                    key="0"
                                                    aria-label="record icon"
                                                />,
                                            ]}
                                        />
                                    </p>
                                    <SoundPracticeCard
                                        sound={sound}
                                        handleShow={handleShow}
                                        imgPhonemeThumbSrc={imgPhonemeThumbSrc}
                                        activeRecordingCard={activeRecordingCard}
                                        isRecordingPlaying={isRecordingPlaying}
                                        activePlaybackCard={activePlaybackCard}
                                        accentData={accentData}
                                        isRecordingPlayingActive={isRecordingPlayingActive}
                                        isRecordingAvailable={isRecordingAvailable}
                                        handleRecording={handleRecording}
                                        handlePlayRecording={handlePlayRecording}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === "reviewTab" && (
                            <ReviewCard
                                sound={sound}
                                accent={accent}
                                index={index}
                                soundsData={soundsData}
                            />
                        )}
                    </div>
                </div>
            </div>

            <dialog ref={soundVideoModal} className="modal">
                <div className="modal-box w-full max-w-3xl">
                    <h3 className="text-lg font-bold">
                        {t("sound_page.clipModalTitle")} #{selectedVideoModalIndex}
                    </h3>
                    <div className="py-4">
                        <div className="aspect-video">
                            <div className="relative h-full w-full">
                                {isElectron() && selectedVideoUrl.includes("localhost:8998") ? (
                                    <MediaPlayer src={selectedVideoUrl} className="h-full w-full">
                                        <MediaProvider />
                                        <DefaultVideoLayout
                                            icons={defaultLayoutIcons}
                                            colorScheme={videoColorScheme}
                                        />
                                    </MediaPlayer>
                                ) : (
                                    selectedVideoUrl && (
                                        <>
                                            {iframeLoadingStates.modalIframe && (
                                                <div className="skeleton absolute inset-0 h-full w-full"></div>
                                            )}
                                            <iframe
                                                src={selectedVideoUrl}
                                                title="Phoneme Video"
                                                allowFullScreen
                                                onLoad={() => handleIframeLoad("modalIframe")}
                                                className={`h-full w-full transition-opacity duration-300 ${
                                                    iframeLoadingStates.modalIframe
                                                        ? "opacity-0"
                                                        : "opacity-100"
                                                }`}
                                            ></iframe>
                                        </>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                    {isElectron() && !selectedVideoUrl.startsWith("http://localhost") && (
                        <div role="alert" className="alert mt-5">
                            <IoInformationCircleOutline className="h-6 w-6" />
                            <span>{t("alert.alertOnlineVideo")}</span>
                        </div>
                    )}
                    <div className="modal-action">
                        <form method="dialog">
                            <button type="button" className="btn" onClick={handleClose}>
                                {t("sound_page.closeBtn")}
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default PracticeSound;
