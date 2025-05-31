import LogoLightOrDark from "./LogoLightOrDark.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

const LoadingOverlay = () => {
    const { t } = useTranslation();
    const [showSlow, setShowSlow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowSlow(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="loading-overlay bg-base-100 fixed inset-0 z-10000 flex flex-col items-center justify-center">
            <LogoLightOrDark width={200} height={200} />
            <progress className="progress progress-primary my-12 w-80" />
            <span className="invisible">{t("loadingOverlay.loading")}</span>
            {showSlow && (
                <>
                    <div className="my-4 p-4 text-center text-base text-gray-500 dark:text-gray-400">
                        {t("loadingOverlay.slowText")}
                    </div>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => window.location.reload()}
                    >
                        <FiRefreshCw className="h-5 w-5" />
                        {t("appCrash.refreshBtn")}
                    </button>
                </>
            )}
        </div>
    );
};

export default LoadingOverlay;
