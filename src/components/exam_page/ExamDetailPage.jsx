import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoChevronBackOutline, IoInformationCircleOutline } from "react-icons/io5";
import { MdChecklist, MdHeadphones, MdKeyboardVoice, MdOutlineOndemandVideo } from "react-icons/md";
import { isElectron } from "../../utils/isElectron";
import { sonnerErrorToast } from "../../utils/sonnerCustomToast";
import { useScrollTo } from "../../utils/useScrollTo";
import LoadingOverlay from "../general/LoadingOverlay";
import ListeningTab from "./ListeningTab";
import PracticeTab from "./PracticeTab";
import ReviewTab from "./ReviewTab";
import WatchAndStudyTab from "./WatchAndStudyTab";

const ExamDetailPage = ({ id, title, onBack, accent }) => {
    const { t } = useTranslation();
    const { ref: scrollRef, scrollTo } = useScrollTo();

    const [activeTab, setActiveTab] = useState("watchStudyTab");
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [videoUrl, setVideoUrl] = useState(null);
    const [videoLoading, setVideoLoading] = useState(true);
    const [port, setPort] = useState(null);

    const examMainInfoModal = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // If not in IndexedDB or running in Electron, fetch from the network
                const response = await fetch(
                    `${import.meta.env.BASE_URL}json/examspeaking_data.json`
                );
                const data = await response.json();

                setExamData(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                alert(
                    "Error while loading the data for this section. Please check your Internet connection."
                );
            }
        };
        fetchData();
    }, []);

    // Fetch the dynamic port if running in Electron
    useEffect(() => {
        const fetchPort = async () => {
            if (window.electron?.ipcRenderer) {
                const dynamicPort = await window.electron.ipcRenderer.invoke("get-port");
                setPort(dynamicPort);
            }
        };
        fetchPort();
    }, []);

    // Use offline file if running in Electron
    useEffect(() => {
        const fetchVideoUrl = async () => {
            if (isElectron() && examData && examData[id] && port) {
                const videoFileName = examData[id].watch_and_study.offlineFile;
                const folderName = "iSpeakerReact_ExamVideos";
                const videoStreamUrl = `http://localhost:${port}/video/${folderName}/${videoFileName}`;
                try {
                    // Make a HEAD request to check if the local video file exists
                    const response = await fetch(videoStreamUrl, { method: "HEAD" });
                    if (response.ok) {
                        // If the file exists, set the video URL to the local file
                        setVideoUrl(videoStreamUrl);
                    } else if (response.status === 404) {
                        // If the file doesn't exist, fall back to the Vimeo link
                        throw new Error("Local video file not found");
                    }
                } catch (error) {
                    console.warn("Falling back to Vimeo due to local video file not found:", error);
                    // Fallback to Vimeo video link
                    setVideoUrl(examData[id].watch_and_study.videoLink);
                }
                setVideoLoading(false); // Video URL is now loaded (either local or Vimeo)
            } else if (examData && examData[id] && (!isElectron() || port !== null)) {
                // This is the web case where we simply use the Vimeo link
                setVideoUrl(examData[id].watch_and_study.videoLink);
                setVideoLoading(false); // Video URL for web (Vimeo or other) is set
            }
        };

        fetchVideoUrl();
    }, [examData, id, port]);

    // Check if data is still loading
    if (loading || videoLoading) {
        return <LoadingOverlay />;
    }

    // Check if examData is available
    if (!examData || !examData[id]) {
        return sonnerErrorToast(t("toast.loadingError"));
    }

    const examDetails = examData[id];

    const examLocalizedDescArray = t(examDetails.description, { returnObjects: true });

    const videoSubtitle = examData[id].watch_and_study.subtitle;
    const subtitleUrl = `${import.meta.env.BASE_URL}media/exam/subtitles/${videoSubtitle}`;

    return (
        <>
            <h3 className="mt-4 mb-2 text-2xl font-semibold">
                {t("tabConversationExam.taskCard")}: {t(title)}
                <button
                    type="button"
                    className="btn btn-circle btn-ghost btn-sm ms-1 align-middle"
                    onClick={() => examMainInfoModal.current?.showModal()}
                >
                    <IoInformationCircleOutline className="h-6 w-6" />
                </button>
            </h3>
            <p>
                {t("accent.accentSettings")}:{" "}
                {t(accent === "british" ? "accent.accentBritish" : "accent.accentAmerican")}
            </p>
            <button type="button" className="btn btn-secondary my-4" onClick={onBack}>
                <IoChevronBackOutline className="h-5 w-5" />{" "}
                {t("buttonConversationExam.examBackBtn")}
            </button>

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
                                activeTab === "watchStudyTab" ? "tab-active font-semibold" : ""
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
                                activeTab === "practiceTab" ? "tab-active font-semibold" : ""
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
                    {activeTab === "watchStudyTab" && (
                        <WatchAndStudyTab
                            videoUrl={videoUrl}
                            subtitleUrl={subtitleUrl}
                            taskData={examDetails.watch_and_study.taskData}
                            dialog={examDetails.watch_and_study.study.dialog}
                            skills={examDetails.watch_and_study.study.skills}
                            scrollTo={scrollTo}
                        />
                    )}
                    {activeTab === "listenTab" && (
                        <ListeningTab
                            subtopicsBre={examDetails.listen.BrE?.subtopics || []}
                            subtopicsAme={examDetails.listen.AmE?.subtopics || []}
                            currentAccent={accent}
                            scrollTo={scrollTo}
                        />
                    )}
                    {activeTab === "practiceTab" && (
                        <PracticeTab
                            examId={id}
                            accent={accent}
                            taskData={examDetails.practise.task}
                            tips={examDetails.practise.tips}
                            scrollTo={scrollTo}
                        />
                    )}
                    {activeTab === "reviewTab" && (
                        <ReviewTab
                            reviews={examDetails.reviews}
                            examId={id}
                            accent={accent}
                            scrollTo={scrollTo}
                        />
                    )}
                </div>
            </div>

            <dialog ref={examMainInfoModal} className="modal">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">{t("examPage.taskInfo")}</h3>
                    <div className="py-4">
                        {examLocalizedDescArray.map((desc, index) => (
                            <p
                                key={index}
                                className={
                                    index === examLocalizedDescArray.length - 1 ? "mb-0" : "mb-2"
                                }
                            >
                                {desc}
                            </p>
                        ))}
                    </div>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
};

ExamDetailPage.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    onBack: PropTypes.func.isRequired,
    accent: PropTypes.string.isRequired,
};

export default ExamDetailPage;
