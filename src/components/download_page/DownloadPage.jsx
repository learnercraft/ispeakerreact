import { useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import Container from "../../ui/Container";
import Footer from "../general/Footer";
import TopNavBar from "../general/TopNavBar";

const DownloadPage = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        document.title = `${t("navigation.download")} | iSpeakerReact v${__APP_VERSION__}`;
    }, [t]);

    const features = [
        {
            name: t("downloadPage.featureOfflineText"),
            description: t("downloadPage.featureOfflineDesc"),
            //icon: CloudArrowUpIcon,
        },
        {
            name: t("downloadPage.featureVideoDownloadText"),
            description: t("downloadPage.featureVideoDownloadDesc"),
            //icon: LockClosedIcon,
        },
        {
            name: t("downloadPage.featurePronunciationCheckerText"),
            description: t("downloadPage.featurePronunciationCheckerDesc"),
            desktopOnly: true,
        },
        {
            name: t("downloadPage.featureSameContentText"),
            description: t("downloadPage.featureSameContentDesc"),
            //icon: LockClosedIcon,
        },
    ];

    const faqItems = [
        {
            questionKey: "faqSystemReqTitle",
            answerKey: "faqSystemReqAnswer",
        },
        {
            questionKey: "faqCheckUpdatesTitle",
            answerKey: "faqCheckUpdatesAnswer",
        },
        {
            questionKey: "faqIsFreeTitle",
            answerKey: "faqIsFreeAnswer",
        },
    ];

    return (
        <>
            <TopNavBar />
            <Container>
                {/* Hero Section with Gradient */}
                <div className="animate-fade-in relative isolate rounded-3xl bg-gradient-to-br from-blue-100 via-indigo-100 to-white px-6 pt-14 shadow-lg lg:px-8 dark:bg-gradient-to-br dark:from-indigo-900 dark:via-blue-900 dark:to-purple-900 dark:bg-blend-multiply">
                    <div className="mx-auto max-w-2xl py-20">
                        <div className="mb-8 flex justify-center">
                            <img
                                className="scale-110 object-contain drop-shadow-xl transition-transform duration-300 hover:scale-125"
                                src={`${import.meta.env.BASE_URL}images/icons/windows11/StoreLogo.scale-200.png`}
                                alt="App logo"
                            />
                        </div>
                        <div className="text-center">
                            <h1 className="animate-fade-in bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 bg-clip-text text-4xl font-extrabold tracking-tight text-balance text-transparent md:text-6xl dark:bg-gradient-to-r dark:from-orange-300 dark:via-green-300 dark:to-red-500 dark:bg-clip-text dark:text-transparent">
                                {t("downloadPage.titleMain")}
                            </h1>
                            <p className="animate-fade-in mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-slate-300">
                                {t("downloadPage.descriptionMain")}
                            </p>
                            <div className="animate-fade-in mt-10 flex items-center justify-center gap-x-6">
                                <a
                                    href="https://github.com/learnercraft/ispeakerreact/releases/latest"
                                    className="btn btn-primary btn-lg shadow-lg transition-transform duration-200 hover:scale-105"
                                    target="_blank"
                                >
                                    {t("downloadPage.downloadBtn")}
                                </a>
                            </div>
                            <div className="mt-10 items-center">
                                <p className="text-lg">{t("downloadPage.availablePlatformText")}</p>
                            </div>
                            <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
                                <img
                                    alt="Windows icon"
                                    className="w-24 transition-transform duration-200 hover:scale-110"
                                    src={`${import.meta.env.BASE_URL}images/logos/windows-logo.svg`}
                                />
                                <img
                                    alt="Apple icon"
                                    className="w-24 transition-transform duration-200 hover:scale-110"
                                    src={`${import.meta.env.BASE_URL}images/logos/apple-logo.svg`}
                                />
                                <img
                                    alt="Linux icon"
                                    className="w-24 transition-transform duration-200 hover:scale-110"
                                    src={`${import.meta.env.BASE_URL}images/logos/linux-logo.svg`}
                                />
                                <a
                                    href="https://apps.microsoft.com/detail/9nwk49glxgfp?mode=direct"
                                    target="_blank"
                                >
                                    <img
                                        src={`${import.meta.env.BASE_URL}images/logos/ms-store-badge.svg`}
                                        width="200"
                                        className="transition-transform duration-200 hover:scale-105"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pronunciation Checker Highlight */}
                <div className="animate-fade-in mt-12 flex justify-center">
                    <div className="card bg-base-100 border-primary/20 w-full max-w-2xl border shadow-xl">
                        <div className="card-body items-center text-center">
                            <div className="mb-2 flex items-center gap-2">
                                <span className="badge badge-accent badge-sm mr-2 animate-bounce">
                                    {t("downloadPage.newBadge")}
                                </span>
                                <span className="badge badge-primary badge-lg">
                                    {t("downloadPage.desktopOnly")}
                                </span>
                            </div>
                            <h2 className="card-title text-2xl font-bold">
                                {t("downloadPage.featurePronunciationCheckerText")}
                            </h2>
                            <p className="text-base text-gray-600 dark:text-slate-400">
                                {t("downloadPage.featurePronunciationCheckerDesc")}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                <Trans
                                    i18nKey="downloadPage.featurePronunciationCheckerDescNote"
                                    components={[
                                        <button
                                            key="python-link"
                                            type="button"
                                            className="link font-semibold underline link-info"
                                            onClick={() =>
                                                window.open(
                                                    "https://www.python.org/downloads/",
                                                    "_blank"
                                                )
                                            }
                                        />,
                                    ]}
                                />
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="animate-fade-in mt-16 overflow-hidden pb-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                            <div className="lg:pt-4 lg:pr-8">
                                <div className="lg:max-w-lg">
                                    <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-slate-300">
                                        {t("downloadPage.featureMain")}
                                    </p>
                                    <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none dark:text-slate-400">
                                        {features.map((feature) => (
                                            <div
                                                key={feature.name}
                                                className="card bg-base-200/60 relative mb-2 p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg"
                                            >
                                                <dt className="inline font-semibold text-gray-900 dark:text-slate-300">
                                                    {feature.name}
                                                    {feature.desktopOnly && (
                                                        <span className="badge badge-primary badge-sm ml-2">
                                                            {t("downloadPage.desktopOnly")}
                                                        </span>
                                                    )}
                                                </dt>{" "}
                                                <dd className="inline">{feature.description}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            </div>
                            {/* Screenshot on the right, vertically centered */}
                            <div className="flex flex-1 items-center py-8">
                                <img
                                    alt="Screenshot"
                                    src={`${import.meta.env.BASE_URL}images/screenshots/screenshot-08.webp`}
                                    width={1920}
                                    height={1080}
                                    className="w-[48rem] max-w-none rounded-lg shadow-xl transition-transform duration-300 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-12 flex items-center justify-center">
                    <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-slate-300">
                        {t("downloadPage.faq")}
                    </p>
                </div>
                <div className="mb-12 flex items-center justify-center">
                    <div className="join join-vertical w-full max-w-2xl">
                        {faqItems.map((item, idx) => (
                            <div
                                key={idx}
                                className="collapse-arrow join-item border-base-300 collapse border dark:border-slate-600"
                            >
                                <input type="checkbox" name="faq-accordion" />
                                <div className="collapse-title text-lg font-semibold">
                                    {t(`downloadPage.${item.questionKey}`)}
                                </div>
                                <div className="collapse-content text-gray-600 dark:text-slate-400">
                                    {t(`downloadPage.${item.answerKey}`)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
            <Footer />
        </>
    );
};

export default DownloadPage;
