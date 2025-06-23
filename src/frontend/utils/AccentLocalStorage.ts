import { useState } from "react";
import * as z from "zod/v4";

// Create a schema for valid accent values
const AccentSchema = z.enum(["american", "british"]);

// Create a schema for the localStorage settings
const SavedSettingsSchema = z
    .object({
        selectedAccent: AccentSchema.optional(),
    })
    .catchall(z.unknown()); // Allow other properties

// Infer TypeScript types
export type AccentType = z.infer<typeof AccentSchema>;

const DEFAULT_ACCENT: AccentType = "american";

const AccentLocalStorage = () => {
    const [selectedAccent, setSelectedAccent] = useState<AccentType>(() => {
        try {
            const raw = localStorage.getItem("ispeaker");
            if (!raw) return DEFAULT_ACCENT;

            const parsed = JSON.parse(raw);
            const result = SavedSettingsSchema.safeParse(parsed);

            if (result.success && result.data.selectedAccent) {
                // Validate that the stored accent is valid
                const accentResult = AccentSchema.safeParse(result.data.selectedAccent);
                return accentResult.success ? accentResult.data : DEFAULT_ACCENT;
            }

            return DEFAULT_ACCENT;
        } catch (error) {
            console.warn("Failed to parse accent settings:", error);
            return DEFAULT_ACCENT;
        }
    });

    const setValidatedAccent = (accent: string) => {
        const result = AccentSchema.safeParse(accent);
        if (result.success) {
            setSelectedAccent(result.data);
        } else {
            console.warn("Invalid accent value:", accent);
        }
    };

    return [selectedAccent, setValidatedAccent] as const;
};

export default AccentLocalStorage;
