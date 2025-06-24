import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod/v4";
import {
    getTimerSettings,
    setTimerSettings,
    TimerSettingsSchema,
    TimerValueSchema,
    type TimerSettings,
} from "../../utils/localStorageUtilsZod.js";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast.js";

const TimerValueInputSchema = z.union([TimerValueSchema, z.literal("")]);

// Create an input schema for timer settings
const TimerSettingsInputSchema = z.object({
    enabled: z.boolean(),
    dictation: TimerValueInputSchema,
    matchup: TimerValueInputSchema,
    reordering: TimerValueInputSchema,
    sound_n_spelling: TimerValueInputSchema,
    sorting: TimerValueInputSchema,
    odd_one_out: TimerValueInputSchema,
});

type TimerSettingsInput = z.infer<typeof TimerSettingsInputSchema>;

const ExerciseTimer = () => {
    const { t } = useTranslation();

    const [timerSettings, setTimerSettingsState] = useState<TimerSettings>(() => {
        return getTimerSettings();
    });

    const [tempSettings, setTempSettings] = useState<TimerSettingsInput>(() => {
        return getTimerSettings();
    });

    const [inputEnabled, setInputEnabled] = useState(() => {
        return getTimerSettings().enabled;
    });

    const [isValid, setIsValid] = useState(true);
    const [isModified, setIsModified] = useState(false);

    // Save settings using centralized utility
    const saveTimerSettings = (settings: TimerSettings) => {
        setTimerSettings(settings);
        setTimerSettingsState(settings);
    };

    const handleTimerToggle = (enabled: boolean) => {
        const newSettings = { ...timerSettings, enabled };

        if (enabled) {
            saveTimerSettings(newSettings);
            setInputEnabled(enabled);
            setTempSettings((prev) => ({ ...prev, enabled }));
        } else {
            // When disabling, revert tempSettings to saved values
            const currentSettings = getTimerSettings();
            saveTimerSettings(newSettings);
            setInputEnabled(enabled);
            setTempSettings({ ...currentSettings, enabled });
        }

        sonnerSuccessToast(t("settingPage.changeSaved"));
    };

    // Validation using Zod
    const validateInputs = (settings: TimerSettingsInput): boolean => {
        // First check if any numeric fields are empty strings
        const numericFields = [
            "dictation",
            "matchup",
            "reordering",
            "sound_n_spelling",
            "sorting",
            "odd_one_out",
        ] as const;
        const hasEmptyFields = numericFields.some((field) => settings[field] === "");

        if (hasEmptyFields) {
            return false; // Empty fields should make validation fail
        }

        // Then use Zod validation for type and range checking
        const result = TimerSettingsInputSchema.safeParse(settings);
        return result.success;
    };

    const normalizeSettings = (settings: TimerSettingsInput): TimerSettings => {
        const normalized = {
            enabled: settings.enabled,
            dictation: settings.dictation === "" ? 0 : settings.dictation,
            matchup: settings.matchup === "" ? 0 : settings.matchup,
            reordering: settings.reordering === "" ? 0 : settings.reordering,
            sound_n_spelling: settings.sound_n_spelling === "" ? 0 : settings.sound_n_spelling,
            sorting: settings.sorting === "" ? 0 : settings.sorting,
            odd_one_out: settings.odd_one_out === "" ? 0 : settings.odd_one_out,
        };

        // Validate the normalized settings
        const result = TimerSettingsSchema.safeParse(normalized);
        if (!result.success) {
            console.warn("❌ Failed to normalize settings:", result.error);
            return getTimerSettings();
        }

        return result.data;
    };

    const checkIfModified = (settings: TimerSettingsInput): boolean => {
        const currentSettings = getTimerSettings();
        const normalizedSettings = normalizeSettings(settings);
        return JSON.stringify(normalizedSettings) !== JSON.stringify(currentSettings);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        settingKey: keyof Omit<TimerSettings, "enabled">
    ) => {
        const { value } = e.target;

        // Only allow digits and limit length
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
            const normalizedSettings = normalizeSettings(tempSettings);
            saveTimerSettings(normalizedSettings);
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
        setIsModified(checkIfModified(tempSettings));
    }, [tempSettings]);

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
                {(Object.keys(exerciseNames) as (keyof typeof exerciseNames)[]).map((exercise) => {
                    const value = tempSettings[exercise];
                    const isInvalid =
                        value === "" || (typeof value === "number" && (value < 0 || value > 10));

                    return (
                        <div key={exercise} className="basis-full md:basis-1/3 lg:basis-1/4">
                            <fieldset className="fieldset w-full max-w-xs">
                                <legend className="fieldset-legend text-sm font-normal">
                                    <span>{exerciseNames[exercise]}</span>
                                </legend>

                                <input
                                    title={exerciseNames[exercise]}
                                    type="text"
                                    value={value}
                                    maxLength={2}
                                    onChange={(e) => handleInputChange(e, exercise)}
                                    className={`input input-bordered w-full max-w-xs ${
                                        isInvalid ? "input-error" : ""
                                    }`}
                                    disabled={!inputEnabled}
                                />

                                {isInvalid && (
                                    <p className="fieldset-label text-error text-sm">
                                        {t("settingPage.exerciseSettings.textboxError")}
                                    </p>
                                )}
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
