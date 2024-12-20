import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast";

const defaultTimerSettings = {
    enabled: false,
    dictation: 5,
    matchup: 5,
    reordering: 5,
    sound_n_spelling: 5,
    sorting: 5,
    odd_one_out: 5,
    snap: 5,
};

const ExerciseTimer = () => {
    const { t } = useTranslation();

    const [timerSettings, setTimerSettings] = useState(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker"));
        if (savedSettings && savedSettings.timerSettings) {
            return savedSettings.timerSettings;
        }
        return defaultTimerSettings;
    });

    const [inputEnabled, setInputEnabled] = useState(timerSettings.enabled);
    const [tempSettings, setTempSettings] = useState(timerSettings);
    const [isValid, setIsValid] = useState(true);
    const [isModified, setIsModified] = useState(false);

    // Automatically save settings to localStorage whenever timerSettings change
    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker")) || {};
        savedSettings.timerSettings = timerSettings;
        localStorage.setItem("ispeaker", JSON.stringify(savedSettings));
    }, [timerSettings]);

    const handleTimerToggle = (enabled) => {
        setTimerSettings((prev) => ({
            ...prev,
            enabled,
        }));
        setInputEnabled(enabled);

        sonnerSuccessToast(t("settingPage.changeSaved"));
    };

    // Validation function to check if the inputs are valid (0-10 numbers only)
    const validateInputs = (settings) => {
        return Object.values(settings).every(
            (value) => value !== "" && !isNaN(value) && value >= 0 && value <= 10
        );
    };

    const checkIfModified = (settings) => {
        const savedSettings =
            JSON.parse(localStorage.getItem("ispeaker"))?.timerSettings || defaultTimerSettings;
        return JSON.stringify(settings) !== JSON.stringify(savedSettings);
    };

    const handleInputChange = (e, settingKey) => {
        const { value } = e.target;
        if (/^\d*$/.test(value) && value.length <= 2) {
            const numValue = value === "" ? "" : parseInt(value, 10);
            setTempSettings((prev) => ({
                ...prev,
                [settingKey]: numValue,
            }));
        }
    };

    const handleApply = () => {
        if (validateInputs(tempSettings)) {
            setTimerSettings((prev) => ({
                ...prev,
                ...tempSettings, // Apply modified fields
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
    }, [tempSettings]);

    const exerciseNames = {
        dictation: t("exercise_page.dictationHeading"),
        matchup: t("exercise_page.matchUpHeading"),
        reordering: t("exercise_page.reorderingHeading"),
        sound_n_spelling: t("exercise_page.soundSpellingHeading"),
        sorting: t("exercise_page.sortingHeading"),
        odd_one_out: t("exercise_page.oddOneOutHeading"),
        snap: t("exercise_page.snapHeading"),
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
                {Object.keys(exerciseNames).map((exercise) => (
                    <div key={exercise} className="basis-full md:basis-1/3 lg:basis-1/4">
                        <label className="form-control w-full max-w-xs">
                            <div className="label">
                                <span>{exerciseNames[exercise]}</span>
                            </div>

                            <input
                                type="text"
                                value={tempSettings[exercise]}
                                maxLength={2}
                                onChange={(e) => handleInputChange(e, exercise)}
                                className={`input input-bordered w-full max-w-xs ${
                                    tempSettings[exercise] === "" ||
                                    tempSettings[exercise] < 0 ||
                                    tempSettings[exercise] > 10
                                        ? "input-error"
                                        : ""
                                }`}
                                disabled={!inputEnabled}
                            />

                            {tempSettings[exercise] === "" ||
                            tempSettings[exercise] < 0 ||
                            tempSettings[exercise] > 10 ? (
                                <div className="label">
                                    <span className="label-text text-error">
                                        {t("settingPage.exerciseSettings.textboxError")}
                                    </span>
                                </div>
                            ) : null}
                        </label>
                    </div>
                ))}
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
