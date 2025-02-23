import { useTranslation } from "react-i18next";
import { useTheme } from "../../utils/ThemeContext/useTheme";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import { LuSunMoon } from "react-icons/lu";

const themeOptions = {
    auto: {
        labelKey: "settingPage.appearanceSettings.themeAuto",
        icon: <LuSunMoon className="h-5 w-5" />,
    },
    light: {
        labelKey: "settingPage.appearanceSettings.themeLight",
        icon: <MdOutlineLightMode className="h-5 w-5" />,
    },
    dark: {
        labelKey: "settingPage.appearanceSettings.themeDark",
        icon: <MdOutlineDarkMode className="h-5 w-5" />,
    },
};

const AppearanceSettings = () => {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();

    const handleThemeSelect = (selectedTheme) => {
        setTheme(selectedTheme);
        sonnerSuccessToast(t("settingPage.changeSaved"));
    };

    return (
        <div className="flex flex-row gap-x-8 gap-y-6">
            <div className="flex basis-1/2 items-center">
                <p className="text-base font-semibold">
                    {t("settingPage.appearanceSettings.themeOption")}
                </p>
            </div>
            <div className="flex grow basis-1/2 justify-end">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn m-1 flex items-center gap-2">
                        {themeOptions[theme]?.icon} {t(themeOptions[theme]?.labelKey)}
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu dropdown-content rounded-box bg-base-100 z-300 w-52 border-slate-50 p-2 shadow-md"
                    >
                        {Object.entries(themeOptions).map(([key, { labelKey, icon }]) => (
                            <li key={key}>
                                <a
                                    type="button"
                                    onClick={() => handleThemeSelect(key)}
                                    className={`${theme === key ? "menu-active" : ""} flex items-center justify-start gap-2`}
                                    aria-pressed={theme === key}
                                >
                                    {icon} {t(labelKey)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;
