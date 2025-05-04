import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const RATE_LIMIT_KEY = "github_ratelimit_timestamp";
const RATE_LIMIT_THRESHOLD = 50;

const currentVersion = __APP_VERSION__;

const VersionUpdateDialog = ({ open, onRefresh }) => {
    const { t } = useTranslation();
    const dialogRef = useRef(null);
    const [latestVersion, setLatestVersion] = useState(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open) return;

        setChecking(true);
        setError(null);
        const checkVersion = async () => {
            try {
                const now = Math.floor(Date.now() / 1000);
                const savedResetTime = localStorage.getItem(RATE_LIMIT_KEY);
                if (savedResetTime && now < parseInt(savedResetTime, 10)) {
                    setChecking(false);
                    return;
                }

                const response = await fetch(
                    "https://api.github.com/repos/yllst-testing-labs/ispeakerreact/contents/package.json",
                    {
                        headers: {
                            "User-Agent": "iSpeakerReact-yllst-testing-labs",
                            Accept: "application/vnd.github.v3+json",
                        },
                    }
                );

                if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
                const rateLimitRemaining = parseInt(
                    response.headers.get("x-ratelimit-remaining") || "0",
                    10
                );
                const rateLimitReset = parseInt(
                    response.headers.get("x-ratelimit-reset") || "0",
                    10
                );
                if (rateLimitRemaining < RATE_LIMIT_THRESHOLD && rateLimitReset) {
                    localStorage.setItem(RATE_LIMIT_KEY, (rateLimitReset + 5 * 3600).toString());
                    setChecking(false);
                    return;
                }

                const data = await response.json();
                if (!data.content) throw new Error("No content in response");
                const decodedContent = JSON.parse(atob(data.content));
                const latest = decodedContent.version;
                setLatestVersion(latest);
                setChecking(false);
            } catch (err) {
                setError(err.message);
                setChecking(false);
            }
        };
        checkVersion();
    }, [open]);

    useEffect(() => {
        if (open && dialogRef.current) {
            dialogRef.current.showModal();
        } else if (!open && dialogRef.current) {
            dialogRef.current.close();
        }
    }, [open]);

    const handleRefresh = () => {
        // Clear all caches except permanent-cache
        caches.keys().then((names) => {
            names.forEach((name) => {
                if (name !== "permanent-cache") {
                    caches.delete(name);
                }
            });
        });
        setTimeout(() => {
            onRefresh();
        }, 1000);
    };

    return (
        <dialog ref={dialogRef} className="modal">
            <div className="modal-box">
                <h3 className="text-lg font-bold">
                    {error
                        ? t("alert.appNewVersionErrorDialogTitle")
                        : t("alert.appNewVersionDialogTitle")}
                </h3>
                <div className="py-4">
                    {checking && <span className="loading loading-spinner loading-md"></span>}

                    {error ? (
                        <>
                            <p className="text-error">{t("alert.appUpdateError")}</p>
                            <p className="mt-2 text-sm">
                                {t("alert.appNewVersionErrorReason")}{" "}
                                <span className="italic">{error}</span>
                            </p>
                        </>
                    ) : (
                        <>
                            {latestVersion && (
                                <span>
                                    {t("alert.appNewVersionDialogBody", { version: latestVersion })}
                                </span>
                            )}
                            {latestVersion === currentVersion && !checking && (
                                <span>{t("alert.appVersionLatest")}</span>
                            )}
                        </>
                    )}
                </div>
                <div className="modal-action">
                    {error ? (
                        <button
                            type="button"
                            className="btn"
                            onClick={() => {
                                if (dialogRef.current) dialogRef.current.close();
                            }}
                        >
                            {t("sound_page.closeBtn")}
                        </button>
                    ) : (
                        latestVersion &&
                        latestVersion !== currentVersion && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleRefresh}
                            >
                                {t("alert.appNewVersionDialogRefreshBtn")}
                            </button>
                        )
                    )}
                </div>
            </div>
        </dialog>
    );
};

VersionUpdateDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onRefresh: PropTypes.func.isRequired,
};

export default VersionUpdateDialog;
