import * as z from "zod/v4";

// Base schemas for reusable types
const AccentSchema = z.enum(["american", "british"]);
const ReviewSchema = z.enum(["good", "neutral", "bad"]);
const TimerValueSchema = z.number().int().min(0).max(10);

// Sound review schemas
const SoundReviewByAccentSchema = z.record(z.string(), ReviewSchema);
const SoundReviewSchema = z.record(AccentSchema, SoundReviewByAccentSchema);

// Word review schemas
const WordReviewByWordSchema = z.record(z.string(), ReviewSchema);
const WordReviewByAccentSchema = z.record(AccentSchema, WordReviewByWordSchema);

// Conversation review schemas
const ConversationReviewStateSchema = z.record(z.string(), z.boolean());
const ConversationReviewSchema = z.record(z.string(), ConversationReviewStateSchema);

// Exam review schemas
const ExamReviewStateSchema = z.record(z.string(), z.boolean());
const ExamReviewSchema = z.record(AccentSchema, ExamReviewStateSchema);

// Timer settings schema
const TimerSettingsSchema = z.object({
    enabled: z.boolean(),
    dictation: TimerValueSchema,
    matchup: TimerValueSchema,
    reordering: TimerValueSchema,
    sound_n_spelling: TimerValueSchema,
    sorting: TimerValueSchema,
    odd_one_out: TimerValueSchema,
});

// Main localStorage schema
const LocalStorageSchema = z
    .object({
        // Basic settings
        language: z.string().optional(),
        selectedAccent: AccentSchema.optional(),

        // Review data
        soundReview: SoundReviewSchema.optional(),
        wordReview: WordReviewByAccentSchema.optional(),
        conversationReview: ConversationReviewSchema.optional(),
        examReview: ExamReviewSchema.optional(),

        // Timer settings
        timerSettings: TimerSettingsSchema.optional(),
    })
    .catchall(z.unknown()); // Allow additional unknown properties

// Export types
export type AccentType = z.infer<typeof AccentSchema>;
export type ReviewType = z.infer<typeof ReviewSchema> | null;
export type TimerSettings = z.infer<typeof TimerSettingsSchema>;
export type LocalStorageData = z.infer<typeof LocalStorageSchema>;

// Storage key constant
const STORAGE_KEY = "ispeaker";

/**
 * Safely retrieves and validates localStorage data
 */
const getLocalStorageData = (): LocalStorageData => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};

        const parsed = JSON.parse(raw);
        const result = LocalStorageSchema.safeParse(parsed);

        if (result.success) {
            return result.data;
        } else {
            console.warn("❌ Invalid localStorage data structure:", result.error.issues);
            return {};
        }
    } catch (error) {
        console.warn("❌ Failed to parse localStorage data:", error);
        return {};
    }
};

/**
 * Safely saves data to localStorage with validation
 */
const setLocalStorageData = (data: Partial<LocalStorageData>): void => {
    try {
        // Get current data and merge with new data
        const currentData = getLocalStorageData();
        const updatedData = { ...currentData, ...data };

        // Validate the updated data
        const result = LocalStorageSchema.safeParse(updatedData);

        if (result.success) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
        } else {
            console.error(
                "❌ Invalid data structure, not saving to localStorage:",
                result.error.issues
            );
        }
    } catch (error) {
        console.error("❌ Failed to save data to localStorage:", error);
    }
};

/**
 * Safely updates a nested property in localStorage
 */
const updateLocalStorageProperty = <K extends keyof LocalStorageData>(
    key: K,
    value: LocalStorageData[K]
): void => {
    const data = { [key]: value } as Partial<LocalStorageData>;
    setLocalStorageData(data);
};

/**
 * Gets sound review data for a specific accent and sound
 */
const getSoundReview = (accent: AccentType, soundKey: string): ReviewType => {
    const data = getLocalStorageData();
    return data.soundReview?.[accent]?.[soundKey] ?? null;
};

