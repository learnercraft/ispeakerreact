import he from "he";
import PropTypes from "prop-types";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Container from "../../ui/Container";
import AccentLocalStorage from "../../utils/AccentLocalStorage";
import isElectron from "../../utils/isElectron";
import { useScrollTo } from "../../utils/useScrollTo";
import AccentDropdown from "../general/AccentDropdown";
import LoadingOverlay from "../general/LoadingOverlay";
import TopNavBar from "../general/TopNavBar";

const SoundMain = lazy(() => import("./SoundMain"));

const BADGE_COLORS = {
    good: "badge-success",
    neutral: "badge-warning",
    bad: "badge-error",
};

const TabNavigation = ({ activeTab, onTabChange, scrollTo, t }) => {
    const tabs = ["consonants", "vowels", "diphthongs"];

    return (
        <div className="bg-base-100 sticky top-[calc(5rem)] z-10 py-8">
            <div className="flex justify-center">
                <div role="tablist" className="tabs tabs-box">
                    {tabs.map((tab) => (
                        <a
                            key={tab}
                            role="tab"
                            onClick={() => {
                                onTabChange(tab);
                                scrollTo();
                            }}
                            className={`tab md:text-base ${
                                activeTab === tab ? "tab-active font-semibold" : ""
                            }`}
                        >
                            {t(`sound_page.${tab}`)}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

TabNavigation.propTypes = {
    activeTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
    scrollTo: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

const useReviews = (selectedAccent) => {
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

    return { reviews, triggerReviewsUpdate };
};

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
            <div className="card card-lg card-border flex h-auto flex-col justify-between pb-6 shadow-md dark:border-slate-600">
                <div className="card-body grow items-center text-center">
                    <h2 className="card-title" lang="en">
                        {he.decode(sound.phoneme)}
                    </h2>
                    <p
                        lang="en"
                        className="italic"
                        dangerouslySetInnerHTML={{ __html: sound.word }}
                    />
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

SoundCard.propTypes = {
    sound: PropTypes.shape({
        phoneme: PropTypes.string.isRequired,
        word: PropTypes.string.isRequired,
        british: PropTypes.bool.isRequired,
        american: PropTypes.bool.isRequired,
        id: PropTypes.number.isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
    selectedAccent: PropTypes.string.isRequired,
    handlePracticeClick: PropTypes.func.isRequired,
    getBadgeColor: PropTypes.func.isRequired,
    getReviewText: PropTypes.func.isRequired,
    getReviewKey: PropTypes.func.isRequired,
    reviews: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
};

const SoundList = () => {
    const { t } = useTranslation();
    const { ref: scrollRef, scrollTo } = useScrollTo();

    const [selectedSound, setSelectedSound] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAccent, setSelectedAccent] = AccentLocalStorage();
    const [activeTab, setActiveTab] = useState("consonants");

    const [phonemesData, setPhonemesData] = useState({
        consonants: [],
        vowels: [],
        diphthongs: [],
    });

    const { reviews, triggerReviewsUpdate } = useReviews(selectedAccent);

    const handlePracticeClick = (sound, accent, index) => {
        setSelectedSound({
            sound: { ...sound, type: activeTab },
            accent,
            index,
        });
    };

    const handleGoBack = () => {
        setSelectedSound(null);
        triggerReviewsUpdate();
    };

    const getReviewKey = (sound, index) => `${activeTab}${index + 1}`;

    const getBadgeColor = (sound, index) => {
        const reviewKey = getReviewKey(sound, index);
        return BADGE_COLORS[reviews[reviewKey]] || null;
    };

    const getReviewText = (review) =>
        t(`sound_page.review${review?.charAt(0).toUpperCase() + review?.slice(1)}`);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.BASE_URL}json/sounds_menu.json`);
                const data = await response.json();
                setPhonemesData(data.phonemes);
            } catch (error) {
                console.error("Error fetching menu data:", error);
                alert(t("sound_page.loadError"));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [t]);

    useEffect(() => {
        if (isElectron()) {
            document.title = `iSpeakerReact v${__APP_VERSION__}`;
        } else {
            document.title = `${t("navigation.sounds")} | iSpeakerReact v${__APP_VERSION__}`;
        }
    }, [t]);

    const filteredSounds = useMemo(() => {
        const currentTabData = phonemesData[activeTab] || [];
        return currentTabData.filter((sound) => sound[selectedAccent]);
    }, [activeTab, selectedAccent, phonemesData]);

    return (
        <>
            <TopNavBar />
            <Container>
                <h1 className="py-6 text-3xl font-bold md:text-4xl">{t("navigation.sounds")}</h1>
                {selectedSound ? (
                    <Suspense fallback={isElectron() ? null : <LoadingOverlay />}>
                        <SoundMain
                            sound={selectedSound.sound}
                            accent={selectedSound.accent}
                            phonemesData={phonemesData}
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
                                    <TabNavigation
                                        activeTab={activeTab}
                                        onTabChange={setActiveTab}
                                        scrollTo={scrollTo}
                                        t={t}
                                    />
                                    <div
                                        ref={scrollRef}
                                        className="my-4 flex flex-wrap place-items-center justify-center gap-5"
                                    >
                                        {filteredSounds.map((sound, index) => (
                                            <SoundCard
                                                key={sound.id}
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
