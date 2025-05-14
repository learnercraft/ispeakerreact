import WavesurferPlayer from "@wavesurfer/react";
import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { IoChevronBackOutline, IoInformationCircleOutline } from "react-icons/io5";
import { VscFeedback } from "react-icons/vsc";
import { checkRecordingExists } from "../../utils/databaseOperations";
import openExternal from "../../utils/openExternal";
import { useTheme } from "../../utils/ThemeContext/useTheme";
import RecordingWaveform from "./RecordingWaveform";
import ReviewRecording from "./ReviewRecording";
import { parseIPA } from "./syllableParser";
import useWaveformTheme from "./useWaveformTheme";

const WordDetails = ({ word, handleBack, t, accent, onReviewUpdate, scrollRef }) => {
    const { theme } = useTheme();

    const [activeSyllable, setActiveSyllable] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(true); // State to track loading
    const [, setAudioError] = useState(false);
    const [peaks, setPeaks] = useState([]);
    const [isSlowMode, setIsSlowMode] = useState(false);
    const [isRecordingWaveformActive, setIsRecordingWaveformActive] = useState(false);

    const [isRecordingExists, setIsRecordingExists] = useState(false);

    const waveformLight = "hsl(24.6 95% 53.1%)"; // Light mode waveform color
    const waveformDark = "hsl(27 96% 61%)"; // Dark mode waveform color
    const progressLight = "hsl(262.1 83.3% 57.8%)"; // Light mode progress color
    const progressDark = "hsl(258.3 89.5% 66.3%)"; // Dark mode progress color
    const cursorLight = "hsl(262.1 83.3% 57.8%)"; // Dark mode progress color
    const cursorDark = "hsl(258.3 89.5% 66.3%)"; // Dark mode progress color

    const { waveformColor, progressColor, cursorColor } = useWaveformTheme(
        theme,
        waveformLight,
        waveformDark,
        progressLight,
        progressDark,
        cursorLight,
        cursorDark
    );

    const wordKey = `wordPronunciation-${word.name}-${accent}`;

    useEffect(() => {
        const checkRecording = async () => {
            const exists = await checkRecordingExists(wordKey);
            setIsRecordingExists(exists);
        };
        checkRecording();
    }, [wordKey]);

    const baseURL = import.meta.env.BASE_URL;
    const audioFile =
        accent === "american" && word.fileNameUS
            ? `${baseURL}media/word/mp3/${word.fileNameUS}.mp3`
            : `${baseURL}media/word/mp3/${word.fileName}.mp3`;

    const displayName = accent === "american" && word.nameUS ? word.nameUS : word.name;
    const displayPronunciation =
        accent === "american" && word.pronunciationUS ? word.pronunciationUS : word.pronunciation;

    const syllables = parseIPA(displayPronunciation);

    const wordPronunInfoBody = t("wordPage.wordPronunInfoBody", { returnObjects: true });

    const [wavesurfer, setWavesurfer] = useState(null);
    const wordPronunInfoModalRef = useRef(null);

    const onReady = (ws) => {
        setWavesurfer(ws);
        setIsPlaying(false);
        setAudioError(false);
        setIsAudioLoading(false); // Stop showing loading spinner

        // Generate peaks using exportPeaks
        const peaks = ws.exportPeaks({
            maxLength: 1000, // Higher values for better resolution
            precision: 2, // Precision of peak data
        });

        setPeaks(peaks[0] || []); // Use the first channel's peaks

        ws.on("finish", () => {
            setActiveSyllable(-1); // Reset the highlighting
        });

        ws.setPlaybackRate(isSlowMode ? 0.5 : 1);
    };

    const onPlayPause = () => {
        if (isRecordingWaveformActive || isAudioLoading) return;
        if (wavesurfer) {
            setIsPlaying((prev) => !prev);
            wavesurfer.playPause();
        } else {
            console.error("WaveSurfer instance is not ready.");
        }
    };

    const onAudioprocess = (currentTime) => {
        if (peaks.length > 0 && wavesurfer) {
            const duration = wavesurfer.getDuration();
            const totalPeaks = peaks.length;

            // Calculate current peak index based on playback time
            const currentPeakIndex = Math.floor((currentTime / duration) * totalPeaks);

            // Map the current peak index to syllables
            const syllableIndex = Math.floor(
                (currentPeakIndex / totalPeaks) * (syllables.length + 2)
            );

            if (syllableIndex !== activeSyllable && syllableIndex < syllables.length) {
                setActiveSyllable(syllableIndex);
            }
        }
    };

    const toggleSlowMode = () => {
        if (wavesurfer) {
            const newRate = isSlowMode ? 1 : 0.5; // Normal speed vs Slow speed
            wavesurfer.setPlaybackRate(newRate);
            setIsSlowMode(!isSlowMode);
        }
    };

    const handleWaveformActivityChange = (isActive) => {
        setIsRecordingWaveformActive(isActive);
    };

    return (
        <>
            <button type="button" className="btn btn-secondary my-8" onClick={handleBack}>
                <IoChevronBackOutline className="h-5 w-5" /> {t("wordPage.backBtn")}
            </button>
            <div
                ref={scrollRef}
                className="card card-lg card-border p-6 shadow-md dark:border-slate-600"
            >
                <div className="card-body flex justify-center text-center">
                    <div className="mb-4 flex flex-row items-center justify-center gap-2">
                        <h1 className="text-2xl font-bold" lang="en">
                            {displayName}{" "}
                            <span className="text-base font-normal italic" lang="en">
                                {word.pos.join(", ")}
                            </span>
                        </h1>

                        {word.level.map((wordLevel, id) => (
                            <span key={id} className="badge badge-ghost font-semibold" lang="en">
                                {wordLevel.toUpperCase()}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-center space-x-1 md:space-x-2">
                        {syllables.map((syllable, index) => (
                            <div
                                key={index}
                                className={`my-2 ${
                                    syllable.primary || syllable.secondary ? "indicator" : ""
                                }`}
                            >
                                {syllable.primary && (
                                    <span className="badge indicator-item badge-warning indicator-center font-semibold">
                                        {t("wordPage.primaryBadge")}
                                    </span>
                                )}
                                {syllable.secondary && (
                                    <span className="badge indicator-item badge-accent indicator-center font-semibold">
                                        {t("wordPage.secondaryBadge")}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    className={`btn btn-xl font-normal ${
                                        index === activeSyllable
                                            ? "btn-accent"
                                            : syllable.primary
                                              ? "btn-primary"
                                              : syllable.secondary
                                                ? "btn-secondary"
                                                : ""
                                    }`}
                                >
                                    <span lang="en">{syllable.text}</span>
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn btn-circle btn-ghost btn-sm"
                            title={t("wordPage.wordPronunInfoHeader")}
                        >
                            <IoInformationCircleOutline
                                className="h-6 w-6"
                                onClick={() =>
                                    wordPronunInfoModalRef.current && wordPronunInfoModalRef.current.showModal()
                                }
                            />
                        </button>
                    </div>

                    <div className="my-4 flex justify-center">
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span>{t("wordPage.slowModeOption")}</span>
                                <input
                                    type="checkbox"
                                    className="toggle ms-4"
                                    onChange={toggleSlowMode}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Waveform */}
                    <div className="flex w-full place-items-center justify-center space-x-4">
                        <button
                            type="button"
                            title={t("exercise_page.buttons.playAudioBtn")}
                            className="btn btn-circle btn-lg"
                            onClick={onPlayPause}
                            disabled={isRecordingWaveformActive || isAudioLoading} // Disable until loaded
                        >
                            {isAudioLoading ? (
                                <span className="loading loading-spinner loading-md"></span>
                            ) : isPlaying ? (
                                <BsPauseFill className="h-6 w-6" />
                            ) : (
                                <BsPlayFill className="h-6 w-6" />
                            )}
                        </button>
                        <div className="w-full">
                            <WavesurferPlayer
                                key="playback"
                                height={80}
                                waveColor={waveformColor}
                                progressColor={progressColor}
                                cursorColor={cursorColor}
                                cursorWidth={2}
                                url={audioFile}
                                onReady={onReady}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onError={() => setAudioError(true)}
                                onAudioprocess={(ws, currentTime) => onAudioprocess(currentTime)}
                            />
                        </div>
                    </div>

                    {/* Recording Controls */}
                    <RecordingWaveform
                        wordKey={`wordPronunciation-${word.name}-${accent}`}
                        maxDuration={8}
                        disableControls={isPlaying}
                        onActivityChange={handleWaveformActivityChange}
                        t={t}
                        onRecordingSaved={() => setIsRecordingExists(true)}
                        isAudioLoading={isAudioLoading}
                    />

                    <ReviewRecording
                        wordName={word.name}
                        accent={accent}
                        isRecordingExists={isRecordingExists}
                        t={t}
                        onReviewUpdate={onReviewUpdate}
                    />

                    <div className="flex justify-center">
                        <button
                            className="btn btn-info my-4"
                            onClick={() =>
                                openExternal(
                                    "https://github.com/learnercraft/ispeakerreact/discussions/34"
                                )
                            }
                        >
                            <VscFeedback className="h-5 w-5" /> {t("wordPage.feedbackBtn")}
                        </button>
                    </div>
                </div>
            </div>

            <dialog ref={wordPronunInfoModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">{t("wordPage.wordPronunInfoHeader")}</h3>
                    <div className="py-4">
                        {wordPronunInfoBody.map((text, index) => (
                            <p className="mb-2" key={index}>
                                {text}
                            </p>
                        ))}
                    </div>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">{t("sound_page.closeBtn")}</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
};

WordDetails.propTypes = {
    word: PropTypes.shape({
        fileName: PropTypes.string.isRequired,
        fileNameUS: PropTypes.string,
        level: PropTypes.arrayOf(PropTypes.string).isRequired,
        name: PropTypes.string.isRequired,
        nameUS: PropTypes.string,
        pos: PropTypes.arrayOf(PropTypes.string).isRequired,
        pronunciation: PropTypes.string.isRequired,
        pronunciationUS: PropTypes.string,
        wordId: PropTypes.number.isRequired,
    }).isRequired,
    handleBack: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    accent: PropTypes.string.isRequired,
    onAccentChange: PropTypes.func.isRequired,
    onReviewUpdate: PropTypes.func,
    scrollRef: PropTypes.object,
};

export default WordDetails;
