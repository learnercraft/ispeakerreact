import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useAutoDetectTheme } from "../../../utils/ThemeContext/useAutoDetectTheme";
import { SoundVideoDialogContext } from "./useSoundVideoDialogContext";

export const SoundVideoDialogProvider = ({ children, t }) => {
    const [dialogState, setDialogState] = useState({
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

    const [activeCard, setActiveCard] = useState(null);
    const [isAnyCardActive, setIsAnyCardActive] = useState(false);

    const dialogRef = useRef(null);
    const mediaPlayerRef = useRef(null);
    const { autoDetectedTheme } = useAutoDetectTheme();

    const showDialog = (state) => {
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

    const setCardActive = (cardId, isActive) => {
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
                        <span className="font-bold">{t("sound_page.clipModalTitle")}</span>:{" "}
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
                                        src={dialogState.videoUrl}
                                        className="h-full w-full"
                                        ref={mediaPlayerRef}
                                    >
                                        <MediaProvider />
                                        <DefaultVideoLayout
                                            icons={defaultLayoutIcons}
                                            colorScheme={autoDetectedTheme}
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
                                            className={`h-full w-full transition-opacity duration-300 ${
                                                dialogState.iframeLoading
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

SoundVideoDialogProvider.propTypes = {
    children: PropTypes.node.isRequired,
    t: PropTypes.func.isRequired,
};
