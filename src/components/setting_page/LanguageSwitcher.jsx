import { useTranslation } from "react-i18next";
import { LuExternalLink } from "react-icons/lu";
import { isElectron } from "../../utils/isElectron";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast";

// Utility function to open external links
const openExternal = (url) => {
    if (isElectron()) {
        window.electron.openExternal(url);
    } else {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.click();
    }
};

// Supported languages
const supportedLanguages = [{ code: "en", label: "English", emoji: "uk" }];
{
    /*
        The label should be in the native language (e.g., Japanese as 日本語).
        The language code must follow the ISO 639-1 standard (2 characters, e.g., "ja" for Japanese).
        Emoji follows the ISO 3166-1 standard (2 characters, e.g. "jp" for Japan).
    */
}

const LanguageSwitcher = () => {
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.setAttribute("lang", lng); // Update HTML lang attribute

        const ispeakerSettings = JSON.parse(localStorage.getItem("ispeaker")) || {};
        ispeakerSettings.language = lng;
        localStorage.setItem("ispeaker", JSON.stringify(ispeakerSettings));

        sonnerSuccessToast(t("settingPage.changeSaved"));
    };

    const currentLanguage =
        supportedLanguages.find((lang) => lang.code === i18n.language) || supportedLanguages[0];

    return (
        <div className="flex flex-row gap-x-8 gap-y-6">
            <div className="flex basis-1/2 items-center">
                <p className="text-base font-semibold">
                    {t("settingPage.languageSettings.languageOption")}
                </p>
            </div>
            <div className="flex flex-grow basis-1/2 justify-end">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn">
                        <img
                            src={`${import.meta.env.BASE_URL}images/ispeaker/country_emojis/${currentLanguage.emoji}.svg`}
                            alt={currentLanguage.label}
                            className="h-5 w-5"
                        />
                        {currentLanguage.label}
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu dropdown-content z-[300] w-52 rounded-box border-slate-50 bg-base-100 p-2 shadow-md"
                    >
                        {supportedLanguages.map((lang) => (
                            <li key={lang.code}>
                                <button
                                    type="button"
                                    className={`btn btn-ghost btn-sm btn-block justify-start ${
                                        i18n.language === lang.code ? "btn-active" : ""
                                    }`}
                                    onClick={() => handleLanguageChange(lang.code)}
                                >
                                    <img
                                        src={`${import.meta.env.BASE_URL}images/ispeaker/country_emojis/${lang.emoji}.svg`}
                                        alt={lang.label}
                                        className="h-5 w-5"
                                    />
                                    {lang.label}
                                </button>
                            </li>
                        ))}
                        <li>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm btn-block justify-start"
                                onClick={() =>
                                    openExternal(
                                        "https://github.com/yllst-testing-labs/ispeakerreact/issues/18"
                                    )
                                }
                            >
                                Help us translate
                                <LuExternalLink className="h-5 w-5" />
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
