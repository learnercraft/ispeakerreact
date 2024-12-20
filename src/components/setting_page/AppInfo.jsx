import { useState } from "react";
import { LuExternalLink } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { IoCloseOutline, IoInformationCircleOutline } from "react-icons/io5";

const AppInfo = () => {
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertVariant, setAlertVariant] = useState("success");
    const [currentVersion] = useState(__APP_VERSION__);

    const checkForUpdates = async () => {
        setIsLoading(true);

        if (!navigator.onLine) {
            setAlertMessage(t("alert.alertAppNoInternet"));
            setAlertVariant("alert-error");
            setAlertVisible(true);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(
                "https://api.github.com/repos/yllst-testing-labs/ispeakerreact/contents/package.json",
                {
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "iSpeakerReact-yllst-testing-labs",
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );

            const data = await response.json();

            // Check if html_url contains the expected URL
            if (
                !data.html_url ||
                !data.html_url.startsWith("https://github.com/yllst-testing-labs/ispeakerreact/")
            ) {
                window.electron.log(
                    "error",
                    "The html_url is invalid or does not match the expected repository."
                );
                throw new Error(
                    "The html_url is invalid or does not match the expected repository."
                );
            }

            // GitHub returns the content in base64 encoding, so we need to decode it
            const decodedContent = JSON.parse(atob(data.content));
            const latestVersion = decodedContent.version;

            if (latestVersion !== currentVersion) {
                setAlertMessage(t("alert.appNewVersionGitHub"));
                setAlertVariant("alert-success");
                setAlertVisible(true);
            } else {
                setAlertMessage(t("alert.appVersionLatest"));
                setAlertVariant("alert-info");
                setAlertVisible(true);
            }
        } catch (error) {
            console.error("Failed to fetch version:", error);
            window.electron.log("error", `Failed to fetch version. ${error}`);
            setAlertMessage(t("alert.appUpdateError"));
            setAlertVariant("alert-error");
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    const openGithubPage = () => {
        window.electron.openExternal(
            "https://github.com/yllst-testing-labs/ispeakerreact/releases/latest"
        );
    };

    const openMsStore = () => {
        window.electron.openExternal("ms-windows-store://pdp/?productid=9NWK49GLXGFP");
    };

    return (
        <div className="mt-4">
            {alertVisible && (
                <div role="alert" className={`alert mb-4 ${alertVariant}`}>
                    <IoInformationCircleOutline className="h-6 w-6" />
                    {alertMessage.includes("GitHub") ? (
                        <>
                            <p>{alertMessage}</p>
                            <button className="btn btn-accent btn-sm" onClick={openGithubPage}>
                                {t("settingPage.openGitHubAlertLink")}
                            </button>
                        </>
                    ) : (
                        alertMessage
                    )}
                    <div>
                        <button
                            className="btn btn-circle btn-ghost btn-sm"
                            onClick={() => setAlertVisible(false)}
                        >
                            <IoCloseOutline className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}
            <div className="flex gap-4">
                <div className="flex items-center justify-center">
                    <img
                        className="object-contain"
                        src={`${import.meta.env.BASE_URL}images/icons/windows11/StoreLogo.scale-200.png`}
                        alt="App logo"
                    />
                </div>
                <div className="h-full">
                    <h4 className="text-xl font-semibold">iSpeakerReact</h4>
                    <p className="mb-2 text-slate-600 dark:text-slate-400">
                        Version {currentVersion}
                    </p>
                    {window.electron.isUwp() ? (
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={openMsStore}
                        >
                            {t("settingPage.checkUpdateMSBtn")}{" "}
                            <LuExternalLink className="h-5 w-5" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={checkForUpdates}
                        >
                            {isLoading && <div className="loading loading-spinner loading-sm" />}
                            {t("settingPage.checkUpdateBtn")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppInfo;
