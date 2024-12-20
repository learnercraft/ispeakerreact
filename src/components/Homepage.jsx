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
            title: "Sounds",
            description: `${t("homepage.soundDescription")}`,
            icon: `${import.meta.env.BASE_URL}images/ispeaker/menu/sound_menu_icon.svg`,
            path: "sounds",
        },
        {
            title: "Exercises",
            description: `${t("homepage.exerciseDescription")}`,
            icon: `${import.meta.env.BASE_URL}images/ispeaker/menu/exercise_menu_icon.svg`,
            path: "exercises",
        },
        {
            title: "Conversations",
            description: `${t("homepage.conversationDescription")}`,
            icon: `${import.meta.env.BASE_URL}images/ispeaker/menu/conversation_menu_icon.svg`,
            path: "conversations",
        },
        {
            title: "Exams",
            description: `${t("homepage.examDescription")}`,
            icon: `${import.meta.env.BASE_URL}images/ispeaker/menu/exam_menu_icon.svg`,
            path: "exams",
        },
        {
            title: "Settings",
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
                <div className="p-6 mb-4">
                    <div className="flex justify-center items-center space-x-4">
                        <LogoLightOrDark width="64" height="64" />
                        <h1 className="text-3xl md:text-4xl font-bold">iSpeakerReact</h1>
                    </div>
                    <p className="text-center mt-2">v{__APP_VERSION__}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-5">
                    {cardsInfo.map((card, idx) => (
                        <div
                            key={idx}
                            className="card card-bordered dark:border-slate-600 shadow-md flex flex-col justify-between h-auto pb-6 w-full sm:w-1/2 lg:w-1/4">
                            <figure className="px-10 pt-10">
                                <img alt={`${card.title} section icon`} className="w-24" src={card.icon} />
                            </figure>
                            <div className="card-body items-center text-center flex-grow">
                                <h2 className="card-title">{card.title}</h2>
                                <p>{card.description}</p>
                            </div>
                            <div className="card-actions px-6">
                                <button
                                    type="button"
                                    className="btn btn-primary w-full"
                                    onClick={() => handleNavigate(card.path)}
                                    aria-label={`Open the ${card.title} section`}>
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