/**
 * Sets sound review data for a specific accent and sound
 */
const setSoundReview = (
    accent: AccentType,
    soundKey: string,
    review: Exclude<ReviewType, null>
): void => {
    const data = getLocalStorageData();

    // Initialize nested structure if needed
    const soundReview: z.infer<typeof SoundReviewSchema> = data.soundReview ?? {
        american: {},
        british: {},
    };
    if (!soundReview[accent]) {
        soundReview[accent] = {};
    }

    soundReview[accent][soundKey] = review;

    setLocalStorageData({ soundReview });
};

/**
 * Gets word review data for a specific accent and word
 */
const getWordReview = (accent: AccentType, word: string): ReviewType => {
    const data = getLocalStorageData();
    return data.wordReview?.[accent]?.[word] ?? null;
};

/**
 * Sets word review data for a specific accent and word
 */
const setWordReview = (
    accent: AccentType,
    word: string,
    review: Exclude<ReviewType, null>
): void => {
    const data = getLocalStorageData();

    // Initialize nested structure if needed
    const wordReview: z.infer<typeof WordReviewByAccentSchema> = data.wordReview ?? {
        american: {},
        british: {},
    };
    if (!wordReview[accent]) {
        wordReview[accent] = {};
    }

    wordReview[accent][word] = review;

    setLocalStorageData({ wordReview });
};

/**
 * Gets timer settings with defaults
 */
const getTimerSettings = (): TimerSettings => {
    const data = getLocalStorageData();

    const defaultSettings: TimerSettings = {
        enabled: false,
        dictation: 5,
        matchup: 5,
        reordering: 5,
        sound_n_spelling: 5,
        sorting: 5,
        odd_one_out: 5,
    };

    return data.timerSettings ?? defaultSettings;
};

/**
 * Sets timer settings
 */
const setTimerSettings = (settings: TimerSettings): void => {
    // Validate settings before saving
    const result = TimerSettingsSchema.safeParse(settings);

    if (result.success) {
        setLocalStorageData({ timerSettings: result.data });
    } else {
        console.error("❌ Invalid timer settings:", result.error.issues);
    }
};

/**
 * Gets the selected accent with fallback
 */
const getSelectedAccent = (): AccentType => {
    const data = getLocalStorageData();
    return data.selectedAccent ?? "american";
};

/**
 * Sets the selected accent
 */
const setSelectedAccent = (accent: AccentType): void => {
    const result = AccentSchema.safeParse(accent);

    if (result.success) {
        setLocalStorageData({ selectedAccent: result.data });
    } else {
        console.warn("❌ Invalid accent value:", accent);
    }
};

/**
 * Clears all localStorage data (excluding github_ratelimit_timestamp)
 */
const clearLocalStorageData = (): void => {
    try {
        const keysToPreserve = ["github_ratelimit_timestamp"];
        const preservedData: Record<string, string> = {};

        // Preserve specific keys
        keysToPreserve.forEach((key) => {
            const value = localStorage.getItem(key);
            if (value) {
                preservedData[key] = value;
            }
        });

        // Clear all localStorage
        localStorage.clear();

        // Restore preserved data
        Object.entries(preservedData).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });

        console.log("✅ localStorage cleared successfully");
    } catch (error) {
        console.error("❌ Failed to clear localStorage:", error);
    }
};

// Schema exports for external validation
export {
    AccentSchema,
    TimerValueSchema,
    clearLocalStorageData,
    ConversationReviewSchema,
    ExamReviewSchema,
    getLocalStorageData,
    getSelectedAccent,
    getSoundReview,
    getTimerSettings,
    getWordReview,
    LocalStorageSchema,
    ReviewSchema,
    setLocalStorageData,
    setSelectedAccent,
    setSoundReview,
    setTimerSettings,
    setWordReview,
    SoundReviewSchema,
    TimerSettingsSchema,
    updateLocalStorageProperty,
    WordReviewByAccentSchema,
};
