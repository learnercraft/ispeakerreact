import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast.js";

export interface TimerSettings {
    enabled: boolean;
    dictation: number;
    matchup: number;
    reordering: number;
    sound_n_spelling: number;
    sorting: number;
    odd_one_out: number;
}

// For temp input, allow numbers or empty string (for input fields)
interface TimerSettingsInput {
    enabled: boolean;
    dictation: number | "";
    matchup: number | "";
    reordering: number | "";
    sound_n_spelling: number | "";
    sorting: number | "";
    odd_one_out: number | "";
}

const defaultTimerSettings: TimerSettings = {
    enabled: false,
    dictation: 5,
    matchup: 5,
    reordering: 5,
    sound_n_spelling: 5,
    sorting: 5,
    odd_one_out: 5,
};

const ExerciseTimer = () => {
    const { t } = useTranslation();

    const savedSettings = JSON.parse(localStorage.getItem("ispeaker") || "{}");

    const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => {
        if (savedSettings && savedSettings.timerSettings) {
            return savedSettings.timerSettings;
        }
        return defaultTimerSettings;
    });

    // tempSettings allows "" for input fields
    const [tempSettings, setTempSettings] = useState<TimerSettingsInput>(timerSettings);
    const [inputEnabled, setInputEnabled] = useState(timerSettings.enabled);
    const [isValid, setIsValid] = useState(true);
    const [isModified, setIsModified] = useState(false);

    // Automatically save settings to localStorage whenever timerSettings change
    useEffect(() => {
        savedSettings.timerSettings = timerSettings;
        localStorage.setItem("ispeaker", JSON.stringify(savedSettings));
    }, [savedSettings, timerSettings]);

    const handleTimerToggle = (enabled: boolean) => {
        setTimerSettings((prev) => ({
            ...prev,
            enabled,
        }));
        setInputEnabled(enabled);
        sonnerSuccessToast(t("settingPage.changeSaved"));
    };

    // Validation function to check if the inputs are valid (0-10 numbers only)
    const validateInputs = (settings: TimerSettingsInput) => {
        return Object.entries(settings).every(([key, value]) => {
            if (key === "enabled") return true;
            return (
                value !== "" && !isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 10
            );
        });
    };

    const checkIfModified = useCallback(
        (settings: TimerSettingsInput) => {
            const storedSettings: TimerSettings =
                savedSettings.timerSettings || defaultTimerSettings;
            // Only compare numeric fields
            const keys: (keyof TimerSettings)[] = [
                "dictation",
                "matchup",
                "reordering",
                "sound_n_spelling",
                "sorting",
                "odd_one_out",
                "enabled",
            ];
            for (const key of keys) {
                if (settings[key] !== storedSettings[key]) return true;
            }
            return false;
        },
        [savedSettings]
    );

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        settingKey: keyof Omit<TimerSettings, "enabled">
    ) => {
        const { value } = e.target;
        if (/^\d*$/.test(value) && value.length <= 2) {
            setTempSettings((prev) => ({
                ...prev,
                [settingKey]: value === "" ? "" : parseInt(value, 10),
            }));
        }
    };

    const handleApply = () => {
        if (validateInputs(tempSettings)) {
            setTimerSettings((prev) => ({
                ...prev,
                ...Object.fromEntries(
                    Object.entries(tempSettings).map(([k, v]) => [k, v === "" ? 0 : v])
                ),
                enabled: prev.enabled, // Ensure the `enabled` flag is preserved
            }));
            setIsModified(false);
            sonnerSuccessToast(t("settingPage.changeSaved"));
        }
    };

    const handleCancel = () => {
        setTempSettings(timerSettings); // revert to original settings
        setIsModified(false); // Reset modified state
    };

    // Update validity and modified state when temporary settings change
    useEffect(() => {
        setIsValid(validateInputs(tempSettings));
        setIsModified(checkIfModified(tempSettings)); // Check if values differ from localStorage or defaults
    }, [checkIfModified, tempSettings]);

    const exerciseNames: Record<keyof Omit<TimerSettings, "enabled">, string> = {
        dictation: t("exercise_page.dictationHeading"),
        matchup: t("exercise_page.matchUpHeading"),
        reordering: t("exercise_page.reorderingHeading"),
        sound_n_spelling: t("exercise_page.soundSpellingHeading"),
        sorting: t("exercise_page.sortingHeading"),
        odd_one_out: t("exercise_page.oddOneOutHeading"),
    };

    return (
        <div className="mt-4">
            <div className="flex gap-x-8 gap-y-6">
                <div className="basis-2/3 space-y-1">
                    <label className="cursor-pointer text-base font-semibold" htmlFor="enableTimer">
                        {t("settingPage.exerciseSettings.timerOption")}
                    </label>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {t("settingPage.exerciseSettings.timerDescription")}
                    </p>
                </div>
                <div className="flex basis-1/3 justify-end">
                    <input
                        type="checkbox"
                        className="toggle"
                        id="enableTimer"
                        checked={timerSettings.enabled}
                        onChange={(e) => handleTimerToggle(e.target.checked)}
                    />
                </div>
            </div>

            <div className="my-4 flex flex-row flex-wrap justify-center gap-4 px-8">
                {Object.keys(exerciseNames).map((exercise) => {
                    const value = tempSettings[exercise as keyof typeof exerciseNames];
                    const isInvalid =
                        value === "" || (typeof value === "number" && (value < 0 || value > 10));
                    return (
                        <div key={exercise} className="basis-full md:basis-1/3 lg:basis-1/4">
                            <fieldset className="fieldset w-full max-w-xs">
                                <legend className="fieldset-legend text-sm font-normal">
                                    <span>
                                        {exerciseNames[exercise as keyof typeof exerciseNames]}
                                    </span>
                                </legend>

                                <input
                                    title={exerciseNames[exercise as keyof typeof exerciseNames]}
                                    type="text"
                                    value={value}
                                    maxLength={2}
                                    onChange={(e) =>
                                        handleInputChange(
                                            e,
                                            exercise as keyof Omit<TimerSettings, "enabled">
                                        )
                                    }
                                    className={`input input-bordered w-full max-w-xs ${
                                        isInvalid ? "input-error" : ""
                                    }`}
                                    disabled={!inputEnabled}
                                />

                                {isInvalid ? (
                                    <p className="fieldset-label text-error text-sm">
                                        {t("settingPage.exerciseSettings.textboxError")}
                                    </p>
                                ) : null}
                            </fieldset>
                        </div>
                    );
                })}
            </div>

            <p className="px-8 text-sm">{t("settingPage.exerciseSettings.hint")}</p>

            <div className="my-6 flex flex-wrap justify-center gap-2 px-8">
                <button
                    type="button"
                    className="btn btn-primary btn-wide"
                    onClick={handleApply}
                    disabled={!isValid || !isModified}
                >
                    {t("settingPage.exerciseSettings.applyBtn")}
                </button>
                <button
                    type="button"
                    className="btn btn-secondary btn-wide"
                    onClick={handleCancel}
                    disabled={!isModified}
                >
                    {t("settingPage.exerciseSettings.cancelBtn")}
                </button>
            </div>
        </div>
    );
};

export default ExerciseTimer;
