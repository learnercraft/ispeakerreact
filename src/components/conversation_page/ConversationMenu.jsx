import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoInformationCircleOutline } from "react-icons/io5";
import Container from "../../ui/Container";
import AccentLocalStorage from "../../utils/AccentLocalStorage";
import AccentDropdown from "../general/AccentDropdown";
import LoadingOverlay from "../general/LoadingOverlay";
import TopNavBar from "../general/TopNavBar";

const ConversationDetailPage = lazy(() => import("./ConversationDetailPage"));

const ConversationListPage = () => {
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccent, setSelectedAccent] = AccentLocalStorage();
    const [selectedConversation, setSelectedConversation] = useState(null);

    // Modal state
    const modalRef = useRef(null);
    const [modalInfo, setModalInfo] = useState(null);

    // Handle showing the modal
    const handleShowModal = (info) => {
        setModalInfo(info);
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        if (modalRef.current) {
            modalRef.current.close();
        }
        setModalInfo(null);
    };

    const handleSelectConversation = (id, title) => {
        const selected = data.find((section) => section.titles.some((item) => item.id === id));
        if (selected) {
            setSelectedConversation({
                id,
                title,
                heading: selected.heading,
            });
        }
    };

    const TooltipIcon = ({ info, onClick }) => (
        <>
            {/* Tooltip for larger screens */}
            <div
                className="tooltip tooltip-secondary hidden dark:tooltip-accent sm:inline"
                data-tip={info}
            >
                <IoInformationCircleOutline className="h-5 w-5 cursor-pointer hover:text-primary dark:hover:text-accent" />
            </div>

            {/* Modal trigger button for small screens */}
            <button
                type="button"
                title={t("conversationPage.expandInfoBtn")}
                className="btn btn-circle btn-sm focus:ring-2 sm:hidden"
                onClick={onClick}
            >
                <IoInformationCircleOutline className="h-5 w-5 cursor-pointer" />
            </button>
        </>
    );

    const ConversationCard = ({ heading, titles, onShowModal }) => (
        <div className="card card-lg card-border flex h-auto w-full flex-col justify-between shadow-md md:w-1/3 lg:w-1/4 dark:border-slate-600">
            <div className="card-body grow">
                <div className="card-title font-semibold">{t(heading)}</div>
                <div className="divider divider-secondary m-0"></div>
                {titles.map(({ title, id, info }, index) => (
                    <div key={index} className="mb-2 flex items-center space-x-2">
                        <a
                            className="link hover:link-primary dark:hover:link-accent"
                            onClick={() => handleSelectConversation(id, title)}
                        >
                            {t(title)}
                        </a>
                        <TooltipIcon info={t(info)} onClick={() => onShowModal(t(info))} />
                    </div>
                ))}
            </div>
        </div>
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch from network
                const response = await fetch(
                    `${import.meta.env.BASE_URL}json/conversation_list.json`
                );
                const fetchedData = await response.json();

                setData(fetchedData.conversationList);
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
        const storedData = JSON.parse(localStorage.getItem("ispeaker")) || {};
        localStorage.setItem("ispeaker", JSON.stringify({ ...storedData, selectedAccent }));
    }, [selectedAccent]);

    useEffect(() => {
        document.title = `${t("navigation.conversations")} | iSpeakerReact v${__APP_VERSION__}`;
    }, [t]);

    return (
        <>
            <TopNavBar />
            <Container>
                <h1 className="py-6 text-3xl font-bold md:text-4xl">
                    {t("navigation.conversations")}
                </h1>
                {selectedConversation ? (
                    <Suspense fallback={<LoadingOverlay />}>
                        <ConversationDetailPage
                            id={selectedConversation.id}
                            accent={selectedAccent}
                            title={selectedConversation.title}
                            onBack={() => setSelectedConversation(null)}
                        />
                    </Suspense>
                ) : (
                    <>
                        <AccentDropdown onAccentChange={setSelectedAccent} />
                        <p className="my-4">{t("conversationPage.selectType")}</p>
                        {loading ? (
                            <LoadingOverlay />
                        ) : (
                            <div className="my-10 flex flex-wrap justify-center gap-7">
                                {data.map((section, index) => (
                                    <ConversationCard
                                        key={index}
                                        heading={section.heading}
                                        titles={section.titles}
                                        onShowModal={handleShowModal}
                                    />
                                ))}
                            </div>
                        )}

                        <dialog ref={modalRef} className="modal">
                            <div className="modal-box">
                                <h3 className="text-lg font-bold">
                                    {t("conversationPage.conversationModalInfo")}
                                </h3>
                                <p className="py-4">{modalInfo}</p>
                                <div className="modal-action">
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={handleCloseModal}
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

export default ConversationListPage;
