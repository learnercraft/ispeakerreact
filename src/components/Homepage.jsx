import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Container from "../ui/Container";
import Footer from "./general/Footer";
import LogoLightOrDark from "./general/LogoLightOrDark";
import TopNavBar from "./general/TopNavBar";

function Homepage() {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
    };

    useEffect(() => {
        document.title = `${t("navigation.home")} | iSpeakerReact v${__APP_VERSION__}`;
    }, [t]);

    const cardsInfo = [
        {
            title: `${t("navigation.sounds")}`,
            description: `${t("homepage.soundDescription")}`,
            icon: `${import.meta.env.BASE_URL}images/ispeaker/menu/sound_menu_icon.svg`,
            path: "sounds",
        },
        {
            title: `${t("navigation.exercises")}`,
            description: `${t("homepage.exerciseDescription")}`,
            icon: `${import.meta.env.BASE_URL}images/ispeaker/menu/exercise_menu_icon.svg`,
            path: "exercises",
        },
        {
            title: `${t("navigation.conversations")}`,
            description: `${t("homepage.conversationDescription")}`,
            icon: `${import.meta.env.BASE_URL}images/ispeaker/menu/conversation_menu_icon.svg`,
            path: "conversations",
        },
        {
            title: `${t("navigation.exams")}`,
            description: `${t("homepage.examDescription")}`,
            icon: `${import.meta.env.BASE_URL}images/ispeaker/menu/exam_menu_icon.svg`,
            path: "exams",
        },
        {
            title: `${t("navigation.settings")}`,
            description: `${t("homepage.settingDescription")}`,
            icon: `${import.meta.env.BASE_URL}images/ispeaker/menu/settings_menu_icon.svg`,
            path: "settings",
        },
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <TopNavBar />
            <Container>
                <div className="mb-4 p-6">
                    <div className="flex items-center justify-center space-x-4">
                        <LogoLightOrDark width="64" height="64" />
                        <h1 className="text-3xl font-bold md:text-4xl">iSpeakerReact</h1>
                    </div>
                    <p className="mt-2 text-center">v{__APP_VERSION__}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-5">
                    {cardsInfo.map((card, idx) => (
                        <div
                            key={idx}
                            className="card card-bordered flex h-auto w-full flex-col justify-between pb-6 shadow-md sm:w-1/2 lg:w-1/4 dark:border-slate-600"
                        >
                            <figure className="px-10 pt-10">
                                <img
                                    alt={`${card.title} section icon`}
                                    className="w-24"
                                    src={card.icon}
                                />
                            </figure>
                            <div className="card-body flex-grow items-center text-center">
                                <h2 className="card-title">{card.title}</h2>
                                <p>{card.description}</p>
                            </div>
                            <div className="card-actions px-6">
                                <button
                                    type="button"
                                    className="btn btn-primary w-full"
                                    onClick={() => handleNavigate(card.path)}
                                    aria-label={`Open the ${card.title} section`}
                                >
                                    {t("homepage.openBtn")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
            <Footer />
        </>
    );
}

export default Homepage;
