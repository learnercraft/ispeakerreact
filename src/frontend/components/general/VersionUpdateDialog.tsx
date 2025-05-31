import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const RATE_LIMIT_KEY = "github_ratelimit_timestamp";
const RATE_LIMIT_THRESHOLD = 45;

const currentVersion = __APP_VERSION__;

const VersionUpdateDialog = ({ open, onRefresh }: { open: boolean; onRefresh: () => void }) => {
    const { t } = useTranslation();
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [latestVersion, setLatestVersion] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!open) return;

        setChecking(true);
        setError(null);

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const checkVersion = async () => {
            try {
                const now = Math.floor(Date.now() / 1000);
                const savedResetTime = localStorage.getItem(RATE_LIMIT_KEY);
                if (savedResetTime && now < parseInt(savedResetTime, 10)) {
                    const resetTime = new Date(parseInt(savedResetTime, 10) * 1000);
                    setError(
                        t("alert.rateLimitExceeded", { resetTime: resetTime.toLocaleString() })
                    );
                    setChecking(false);
                    return;
                }

                const response = await fetch(
                    "https://api.github.com/repos/learnercraft/ispeakerreact/contents/package.json",
                    {
                        headers: {
                            "User-Agent": "iSpeakerReact-learnercraft",
                            Accept: "application/vnd.github.v3+json",
                        },
                        signal, // Add abort signal
                    }
                );

                if (!response.ok) {
                    if (response.status === 403) {
                        const rateLimitReset = parseInt(
                            response.headers.get("x-ratelimit-reset") || "0",
                            10
                        );
                        const resetTime = new Date(rateLimitReset * 1000);
                        localStorage.setItem(
                            RATE_LIMIT_KEY,
                            (rateLimitReset + 5 * 3600).toString()
                        );
                        setError(
                            t("alert.rateLimitExceeded", { resetTime: resetTime.toLocaleString() })
                        );
                    } else {
                        throw new Error(`GitHub API error: ${response.status}`);
                    }
                    setChecking(false);
                    return;
                }

                const rateLimitRemaining = parseInt(
                    response.headers.get("x-ratelimit-remaining") || "0",
                    10
                );
                const rateLimitReset = parseInt(
                    response.headers.get("x-ratelimit-reset") || "0",
                    10
                );
                if (rateLimitRemaining < RATE_LIMIT_THRESHOLD && rateLimitReset) {
                    const resetTime = new Date(rateLimitReset * 1000);
                    localStorage.setItem(RATE_LIMIT_KEY, (rateLimitReset + 5 * 3600).toString());
                    setError(
                        t("alert.rateLimitExceeded", { resetTime: resetTime.toLocaleString() })
                    );
                    setChecking(false);
                    return;
                }

                const data = await response.json();
                if (!data.content) throw new Error("No content in response");
                const decodedContent = JSON.parse(atob(data.content));
                const latest = decodedContent.version;
                setLatestVersion(latest);
                setChecking(false);

                // Only show dialog if versions don't match and component is still mounted
                if (latest !== currentVersion && dialogRef.current) {
                    if (typeof dialogRef.current.showModal === 'function') {
                        dialogRef.current.showModal();
                    }
                }
            } catch (err) {
                // Only set error if it's not an abort error
                if (err instanceof Error && err.name !== "AbortError") {
                    setError(err.message);
                }
                setChecking(false);
            }
        };
        checkVersion();

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [open, t]);

    useEffect(() => {
        if (!open && dialogRef.current) {
            if (typeof dialogRef.current.close === 'function') {
                dialogRef.current.close();
            }
        }
    }, [open]);

    const handleRefresh = async () => {
        setIsRefreshing(true);

        try {
            // Clear all caches except permanent-cache
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter((name) => name !== "permanent-cache")
                    .map((name) => caches.delete(name))
            );

            // Wait for cache clearing to complete
            await new Promise((resolve) => setTimeout(resolve, 1000));

            onRefresh();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
            setIsRefreshing(false);
        }
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
                                {t("alert.appNewVersionErrorReason")} {" "}
                                <span className="italic">{error}</span>
                            </p>
                        </>
                    ) : (
                        <>
                            {isRefreshing ? (
                                <>
                                    <p>{t("alert.appNewVersionDialogChecking")}</p>
                                    <div className="mt-4">
                                        <progress className="progress progress-primary w-full"></progress>
                                    </div>
                                </>
                            ) : (
                                !checking &&
                                latestVersion && (
                                    <>
                                        {latestVersion !== currentVersion ? (
                                            <p>
                                                {t("alert.appNewVersionDialogBody", {
                                                    version: latestVersion,
                                                })}
                                            </p>
                                        ) : (
                                            <></>
                                        )}
                                    </>
                                )
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
                                if (dialogRef.current && typeof dialogRef.current.close === 'function') dialogRef.current.close();
                            }}
                        >
                            {t("sound_page.closeBtn")}
                        </button>
                    ) : (
                        latestVersion &&
                        latestVersion !== currentVersion &&
                        !isRefreshing && (
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

export default VersionUpdateDialog;
