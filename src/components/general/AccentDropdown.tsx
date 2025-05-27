import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import AccentLocalStorage from "../../utils/AccentLocalStorage.js";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast.js";

// Emoji SVGs import
import UKFlagEmoji from "../../emojiSvg/emoji_u1f1ec_1f1e7.svg";
import USFlagEmoji from "../../emojiSvg/emoji_u1f1fa_1f1f8.svg";

const AccentDropdown = ({ onAccentChange }: { onAccentChange: (value: string) => void }) => {
    const [selectedAccent, setSelectedAccent] = AccentLocalStorage();
    const { t } = useTranslation();

    const selectedAccentOptions = [
        { name: `${t("accent.accentAmerican")}`, value: "american", emoji: USFlagEmoji },
        { name: `${t("accent.accentBritish")}`, value: "british", emoji: UKFlagEmoji },
    ];

    useEffect(() => {
        const currentSettings = JSON.parse(localStorage.getItem("ispeaker") || "{}") || {};
        const updatedSettings = { ...currentSettings, selectedAccent: selectedAccent };
        localStorage.setItem("ispeaker", JSON.stringify(updatedSettings));
    }, [selectedAccent]);

    const handleAccentChange = (value: string) => {
        setSelectedAccent(value);
        onAccentChange(value);
        sonnerSuccessToast(t("settingPage.changeSaved"));
    };

    return (
        <>
            <div className="flex items-center space-x-4">
                <p className="font-semibold">{t("accent.accentSettings")}:</p>
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-accent m-1">
                        <img
                            src={
                                selectedAccentOptions.find((item) => item.value === selectedAccent)
                                    ?.emoji
                            }
                            className="inline-block h-6 w-6"
                            title={selectedAccentOptions.find((item) => item.value === selectedAccent)?.name}
                        />
                        {selectedAccentOptions.find((item) => item.value === selectedAccent)?.name}
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu dropdown-content rounded-box bg-base-100 border-base-200 z-300 w-60 border p-2 shadow-md dark:border-slate-600"
                    >
                        {selectedAccentOptions.map((item) => (
                            <li key={item.value}>
                                <a
                                    className={`${selectedAccent === item.value ? "menu-active" : ""
                                        } justify-start`}
                                    onClick={() => handleAccentChange(item.value)}
                                >
                                    <img src={item.emoji} className="inline-block h-6 w-6" alt={item.name} />{" "}
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default AccentDropdown;
