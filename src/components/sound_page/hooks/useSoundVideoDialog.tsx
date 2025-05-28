import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import { useRef, useState, type ReactNode } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import useAutoDetectTheme from "../../../utils/ThemeContext/useAutoDetectTheme.js";
import { SoundVideoDialogContext } from "./useSoundVideoDialogContext.js";

// Types from SoundPracticeCard.tsx
export type TranslationFunction = (key: string, options?: Record<string, unknown>) => string;

export interface SoundVideoDialogState {
    isOpen: boolean;
    videoUrl: string | null;
    title: string;
    phoneme: string;
    isLocalVideo: boolean;
    onIframeLoad: (() => void) | null;
    iframeLoading: boolean;
    showOnlineVideoAlert: boolean;
    t: TranslationFunction | null;
}

export interface SoundVideoDialogContextType {
    showDialog: (state: Omit<SoundVideoDialogState, 'isOpen' | 'iframeLoading'>) => void;
    closeDialog: () => void;
    handleIframeLoad: () => void;
    dialogState: SoundVideoDialogState;
    activeCard: string | null;
    isAnyCardActive: boolean;
    setCardActive: (cardId: string, isActive: boolean) => void;
    t: TranslationFunction;
}

interface SoundVideoDialogProviderProps {
    children: ReactNode;
    t: TranslationFunction;
}

export const SoundVideoDialogProvider = ({ children, t }: SoundVideoDialogProviderProps) => {
    const [dialogState, setDialogState] = useState<SoundVideoDialogState>({
        isOpen: false,
        videoUrl: null,
        title: "",
        phoneme: "",
        isLocalVideo: false,
        onIframeLoad: null,
        iframeLoading: true,
        showOnlineVideoAlert: false,
        t: null,
    });

    const [activeCard, setActiveCard] = useState<string | null>(null);
    const [isAnyCardActive, setIsAnyCardActive] = useState<boolean>(false);

    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const mediaPlayerRef = useRef<MediaPlayerInstance | null>(null);
    const { autoDetectedTheme } = useAutoDetectTheme();

    const showDialog = (state: Omit<SoundVideoDialogState, 'isOpen' | 'iframeLoading'>) => {
        setDialogState({ ...state, isOpen: true, iframeLoading: true });
        dialogRef.current?.showModal();
    };

    const closeDialog = () => {
        setDialogState((prev) => ({ ...prev, isOpen: false }));
        dialogRef.current?.close();
    };

    const handleIframeLoad = () => {
        setDialogState((prev) => ({ ...prev, iframeLoading: false }));
    };

    const setCardActive = (cardId: string, isActive: boolean) => {
        setActiveCard(isActive ? cardId : null);
        setIsAnyCardActive(isActive);
    };

    return (
        <SoundVideoDialogContext.Provider
            value={{
                showDialog,
                closeDialog,
                handleIframeLoad,
                dialogState,
                activeCard,
                isAnyCardActive,
                setCardActive,
                t,
            }}
        >
            {children}
            <dialog className="modal" ref={dialogRef}>
                <div className="modal-box w-11/12 max-w-5xl">
                    <h3 className="pb-4 text-lg">
                        <span className="font-bold">{t("sound_page.clipModalTitle")}</span>: {" "}
                        <span
                            lang="en"
                            className="italic"
                            dangerouslySetInnerHTML={{ __html: dialogState.title }}
                        />
                    </h3>
                    <div className={`${dialogState.iframeLoading ? "overflow-hidden" : ""}`}>
                        <div className="aspect-video">
                            <div className="relative h-full w-full">
                                {dialogState.isOpen && dialogState.isLocalVideo ? (
                                    <MediaPlayer
                                        src={dialogState.videoUrl ?? undefined}
                                        className="h-full w-full"
                                        ref={mediaPlayerRef}
                                    >
                                        <MediaProvider />
                                        <DefaultVideoLayout
                                            icons={defaultLayoutIcons}
                                            colorScheme={autoDetectedTheme as "default" | "light" | "dark" | "system"}
                                        />
                                    </MediaPlayer>
                                ) : dialogState.isOpen && dialogState.videoUrl ? (
                                    <>
                                        {dialogState.iframeLoading && (
                                            <div className="skeleton absolute inset-0 h-full w-full"></div>
                                        )}
                                        <iframe
                                            src={dialogState.videoUrl}
                                            title={`${dialogState.phoneme} - ${dialogState.title}`}
                                            allowFullScreen
                                            onLoad={handleIframeLoad}
                                            className={`h-full w-full transition-opacity duration-300 ${dialogState.iframeLoading
                                                    ? "opacity-0"
                                                    : "opacity-100"
                                                }`}
                                        />
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    {dialogState.showOnlineVideoAlert && (
                        <div role="alert" className="alert mt-5">
                            <IoInformationCircleOutline className="h-6 w-6" />
                            <span>{t("alert.alertOnlineVideo")}</span>
                        </div>
                    )}
                    <div className="modal-action">
                        <form method="dialog">
                            <button type="button" className="btn" onClick={closeDialog}>
                                {t("sound_page.closeBtn")}
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </SoundVideoDialogContext.Provider>
    );
};
