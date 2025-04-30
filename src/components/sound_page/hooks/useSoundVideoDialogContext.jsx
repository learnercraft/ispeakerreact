import { createContext, useContext } from "react";

export const SoundVideoDialogContext = createContext(null);

export const useSoundVideoDialog = () => {
    const context = useContext(SoundVideoDialogContext);
    if (!context) {
        throw new Error("useSoundVideoDialog must be used within a SoundVideoDialogProvider");
    }
    return context;
};
