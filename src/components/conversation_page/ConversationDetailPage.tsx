import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoChevronBackOutline } from "react-icons/io5";
import { MdChecklist, MdHeadphones, MdKeyboardVoice, MdOutlineOndemandVideo } from "react-icons/md";
import isElectron from "../../utils/isElectron.js";
import useScrollTo from "../../utils/useScrollTo.js";
import LoadingOverlay from "../general/LoadingOverlay.js";
import ListeningTab from "./ListeningTab.js";
import PracticeTab from "./PracticeTab.js";
import ReviewTab from "./ReviewTab.js";
import WatchAndStudyTab from "./WatchAndStudyTab.js";

// Types from tab components
interface Sentence {
    audioSrc: string;
    sentence: string;
}

interface Subtopic {
    title: string;
    sentences: Sentence[];
}

interface DialogLine {
    speaker: string;
    speech: string;
}

interface SkillCheckmark {
    label: string;
}

interface Review {
    text: string;
}

interface WatchAndStudy {
    study: {
        dialog: DialogLine[];
        skill_checkmark: SkillCheckmark[];
    };
    videoLink: string;
    offlineFile: string;
    subtitle: string;
}

interface AccentData {
    listen: {
        subtopics: Subtopic[];
    };
    reviews: Review[];
    watch_and_study: WatchAndStudy;
}

export interface ConversationDetailPageProps {
    id: string | number;
    accent: string;
    title: string;
    onBack: () => void;
}

