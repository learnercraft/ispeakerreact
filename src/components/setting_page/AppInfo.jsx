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

    const RATE_LIMIT_KEY = "github_ratelimit_timestamp";

    const checkForUpdates = async () => {
        // Prevent running in either development mode or Electron version
        if (process.env.NODE_ENV === "development") {
            console.warn("Dev mode detected, skipping version check.");
            setAlertMessage(t("Dev mode detected, skipping version check."));
            setAlertVisible(true);
            return;
        }
        setIsLoading(true);

        if (!navigator.onLine) {
            setAlertMessage(t("alert.alertAppNoInternet"));
            setAlertVariant("alert-error");
            setAlertVisible(true);
            setIsLoading(false);
            return;
        }

        try {
            const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
            const savedResetTime = localStorage.getItem(RATE_LIMIT_KEY);
            const resetTime = new Date(parseInt(savedResetTime, 10) * 1000).toLocaleString();

            // If a reset time is stored and it's in the future, skip API request
            if (savedResetTime && now < parseInt(savedResetTime, 10)) {
                console.warn("Skipping version check due to rate limiting.");
                setAlertMessage(t("alert.rateLimited", { time: resetTime }));
                setAlertVariant("alert-warning");
                setAlertVisible(true);
                return;
            }

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

            // Get rate limit headers
            const rateLimitRemaining = parseInt(
                response.headers.get("x-ratelimit-remaining") || "0",
                10
            );
            const rateLimitReset = parseInt(response.headers.get("x-ratelimit-reset") || "0", 10);

            // If GitHub sends a reset time, store it before proceeding
            if (rateLimitReset) {
                localStorage.setItem(RATE_LIMIT_KEY, (rateLimitReset + 5 * 3600).toString());
            }

            // If we are near the rate limit, stop further checks
            if (rateLimitRemaining < 50 && rateLimitReset) {
                console.warn(
                    `Rate limit is low (${rateLimitRemaining} remaining). Skipping update check.`
                );
                const resetTimeFirst = new Date(
                    parseInt(rateLimitReset + 5 * 3600, 10) * 1000
                ).toLocaleString();
                setAlertMessage(t("alert.rateLimited", { time: resetTimeFirst }));
                setAlertVariant("alert-warning");
                setAlertVisible(true);
                return;
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
                    <h4 lang="en" className="text-xl font-semibold">
                        iSpeakerReact
                    </h4>
                    <p lang="en" className="mb-2 text-slate-600 dark:text-slate-400">
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
