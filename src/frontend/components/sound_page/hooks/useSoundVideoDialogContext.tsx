import { createContext, useContext } from "react";
import type { SoundVideoDialogContextType } from "../types.js";

export const SoundVideoDialogContext = createContext<SoundVideoDialogContextType | null>(null);

export const useSoundVideoDialog = () => {
    const context = useContext(SoundVideoDialogContext);
    if (!context) {
        throw new Error("useSoundVideoDialog must be used within a SoundVideoDialogProvider");
    }
    return context;
};
