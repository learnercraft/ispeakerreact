import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoInformationCircleOutline } from "react-icons/io5";
import Container from "../../ui/Container";
import AccentLocalStorage from "../../utils/AccentLocalStorage";
import { isElectron } from "../../utils/isElectron";
import AccentDropdown from "../general/AccentDropdown";
import LoadingOverlay from "../general/LoadingOverlay";
import TopNavBar from "../general/TopNavBar";
import ExerciseDetailPage from "./ExerciseDetailPage";

const ExercisePage = () => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccent, setSelectedAccent] = AccentLocalStorage();
    const [selectedExercise, setSelectedExercise] = useState(null);

    const modalRef = useRef(null);
    const [modalInfo, setModalInfo] = useState(null);

    const handleShowModal = (info) => {
        setModalInfo(info);
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    const handleCloseModal = () => {
        if (modalRef.current) {
            modalRef.current.close();
        }
        setModalInfo(null);
    };

    const selectedAccentOptions = [
        { name: "American English", value: "american" },
        { name: "British English", value: "british" },
    ];

    const getLocalizedTitle = (exercise) => {
        if (exercise.titleKey) {
            return t(exercise.titleKey); // Use localization for keys
        }
        return exercise.title;
    };

    const handleSelectExercise = (exercise, heading) => {
        setSelectedExercise({
            id: exercise.id,
            title: getLocalizedTitle(exercise),
            accent: selectedAccentOptions.find((item) => item.value === selectedAccent).name,
            file: exercise.file,
            heading: heading,
        });
    };

    useEffect(() => {
        if (isElectron()) {
            document.title = `iSpeakerReact v${window.__APP_VERSION__}`;
        } else {
            document.title = `${t("navigation.exercises")} | iSpeakerReact v${window.__APP_VERSION__}`;
        }
    }, [t]);

    const getInfoText = (exercise, defaultInfoKey) => {
        // If exercise has a specific infoKey, use it. Otherwise, use the general infoKey.
        return exercise.infoKey ? t(exercise.infoKey) : t(defaultInfoKey);
    };

    const TooltipIcon = ({ info, onClick }) => {
        return (
            <>
                {/* Tooltip for larger screens */}
                <div
                    className="tooltip tooltip-secondary dark:tooltip-accent hidden sm:inline"
                    data-tip={info}
                >
                    <IoInformationCircleOutline className="hover:text-primary dark:hover:text-accent h-5 w-5 cursor-pointer" />
                </div>

                {/* Modal trigger button for small screens */}
                <button
                    type="button"
                    title={t("exercise_page.buttons.expandBtn")}
                    className="btn btn-circle btn-sm focus:ring-2 sm:hidden"
                    onClick={onClick}
                >
                    <IoInformationCircleOutline className="h-5 w-5 cursor-pointer" />
                </button>
            </>
        );
    };

    const ExerciseCard = ({ heading, titles, infoKey, file, onShowModal }) => (
        <div className="card card-lg card-border flex h-auto w-full flex-col justify-between shadow-md md:w-1/3 lg:w-1/4 dark:border-slate-600">
            <div className="card-body grow">
                <div className="card-title font-semibold">{t(heading)}</div>
                <div className="divider divider-secondary m-0"></div>
                {titles
                    .filter(({ american, british }) => {
                        if (selectedAccent === "american" && american === false) return false;
                        if (selectedAccent === "british" && british === false) return false;
                        return true;
                    })
                    .map((exercise, index) => {
                        const modalId = `exerciseInfoModal-${heading}-${index}`;
                        const info = getInfoText(exercise, infoKey);

                        return (
                            <div key={index} className="mb-2 flex items-center space-x-2">
                                <a
                                    className="link hover:link-primary dark:hover:link-accent"
                                    onClick={() =>
                                        handleSelectExercise({ ...exercise, file }, heading)
                                    }
                                >
                                    {t(exercise.titleKey) || exercise.title}
                                </a>
                                <TooltipIcon
                                    info={info}
                                    modalId={modalId}
                                    onClick={() => onShowModal(info)}
                                />
                            </div>
                        );
                    })}
            </div>
        </div>
    );

    TooltipIcon.propTypes = {
        info: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
    };

    ExerciseCard.propTypes = {
        heading: PropTypes.string.isRequired,
        titles: PropTypes.arrayOf(
            PropTypes.shape({
                american: PropTypes.bool,
                british: PropTypes.bool,
                titleKey: PropTypes.string,
                title: PropTypes.string,
                infoKey: PropTypes.string,
                id: PropTypes.any,
                file: PropTypes.any,
            })
        ).isRequired,
        infoKey: PropTypes.string.isRequired,
        file: PropTypes.any,
        onShowModal: PropTypes.func.isRequired,
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // If not in IndexedDB or running in Electron, fetch from the network
                const response = await fetch(`${import.meta.env.BASE_URL}json/exercise_list.json`);
                const data = await response.json();

                setData(data.exerciseList);
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
        // Save the selected accent to localStorage
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker")) || {};
        savedSettings.selectedAccent = selectedAccent;
        localStorage.setItem("ispeaker", JSON.stringify(savedSettings));
    }, [selectedAccent]);

    const handleGoBack = () => {
        setSelectedExercise(null);
    };

    return (
        <>
            <TopNavBar />
            <Container>
                <h1 className="py-6 text-3xl font-bold md:text-4xl">{t("navigation.exercises")}</h1>
                {selectedExercise ? (
                    <ExerciseDetailPage
                        heading={selectedExercise.heading}
                        id={selectedExercise.id}
                        title={selectedExercise.title}
                        accent={selectedExercise.accent}
                        instructions={selectedExercise.instructions}
                        file={selectedExercise.file}
                        onBack={handleGoBack}
                    />
                ) : (
                    <>
                        <AccentDropdown onAccentChange={setSelectedAccent} />
                        <p className="my-4">{t("exercise_page.exerciseSubheading")}</p>
                        {loading ? (
                            <LoadingOverlay />
                        ) : (
                            <div className="my-10 flex flex-wrap justify-center gap-7">
                                {data.map((section, index) => (
                                    <ExerciseCard
                                        key={index}
                                        heading={section.heading}
                                        titles={section.titles}
                                        infoKey={section.infoKey}
                                        file={section.file}
                                        onShowModal={handleShowModal}
                                    />
                                ))}
                            </div>
                        )}

                        <dialog ref={modalRef} className="modal">
                            <div className="modal-box">
                                <h3 className="text-lg font-bold">
                                    {t("exercise_page.modalInfoHeader")}
                                </h3>
                                <p className="py-4">{modalInfo}</p>
                                <div className="modal-action">
                                    <form method="dialog">
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={handleCloseModal}
                                        >
                                            {t("sound_page.closeBtn")}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </dialog>
                    </>
                )}
            </Container>
        </>
    );
};

export default ExercisePage;
