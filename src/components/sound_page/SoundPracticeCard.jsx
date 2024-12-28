import he from "he";
import { BsRecordCircleFill, BsPlayCircleFill } from "react-icons/bs";

const SoundCardItem = ({
    id,
    imgPhonemeThumbSrc,
    handleShow,
    textContent,
    activeRecordingCard,
    isRecordingPlaying,
    activePlaybackCard,
    isRecordingPlayingActive,
    isRecordingAvailable,
    handleRecording,
    handlePlayRecording,
}) => {
    const isRecordingDisabled = activeRecordingCard !== null || isRecordingPlaying;
    const isPlayingDisabled =
        (isRecordingPlaying && activePlaybackCard !== id) ||
        !isRecordingAvailable(id) ||
        activeRecordingCard !== null;

    const recordIconClasses = `me-2${
        activeRecordingCard === id
            ? " text-success"
            : isRecordingDisabled
              ? " pointer-events-none opacity-25"
              : ""
    }`;
    const playIconClasses = `me-2${
        isRecordingPlaying && activePlaybackCard !== id
            ? " pointer-events-none opacity-25"
            : isRecordingPlayingActive(id)
              ? " text-success"
              : isPlayingDisabled
                ? " pointer-events-none opacity-25"
                : ""
    }`;

    return (
        <div className="flex flex-wrap">
            <div className="card card-bordered mb-2 w-full dark:border-slate-600">
                <div className="card-body">
                    <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => handleShow(id)}
                        >
                            <img src={imgPhonemeThumbSrc} alt="Phoneme Thumbnail" />
                        </button>
                        <span lang="en" dangerouslySetInnerHTML={{ __html: he.decode(textContent) }}></span>
                        <div className="flex space-x-4">
                            <BsRecordCircleFill
                                aria-label="record icon"
                                size={24}
                                role="button"
                                className={recordIconClasses}
                                onClick={() => handleRecording(id)}
                            />
                            <BsPlayCircleFill
                                aria-label="play recording icon"
                                size={24}
                                role="button"
                                className={playIconClasses}
                                onClick={() =>
                                    isRecordingAvailable(id) ? handlePlayRecording(id) : null
                                }
                                disabled={isRecordingPlaying && activePlaybackCard !== id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SoundPracticeCard = ({
    sound,
    handleShow,
    imgPhonemeThumbSrc,
    activeRecordingCard,
    isRecordingPlaying,
    activePlaybackCard,
    accentData,
    isRecordingPlayingActive,
    isRecordingAvailable,
    handleRecording,
    handlePlayRecording,
}) => {
    const commonProps = {
        imgPhonemeThumbSrc,
        handleShow,
        activeRecordingCard,
        isRecordingPlaying,
        activePlaybackCard,
        isRecordingPlayingActive,
        isRecordingAvailable,
        handleRecording,
        handlePlayRecording,
    };

    const items = [
        { id: 1, textContent: sound.phoneme, shouldShow: sound.shouldShow !== false },
        { id: 2, textContent: accentData.initial, shouldShow: !!accentData.initial },
        { id: 3, textContent: accentData.medial, shouldShow: !!accentData.medial },
        { id: 4, textContent: accentData.final, shouldShow: !!accentData.final },
    ];

    return (
        <>
            {items.map(
                (item) =>
                    item.shouldShow && (
                        <SoundCardItem
                            key={item.id}
                            id={item.id}
                            textContent={item.textContent}
                            {...commonProps}
                        />
                    )
            )}
        </>
    );
};

export default SoundPracticeCard;