const ConversationDetailPage = ({ id, accent, title, onBack }: ConversationDetailPageProps) => {
    const { t } = useTranslation();
    const { ref: scrollRef, scrollTo } = useScrollTo();

    const [activeTab, setActiveTab] = useState<
        "watchStudyTab" | "listenTab" | "practiceTab" | "reviewTab"
    >("watchStudyTab");
    const [loading, setLoading] = useState<boolean>(true);
    const [accentData, setAccentData] = useState<AccentData | null>(null);

    const [videoUrl, setVideoUrl] = useState<string>("");
    const [videoLoading, setVideoLoading] = useState<boolean>(true);
    const [port, setPort] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `${import.meta.env.BASE_URL}json/conversation_data.json`
                );
                const data = await response.json();

                // Find the correct conversation data in the array based on the ID
                const conversationData = data[id]?.[0];

                if (conversationData) {
                    const accentData: AccentData =
                        conversationData[accent === "british" ? "BrE" : "AmE"];
                    setAccentData(accentData); // Set the accent-specific data

                    setLoading(false);
                } else {
                    console.error("Conversation not found.");
                    setLoading(false);
                    return;
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                alert(
                    "Error while loading the data for this section. Please check your Internet connection."
                );
            }
        };
        fetchData();
    }, [id, accent]);

    // Fetch the dynamic port if running in Electron
    useEffect(() => {
        const fetchPort = async () => {
            const electron = (
                window as unknown as {
                    electron?: { ipcRenderer?: { invoke: (channel: string) => Promise<unknown> } };
                }
            ).electron;
            if (electron?.ipcRenderer) {
                const dynamicPort = await electron.ipcRenderer.invoke("get-port");
                setPort(Number(dynamicPort));
            }
        };
        fetchPort();
    }, []);

    // Use offline file if running in Electron
    useEffect(() => {
        const fetchVideoUrl = async () => {
            if (isElectron() && accentData && port) {
                const accentVideoData = accent === "british" ? "GB" : "US";
                const videoFileName = accentData.watch_and_study.offlineFile;
                const folderName = `iSpeakerReact_ConversationVideos_${accentVideoData}`;

                const videoStreamUrl = `http://localhost:${port}/video/${folderName}/${videoFileName}`;

                try {
                    const response = await fetch(videoStreamUrl, { method: "HEAD" });

                    if (response.ok) {
                        setVideoUrl(videoStreamUrl);
                    } else {
                        throw new Error("Local video file not found");
                    }
                } catch (error) {
                    console.warn("Falling back to Vimeo due to local video file not found:", error);
                    setVideoUrl(accentData.watch_and_study.videoLink);
                }
                setVideoLoading(false);
            } else if (accentData && (!isElectron() || port !== null)) {
                setVideoUrl(accentData.watch_and_study.videoLink);
                setVideoLoading(false);
            }
        };

        fetchVideoUrl();
    }, [accentData, accent, port]);

    let videoSubtitle = "";
    let subtitleUrl = "";

    if (accentData) {
        videoSubtitle = accentData.watch_and_study.subtitle;
        subtitleUrl = `${import.meta.env.BASE_URL}media/conversation/subtitles/${accent === "british" ? "gb" : "us"}/${videoSubtitle}`;
    }

    return (
        <>
            <h3 className="mt-4 mb-2 text-2xl font-semibold">
                {t("conversationPage.topicHeading")} {t(title)}
            </h3>
            <p>
                {t("accent.accentSettings")}:{" "}
                {t(accent === "british" ? "accent.accentBritish" : "accent.accentAmerican")}
            </p>
            <button type="button" className="btn btn-secondary my-4" onClick={onBack}>
                <IoChevronBackOutline className="h-5 w-5" />
                {t("buttonConversationExam.conversationBackBtn")}
            </button>
            {loading || videoLoading ? (
                <LoadingOverlay />
            ) : (
                <>
                    <div className="bg-base-100 sticky top-[calc(5rem)] z-10 py-8">
                        <div className="flex justify-center">
                            <div role="tablist" className="tabs tabs-box justify-center">
                                <a
                                    role="tab"
                                    onClick={() => {
                                        setActiveTab("watchStudyTab");
                                        scrollTo();
                                    }}
                                    className={`tab md:text-base ${
                                        activeTab === "watchStudyTab"
                                            ? "tab-active font-semibold"
                                            : ""
                                    }`}
                                >
                                    <MdOutlineOndemandVideo className="me-1 h-6 w-6" />
                                    {t("buttonConversationExam.watchBtn")}
                                </a>
                                <a
                                    role="tab"
                                    onClick={() => {
                                        setActiveTab("listenTab");
                                        scrollTo();
                                    }}
                                    className={`tab md:text-base ${
                                        activeTab === "listenTab" ? "tab-active font-semibold" : ""
                                    }`}
                                >
                                    <MdHeadphones className="me-1 h-6 w-6" />
                                    {t("buttonConversationExam.listenBtn")}
                                </a>
                                <a
                                    role="tab"
                                    onClick={() => {
                                        setActiveTab("practiceTab");
                                        scrollTo();
                                    }}
                                    className={`tab md:text-base ${
                                        activeTab === "practiceTab"
                                            ? "tab-active font-semibold"
                                            : ""
                                    }`}
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
                                    className={`tab md:text-base ${
                                        activeTab === "reviewTab" ? "tab-active font-semibold" : ""
                                    }`}
                                >
                                    <MdChecklist className="me-1 h-6 w-6" />
                                    {t("buttonConversationExam.reviewBtn")}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div
                        ref={scrollRef}
                        className="card card-lg card-border mb-6 w-full shadow-md dark:border-slate-600"
                    >
                        <div className="card-body">
                            {activeTab === "watchStudyTab" && accentData && (
                                <WatchAndStudyTab
                                    videoUrl={videoUrl}
                                    subtitleUrl={subtitleUrl}
                                    dialog={accentData.watch_and_study.study.dialog}
                                    skillCheckmark={
                                        accentData.watch_and_study.study.skill_checkmark
                                    }
                                />
                            )}

                            {activeTab === "listenTab" && accentData && (
                                <ListeningTab sentences={accentData.listen.subtopics} />
                            )}

                            {activeTab === "practiceTab" && accentData && (
                                <PracticeTab accent={accent} conversationId={id} />
                            )}

                            {activeTab === "reviewTab" && accentData && (
                                <ReviewTab
                                    reviews={accentData.reviews}
                                    accent={accent}
                                    conversationId={id}
                                />
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default ConversationDetailPage;
