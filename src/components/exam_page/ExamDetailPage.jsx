import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoChevronBackOutline, IoInformationCircleOutline } from "react-icons/io5";
import { MdChecklist, MdHeadphones, MdKeyboardVoice, MdOutlineOndemandVideo } from "react-icons/md";
import { isElectron } from "../../utils/isElectron";
import { sonnerErrorToast } from "../../utils/sonnerCustomToast";
import LoadingOverlay from "../general/LoadingOverlay";
import ListeningTab from "./ListeningTab";
import PracticeTab from "./PracticeTab";
import ReviewTab from "./ReviewTab";
import WatchAndStudyTab from "./WatchAndStudyTab";

const ExamDetailPage = ({ id, title, onBack, accent }) => {
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState("watchStudyTab");
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [videoUrl, setVideoUrl] = useState(null);
    const [videoLoading, setVideoLoading] = useState(true);

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

    // Use offline file if running in Electron
    useEffect(() => {
        const fetchVideoUrl = async () => {
            if (isElectron() && examData && examData[id]) {
                const videoFileName = examData[id].watch_and_study.offlineFile;
                const folderName = "iSpeakerReact_ExamVideos";

                const videoStreamUrl = `http://localhost:8998/video/${folderName}/${videoFileName}`;

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
            } else if (examData && examData[id]) {
                // This is the web case where we simply use the Vimeo link
                setVideoUrl(examData[id].watch_and_study.videoLink);
                setVideoLoading(false); // Video URL for web (Vimeo or other) is set
            }
        };

        fetchVideoUrl();
    }, [examData, id]);

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
            <h3 className="mb-2 mt-4 text-2xl font-semibold">
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

            <div className="sticky top-[calc(5rem)] z-10 bg-base-100 py-8">
                <div className="flex justify-center">
                    <ul className="menu menu-horizontal w-auto justify-center rounded-box bg-base-200 dark:bg-slate-600">
                        <li>
                            <button
                                type="button"
                                onClick={() => setActiveTab("watchStudyTab")}
                                className={`md:text-base ${
                                    activeTab === "watchStudyTab" ? "active font-semibold" : ""
                                }`}
                            >
                                <MdOutlineOndemandVideo className="h-6 w-6" />{" "}
                                {t("buttonConversationExam.watchBtn")}
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={() => setActiveTab("listenTab")}
                                className={`md:text-base ${
                                    activeTab === "listenTab" ? "active font-semibold" : ""
                                }`}
                            >
                                <MdHeadphones className="h-6 w-6" />{" "}
                                {t("buttonConversationExam.listenBtn")}
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={() => setActiveTab("practiceTab")}
                                className={`md:text-base ${
                                    activeTab === "practiceTab" ? "active font-semibold" : ""
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

            <div className="card card-bordered mb-6 w-full shadow-md dark:border-slate-600">
                <div className="card-body">
                    {activeTab === "watchStudyTab" && (
                        <WatchAndStudyTab
                            videoUrl={videoUrl}
                            subtitleUrl={subtitleUrl}
                            taskData={examDetails.watch_and_study.taskData}
                            dialog={examDetails.watch_and_study.study.dialog}
                            skills={examDetails.watch_and_study.study.skills}
                        />
                    )}
                    {activeTab === "listenTab" && (
                        <ListeningTab
                            subtopicsBre={examDetails.listen.BrE?.subtopics || []}
                            subtopicsAme={examDetails.listen.AmE?.subtopics || []}
                            currentAccent={accent}
                        />
                    )}
                    {activeTab === "practiceTab" && (
                        <PracticeTab
                            examId={id}
                            accent={accent}
                            taskData={examDetails.practise.task}
                            tips={examDetails.practise.tips}
                        />
                    )}
                    {activeTab === "reviewTab" && (
                        <ReviewTab reviews={examDetails.reviews} examId={id} accent={accent} />
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

export default ExamDetailPage;
