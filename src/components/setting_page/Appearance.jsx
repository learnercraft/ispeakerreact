import { useTranslation } from "react-i18next";
import { useTheme } from "../../utils/ThemeContext/useTheme";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast";

const AppearanceSettings = () => {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();

    const handleThemeSelect = (selectedTheme) => {
        setTheme(selectedTheme);
        sonnerSuccessToast(t("settingPage.changeSaved"));
    };

    const getThemeOptionLabel = (currentTheme) => {
        switch (currentTheme) {
            case "auto":
                return t("settingPage.appearanceSettings.themeAuto");
            case "light":
                return t("settingPage.appearanceSettings.themeLight");
            case "dark":
                return t("settingPage.appearanceSettings.themeDark");
            default:
                return t("settingPage.appearanceSettings.themeAuto");
        }
    };

    return (
        <>
            <div className="flex flex-row gap-x-8 gap-y-6">
                <div className="flex basis-1/2 items-center">
                    <p className="text-base font-semibold">
                        {t("settingPage.appearanceSettings.themeOption")}
                    </p>
                </div>
                <div className="flex flex-grow basis-1/2 justify-end">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn">
                            {getThemeOptionLabel(theme)}
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu dropdown-content z-[300] w-52 rounded-box border-slate-50 bg-base-100 p-2 shadow-md"
                        >
                            <li>
                                <button
                                    type="button"
                                    onClick={() => handleThemeSelect("light")}
                                    className={`${
                                        theme === "light" ? "btn-active" : ""
                                    } btn btn-ghost btn-sm btn-block justify-start`}
                                    aria-pressed={theme === "light"}
                                >
                                    {t("settingPage.appearanceSettings.themeLight")}
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => handleThemeSelect("dark")}
                                    className={`${
                                        theme === "dark" ? "btn-active" : ""
                                    } btn btn-ghost btn-sm btn-block justify-start`}
                                    aria-pressed={theme === "dark"}
                                >
                                    {t("settingPage.appearanceSettings.themeDark")}
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => handleThemeSelect("auto")}
                                    className={`${
                                        theme === "auto" ? "btn-active" : ""
                                    } btn btn-ghost btn-sm btn-block justify-start`}
                                    aria-pressed={theme === "auto"}
                                >
                                    {t("settingPage.appearanceSettings.themeAuto")}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AppearanceSettings;
