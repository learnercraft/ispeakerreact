import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoInformationCircleOutline } from "react-icons/io5";
import Container from "../../ui/Container";
import AccentLocalStorage from "../../utils/AccentLocalStorage";
import { useScrollTo } from "../../utils/useScrollTo";
import AccentDropdown from "../general/AccentDropdown";
import TopNavBar from "../general/TopNavBar";
import Pagination from "./Pagination";
import WordDetails from "./WordDetails";

const PronunciationPractice = () => {
    const { t } = useTranslation();
    const { ref: scrollRef, scrollTo } = useScrollTo();

    const [activeTab, setActiveTab] = useState("oxford3000");
    const [words, setWords] = useState([]);
    const [reviewData, setReviewData] = useState({});
    const [accent, setAccent] = AccentLocalStorage();
    const [loading, setLoading] = useState(false);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 18;

    // View state
    const [viewState, setViewState] = useState("list");
    const [selectedWord, setSelectedWord] = useState(null);

    // Derived data
    const filteredWords = words.filter(
        (word) =>
            (word.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                word.nameUS?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                !searchQuery) &&
            (selectedLevel ? word.level.includes(selectedLevel) : true)
    );

    // Derived pagination values
    const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentWords = filteredWords.slice(startIndex, endIndex);

    useEffect(() => {
        const fetchWords = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    activeTab === "oxford3000"
                        ? `${import.meta.env.BASE_URL}json/oxford-3000.json`
                        : `${import.meta.env.BASE_URL}json/oxford-5000.json`
                );
                const data = await response.json();
                setWords(data);
            } catch (error) {
                console.error("Error fetching word data:", error);
            } finally {
                setLoading(false);
                setCurrentPage(1);
            }
        };

        fetchWords();
    }, [activeTab]);

    useEffect(() => {
        document.title = `${t("navigation.words")} | iSpeakerReact v${__APP_VERSION__}`;
    }, [t]);

    // Load review data from localStorage
    useEffect(() => {
        updateReviewData();
    }, []);

    // Reset to first page when search query or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedLevel]);

    const handlePractice = (word) => {
        setSelectedWord(word);
        setViewState("details");
    };

    // Handle back navigation
    const handleBack = () => {
        setSelectedWord(null);
        setViewState("list");
    };

    const handleAccentChange = (newAccent) => {
        setAccent(newAccent); // Update the accent
    };

    const getBadgeClass = (review) => {
        switch (review) {
            case "good":
                return "badge badge-success";
            case "neutral":
                return "badge badge-warning";
            case "bad":
                return "badge badge-error";
            default:
                return "";
        }
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

    const updateReviewData = () => {
        const storedData = JSON.parse(localStorage.getItem("ispeaker")) || {};
        setReviewData(storedData.wordReview || {});
    };

    return (
        <>
            <TopNavBar />
            <Container>
                <h1 className="py-6 text-3xl font-bold md:text-4xl">{t("navigation.words")}</h1>
                <AccentDropdown onAccentChange={handleAccentChange} />
                {viewState === "list" && (
                    <>
                        {/* Tabs for switching data */}
                        <div className="bg-base-100 sticky top-[calc(5rem)] z-10 py-8">
                            <div className="flex justify-center">
                                <div role="tablist" className="tabs tabs-box">
                                    <a
                                        role="tab"
                                        onClick={() => setActiveTab("oxford3000")}
                                        className={`md:text-base tab ${
                                            activeTab === "oxford3000"
                                                ? "tab-active font-semibold"
                                                : ""
                                        }`}
                                    >
                                        Oxford 3000
                                        <div
                                            className="tooltip tooltip-secondary font-normal"
                                            data-tip={t("wordPage.oxford3000Description")}
                                        >
                                            <IoInformationCircleOutline className="ms-1 h-5 w-5 cursor-pointer" />
                                        </div>
                                    </a>
                                    <a
                                        role="tab"
                                        className={`md:text-base tab ${
                                            activeTab === "oxford5000"
                                                ? "tab-active font-semibold"
                                                : ""
                                        }`}
                                        onClick={() => setActiveTab("oxford5000")}
                                    >
                                        Oxford 5000
                                        <div
                                            className="tooltip tooltip-left tooltip-secondary md:tooltip-top font-normal"
                                            data-tip={t("wordPage.oxford5000Description")}
                                        >
                                            <IoInformationCircleOutline className="ms-1 h-5 w-5 cursor-pointer" />
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-wrap items-center justify-center space-x-4">
                                <input
                                    type="text"
                                    placeholder={t("wordPage.searchBox")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input input-bordered w-1/2 max-w-xs basis-1/2"
                                />
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="select select-bordered w-1/2 max-w-xs basis-1/3"
                                >
                                    <option value="">{t("wordPage.allLevelSelectBox")}</option>
                                    <option value="a1">A1</option>
                                    <option value="a2">A2</option>
                                    <option value="b1">B1</option>
                                    <option value="b2">B2</option>
                                    <option value="c1">C1</option>
                                </select>
                            </div>
                        </div>

                        {filteredWords.length > 0 && !loading && (
                            <div ref={scrollRef}>
                                <Pagination
                                    t={t}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    scrollTo={scrollTo}
                                />
                            </div>
                        )}

                        {/* Content Area */}
                        {loading ? (
                            <div className="col-span-full text-center">
                                <p className="text-lg font-semibold">{t("wordPage.loadingText")}</p>
                            </div>
                        ) : currentWords.length > 0 ? (
                            <div className="my-4 flex flex-row flex-wrap place-items-center justify-center gap-5">
                                {currentWords.map((word) => {
                                    const wordReview = reviewData[accent]?.[word.name] || null;
                                    const wordReviewText = getReviewText(wordReview);
                                    const wordAccent =
                                        accent === "american" && word.nameUS
                                            ? word.nameUS
                                            : word.name;
                                    return (
                                        <div key={word.wordId}>
                                            <div className="indicator my-4">
                                                {wordReview && (
                                                    <span
                                                        className={`${getBadgeClass(
                                                            wordReview
                                                        )} indicator-item indicator-center`}
                                                    >
                                                        {wordReviewText}
                                                    </span>
                                                )}
                                                <div className="card card-lg card-border flex h-auto w-36 justify-between pb-6 break-words shadow-md md:w-48 dark:border-slate-600">
                                                    <div className="card-body grow items-center text-center">
                                                        <h2
                                                            className="card-title break-words hyphens-auto"
                                                            lang="en"
                                                        >
                                                            {wordAccent}
                                                        </h2>
                                                        <p className="italic" lang="en">
                                                            {word.pos.join(", ")}
                                                        </p>
                                                        <div className="space-x-2">
                                                            {word.level.map((wordLevel, id) => (
                                                                <span
                                                                    key={id}
                                                                    className="badge badge-outline font-semibold"
                                                                    lang="en"
                                                                >
                                                                    {wordLevel.toUpperCase()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="card-actions px-6">
                                                        <button
                                                            className="btn btn-primary w-full"
                                                            onClick={() => {
                                                                handlePractice(word);
                                                                scrollTo();
                                                            }}
                                                        >
                                                            {t("sound_page.practiceBtn")}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="col-span-full my-6 text-center">
                                <p className="text-lg font-semibold">
                                    {t("wordPage.noResultText")}
                                </p>
                            </div>
                        )}

                        {filteredWords.length > 0 && !loading && (
                            <Pagination
                                t={t}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                scrollTo={scrollTo}
                            />
                        )}
                    </>
                )}

                {viewState === "details" && selectedWord && (
                    <WordDetails
                        word={selectedWord}
                        handleBack={handleBack}
                        t={t}
                        accent={accent}
                        onAccentChange={handleAccentChange}
                        onReviewUpdate={updateReviewData}
                        scrollTo={scrollTo}
                    />
                )}
            </Container>
        </>
    );
};

export default PronunciationPractice;
