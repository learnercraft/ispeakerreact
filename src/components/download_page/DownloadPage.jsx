import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
                <div className="relative isolate px-6 pt-14 lg:px-8">
                    <div className="mx-auto max-w-2xl py-20">
                        <div className="mb-8 flex justify-center">
                            <img
                                className="object-contain"
                                src={`${import.meta.env.BASE_URL}images/icons/windows11/StoreLogo.scale-200.png`}
                                alt="App logo"
                            />
                        </div>
                        <div className="text-center">
                            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
                                {t("downloadPage.titleMain")}
                            </h1>
                            <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-slate-400">
                                {t("downloadPage.descriptionMain")}
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <a
                                    href="https://github.com/learnercraft/ispeakerreact/releases/latest"
                                    className="btn btn-primary btn-lg"
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
                                    className="w-24"
                                    src={`${import.meta.env.BASE_URL}images/logos/windows-logo.svg`}
                                />
                                <img
                                    alt="Apple icon"
                                    className="w-24"
                                    src={`${import.meta.env.BASE_URL}images/logos/apple-logo.svg`}
                                />
                                <img
                                    alt="Linux icon"
                                    className="w-24"
                                    src={`${import.meta.env.BASE_URL}images/logos/linux-logo.svg`}
                                />
                                <a
                                    href="https://apps.microsoft.com/detail/9nwk49glxgfp?mode=direct"
                                    target="_blank"
                                >
                                    <img
                                        src={`${import.meta.env.BASE_URL}images/logos/ms-store-badge.svg`}
                                        width="200"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}

                <div className="overflow-hidden pb-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                            <div className="lg:pt-4 lg:pr-8">
                                <div className="lg:max-w-lg">
                                    <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-slate-300">
                                        {t("downloadPage.featureMain")}
                                    </p>
                                    <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none dark:text-slate-400">
                                        {features.map((feature) => (
                                            <div key={feature.name} className="relative">
                                                <dt className="inline font-semibold text-gray-900 dark:text-slate-300">
                                                    {/*<feature.icon
                                                        aria-hidden="true"
                                                        className="absolute top-1 left-1 size-5 text-indigo-600"
                                                    />*/}
                                                    {feature.name}
                                                </dt>{" "}
                                                <dd className="inline">{feature.description}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            </div>
                            <img
                                alt="Screenshot"
                                src={`${import.meta.env.BASE_URL}images/screenshots/screenshot-00.webp`}
                                width={1920}
                                height={1080}
                                className="w-[48rem] max-w-none rounded-lg sm:w-[57rem] md:-ml-4 lg:-ml-0"
                            />
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
