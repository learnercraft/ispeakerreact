import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoInformationCircleOutline } from "react-icons/io5";
import Container from "../../ui/Container.js";
import AccentLocalStorage from "../../utils/AccentLocalStorage.js";
import isElectron from "../../utils/isElectron.js";
import AccentDropdown from "../general/AccentDropdown.js";
import LoadingOverlay from "../general/LoadingOverlay.js";
import TopNavBar from "../general/TopNavBar.js";

// Types for exam list data
interface ExamTitle {
    title: string;
    id: string;
    exam_popup: string;
}

interface ExamSection {
    heading: string;
    titles: ExamTitle[];
}

interface SelectedExam {
    id: string;
    title: string;
    heading: string;
}

interface TooltipIconProps {
    exam_popup: string;
}

interface ExamCardProps {
    heading: string;
    titles: ExamTitle[];
}

const ExamDetailPage = lazy(() => import("./ExamDetailPage.js"));

const ExamPage: React.FC = () => {
    const { t } = useTranslation();

    const [data, setData] = useState<ExamSection[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedAccent, setSelectedAccent] = AccentLocalStorage();
    const [selectedExam, setSelectedExam] = useState<SelectedExam | null>(null);

    // Ref and state for modal tooltip handling
    const modalRef = useRef<HTMLDialogElement | null>(null);
    const [tooltipContent, setTooltipContent] = useState<string>("");

    const handleShowTooltip = (content: string) => {
        setTooltipContent(content);
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    const handleCloseTooltip = () => {
        if (modalRef.current) {
            modalRef.current.close();
        }
        setTooltipContent("");
    };

    const handleSelectExam = (id: string, title: string) => {
        const selected = data.find((section) => section.titles.some((item) => item.id === id));
        if (selected) {
            setSelectedExam({
                id,
                title,
                heading: selected.heading,
            });
        }
    };

    const TooltipIcon: React.FC<TooltipIconProps> = ({ exam_popup }: TooltipIconProps) => {
        const lines = t(exam_popup, { returnObjects: true }) as string | string[];
        const tooltipArray = Array.isArray(lines) ? lines : [lines];
        const tooltipText = tooltipArray.map((line, index) => <p key={index}>{line}</p>);
        const tooltipString = tooltipArray.join("\n");

        return (
            <>
                <div
                    className="tooltip tooltip-secondary dark:tooltip-accent hidden sm:inline"
                    data-tip=""
                >
                    <div className="tooltip-content">{tooltipText}</div>
                    <IoInformationCircleOutline className="hover:text-primary dark:hover:text-accent h-5 w-5 cursor-pointer" />
                </div>

                {/* Modal trigger button for small screens */}
                <button
                    type="button"
                    title={t("examPage.expandInfoBtn")}
                    className="btn btn-circle btn-sm items-center sm:hidden"
                    onClick={() => handleShowTooltip(tooltipString)}
                >
                    <IoInformationCircleOutline className="h-5 w-5" />
                </button>
            </>
        );
    };

    const ExamCard: React.FC<ExamCardProps> = ({ heading, titles }: ExamCardProps) => (
        <div className="card card-lg card-border flex h-auto w-full flex-col justify-between shadow-md md:w-1/3 lg:w-1/4 dark:border-slate-600">
            <div className="card-body grow">
                <div className="card-title font-semibold">{t(heading)}</div>
                <div className="divider divider-secondary m-0"></div>
                {titles.map(({ title, exam_popup, id }, index) => (
                    <div key={index} className="mb-2 flex items-center gap-2 align-middle">
                        <a
                            className="link hover:link-primary dark:hover:link-accent"
                            onClick={() => handleSelectExam(id, title)}
                        >
                            {t(title)}
                        </a>
                        <TooltipIcon exam_popup={exam_popup} />
                    </div>
                ))}
            </div>
        </div>
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `${import.meta.env.BASE_URL}json/examspeaking_list.json`
                );
                const fetchedData = await response.json();

                setData(fetchedData.examList as ExamSection[]);
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

    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker") || "{}") || {};
        savedSettings.selectedAccent = selectedAccent;
        localStorage.setItem("ispeaker", JSON.stringify(savedSettings));
    }, [selectedAccent]);

    useEffect(() => {
        if (isElectron()) {
            document.title = `iSpeakerReact v${__APP_VERSION__}`;
        } else {
            document.title = `${t("navigation.exams")} | iSpeakerReact v${__APP_VERSION__}`;
        }
    }, [t]);

    return (
        <>
            <TopNavBar />
            <Container>
                <h1 className="py-6 text-3xl font-bold md:text-4xl">{t("navigation.exams")}</h1>
                {selectedExam ? (
                    <Suspense fallback={<LoadingOverlay />}>
                        <ExamDetailPage
                            id={selectedExam.id}
                            accent={selectedAccent}
                            title={selectedExam.title}
                            onBack={() => setSelectedExam(null)}
                        />
                    </Suspense>
                ) : (
                    <>
                        <AccentDropdown onAccentChange={setSelectedAccent} />
                        <p className="my-4">{t("examPage.selectType")}</p>
                        {loading ? (
                            <LoadingOverlay />
                        ) : (
                            <div className="my-10 flex flex-wrap justify-center gap-7">
                                {data.map((section, index) => (
                                    <ExamCard
                                        key={index}
                                        heading={section.heading}
                                        titles={section.titles}
                                    />
                                ))}
                            </div>
                        )}
                        {/* Tooltip Modal */}
                        <dialog ref={modalRef} className="modal">
                            <div className="modal-box">
                                <h3 className="text-lg font-bold">{t("examPage.examModalInfo")}</h3>
                                <div className="py-4">
                                    {tooltipContent.split("\n").map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                                <div className="modal-action">
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={handleCloseTooltip}
                                    >
                                        {t("sound_page.closeBtn")}
                                    </button>
                                </div>
                            </div>
                        </dialog>
                    </>
                )}
            </Container>
        </>
    );
};

export default ExamPage;
