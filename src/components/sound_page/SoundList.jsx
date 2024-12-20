import he from "he";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Container from "../../ui/Container";
import AccentLocalStorage from "../../utils/AccentLocalStorage";
import { isElectron } from "../../utils/isElectron";
import AccentDropdown from "../general/AccentDropdown";
import LoadingOverlay from "../general/LoadingOverlay";
import TopNavBar from "../general/TopNavBar";

const PracticeSound = lazy(() => import("./PracticeSound"));

const SoundCard = ({
    sound,
    index,
    selectedAccent,
    handlePracticeClick,
    getBadgeColor,
    getReviewText,
    getReviewKey,
    reviews,
    t,
}) => {
    const badgeColor = getBadgeColor(sound, index);
    const reviewKey = getReviewKey(sound, index);
    const reviewText = badgeColor ? getReviewText(reviews[reviewKey]) : null;

    return (
        <div className="indicator">
            {badgeColor && (
                <span className={`badge indicator-item indicator-center ${badgeColor}`}>
                    {reviewText}
                </span>
            )}
            <div className="card card-bordered flex h-auto flex-col justify-between pb-6 shadow-md dark:border-slate-600">
                <div className="card-body flex-grow items-center text-center">
                    <h2 className="card-title">{he.decode(sound.phoneme)}</h2>
                    <p>{sound.example_word}</p>
                </div>
                <div className="card-actions px-6">
                    <button
                        className="btn btn-primary w-full"
                        onClick={() => handlePracticeClick(sound, selectedAccent, index)}
                        aria-label={t("sound_page.practiceBtn", {
                            sound: he.decode(sound.phoneme),
                        })}
                    >
                        {t("sound_page.practiceBtn")}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SoundList = () => {
    const { t } = useTranslation();
    const [selectedSound, setSelectedSound] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAccent, setSelectedAccent] = AccentLocalStorage();
    const [activeTab, setActiveTab] = useState("tab1");

    const [soundsData, setSoundsData] = useState({
        consonants: [],
        vowels_n_diphthongs: [],
    });

    const [reviews, setReviews] = useState({});
    const [reviewsUpdateTrigger, setReviewsUpdateTrigger] = useState(0);

    useEffect(() => {
        const fetchReviews = () => {
            const ispeakerData = JSON.parse(localStorage.getItem("ispeaker") || "{}");
            const accentReviews = ispeakerData.soundReview?.[selectedAccent] || {};
            setReviews(accentReviews);
        };
        fetchReviews();
    }, [selectedAccent, reviewsUpdateTrigger]);

    const triggerReviewsUpdate = () => setReviewsUpdateTrigger((prev) => prev + 1);

    const handlePracticeClick = (sound, accent, index) => {
        setSelectedSound({ sound, accent, index });
    };

    const handleGoBack = () => {
        setSelectedSound(null);
        triggerReviewsUpdate();
    };

    const getReviewKey = (sound, index) => {
        const type = soundsData.consonants.some((s) => s.phoneme === sound.phoneme)
            ? "consonant"
            : "vowel";
        return `${type}${index + 1}`;
    };

    const getBadgeColor = (sound, index) => {
        const reviewKey = getReviewKey(sound, index);
        const review = reviews[reviewKey];
        return (
            {
                good: "badge-success",
                neutral: "badge-warning",
                bad: "badge-error",
            }[review] || null
        );
    };

    const getReviewText = (review) => {
        switch (review) {
            case "good":
                return t("sound_page.reviewGood");
            case "neutral":
                return t("sound_page.reviewNeutral");
            case "bad":
                return t("sound_page.reviewBad");
            default:
                return "";
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.BASE_URL}json/sounds_data.json`);
                const data = await response.json();
                setSoundsData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
                alert(t("sound_page.loadError"));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [t]);

    useEffect(() => {
        document.title = `${t("navigation.sounds")} | iSpeakerReact v${__APP_VERSION__}`;
    }, [t]);

    const filteredSounds = useMemo(() => {
        const currentTabData =
            activeTab === "tab1" ? soundsData.consonants : soundsData.vowels_n_diphthongs;
        return currentTabData.filter(
            (sound) =>
                (selectedAccent === "british" && sound.b_s === "yes") ||
                (selectedAccent === "american" && sound.a_s === "yes")
        );
    }, [activeTab, selectedAccent, soundsData]);

    return (
        <>
            <TopNavBar />
            <Container>
                <h1 className="py-6 text-3xl font-bold md:text-4xl">{t("navigation.sounds")}</h1>
                {selectedSound ? (
                    <Suspense fallback={isElectron() ? null : <LoadingOverlay />}>
                        <PracticeSound
                            sound={selectedSound.sound}
                            accent={selectedSound.accent}
                            soundsData={soundsData}
                            index={selectedSound.index}
                            onBack={handleGoBack}
                        />
                    </Suspense>
                ) : (
                    <>
                        <AccentDropdown onAccentChange={setSelectedAccent} />
                        <div>
                            {loading ? (
                                <LoadingOverlay />
                            ) : (
                                <>
                                    <div className="sticky top-[calc(5rem)] z-10 bg-base-100 py-8">
                                        <div className="flex justify-center">
                                            <ul className="menu menu-horizontal w-auto rounded-box bg-base-200 dark:bg-slate-600">
                                                <li>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTab("tab1")}
                                                        className={`md:text-base ${
                                                            activeTab === "tab1"
                                                                ? "active font-semibold"
                                                                : ""
                                                        }`}
                                                    >
                                                        {t("sound_page.consonants")}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTab("tab2")}
                                                        className={`md:text-base ${
                                                            activeTab === "tab2"
                                                                ? "active font-semibold"
                                                                : ""
                                                        }`}
                                                    >
                                                        {t("sound_page.vowels_dipthongs")}
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="my-4 flex flex-wrap place-items-center justify-center gap-5">
                                        {filteredSounds.map((sound, index) => (
                                            <SoundCard
                                                key={index}
                                                sound={sound}
                                                index={index}
                                                selectedAccent={selectedAccent}
                                                handlePracticeClick={handlePracticeClick}
                                                getBadgeColor={getBadgeColor}
                                                getReviewText={getReviewText}
                                                reviews={reviews}
                                                getReviewKey={getReviewKey}
                                                t={t}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </Container>
        </>
    );
};

export default SoundList;
