import WavesurferPlayer from "@wavesurfer/react";
import { useEffect, useRef, useState } from "react";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { IoChevronBackOutline, IoInformationCircleOutline } from "react-icons/io5";
import { VscFeedback } from "react-icons/vsc";
import { checkRecordingExists } from "../../utils/databaseOperations.js";
import openExternal from "../../utils/openExternal.js";
import RecordingWaveform from "./RecordingWaveform.js";
import ReviewRecording from "./ReviewRecording.js";
import parseIPA from "./syllableParser.js";
import useWaveformTheme from "./useWaveformTheme.js";
import type { Word } from "./WordList.js";
import type { RefObject } from "react";

interface Syllable {
    text: string;
    primary: boolean;
    secondary: boolean;
}

type TranslationFunction = (key: string, options?: Record<string, unknown>) => string | string[];

type AccentType = "american" | "british";

interface WordDetailsProps {
    word: Word;
    handleBack: () => void;
    t: TranslationFunction;
    accent: AccentType;
    onReviewUpdate?: () => void;
    scrollRef?: RefObject<HTMLDivElement>;
}

const WordDetails = ({ word, handleBack, t, accent, onReviewUpdate, scrollRef }: WordDetailsProps) => {
    const [activeSyllable, setActiveSyllable] = useState<number>(-1);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isAudioLoading, setIsAudioLoading] = useState<boolean>(true);
    const [, setAudioError] = useState<boolean>(false);
    const [peaks, setPeaks] = useState<number[]>([]);
    const [isSlowMode, setIsSlowMode] = useState<boolean>(false);
    const [isRecordingWaveformActive] = useState<boolean>(false);
    const [isRecordingExists, setIsRecordingExists] = useState<boolean>(false);

    const waveformLight = "hsl(24.6 95% 53.1%)";
    const waveformDark = "hsl(27 96% 61%)";
    const progressLight = "hsl(262.1 83.3% 57.8%)";
    const progressDark = "hsl(258.3 89.5% 66.3%)";
    const cursorLight = "hsl(262.1 83.3% 57.8%)";
    const cursorDark = "hsl(258.3 89.5% 66.3%)";

    const { waveformColor, progressColor, cursorColor }: {
        waveformColor: string;
        progressColor: string;
        cursorColor: string;
    } = useWaveformTheme(
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
            setIsRecordingExists(!!exists);
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

    const syllables: Syllable[] = parseIPA(displayPronunciation);

    const wordPronunInfoBodyRaw = t("wordPage.wordPronunInfoBody", { returnObjects: true });
    const wordPronunInfoBody = Array.isArray(wordPronunInfoBodyRaw)
        ? wordPronunInfoBodyRaw.join("\n").split("\n")
        : [String(wordPronunInfoBodyRaw)];

    const [wavesurfer, setWavesurfer] = useState<{
        playPause: () => void;
        getDuration: () => number;
        exportPeaks: (opts: { maxLength: number; precision: number }) => number[][];
        on: (event: string, handler: (...args: unknown[]) => void) => void;
        setPlaybackRate: (rate: number) => void;
    } | null>(null);
    const wordPronunInfoModalRef = useRef<HTMLDialogElement>(null);

    const onReady = (ws: unknown) => {
        const wavesurferInstance = ws as {
            playPause: () => void;
            getDuration: () => number;
            exportPeaks: (opts: { maxLength: number; precision: number }) => number[][];
            on: (event: string, handler: (...args: unknown[]) => void) => void;
            setPlaybackRate: (rate: number) => void;
        };
        setWavesurfer(wavesurferInstance);
        setIsPlaying(false);
        setAudioError(false);
        setIsAudioLoading(false);
        const peaks = wavesurferInstance.exportPeaks({ maxLength: 1000, precision: 2 });
        setPeaks(peaks[0] || []);
        wavesurferInstance.on("finish", () => {
            setActiveSyllable(-1);
        });
        wavesurferInstance.setPlaybackRate(isSlowMode ? 0.5 : 1);
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

    const onAudioprocess = (currentTime: number) => {
        if (peaks.length > 0 && wavesurfer) {
            const duration = wavesurfer.getDuration();
            const totalPeaks = peaks.length;
            const currentPeakIndex = Math.floor((currentTime / duration) * totalPeaks);
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
            const newRate = isSlowMode ? 1 : 0.5;
            wavesurfer.setPlaybackRate(newRate);
            setIsSlowMode(!isSlowMode);
        }
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
                <div className="card-body flex justify-center">
                    <div className="mb-4 flex flex-row items-center justify-center gap-2">
                        <h1 className="text-2xl font-bold" lang="en">
                            {displayName}{" "}
                            <span className="text-base font-normal italic" lang="en">
                                {word.pos.join(", ")}
                            </span>
                        </h1>
                        {word.level.map((wordLevel: string, id: number) => (
                            <span key={id} className="badge badge-ghost font-semibold" lang="en">
                                {wordLevel.toUpperCase()}
                            </span>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-center space-x-1 md:space-x-2">
                        {syllables.map((syllable, index) => (
                            <div
                                key={index}
                                className={`my-2 ${syllable.primary || syllable.secondary ? "indicator" : ""
                                    }`}
                            >
                                {syllable.primary && (
                                    <span className="badge indicator-item badge-warning indicator-center font-semibold">
                                        {String(t("wordPage.primaryBadge"))}
                                    </span>
                                )}
                                {syllable.secondary && (
                                    <span className="badge indicator-item badge-accent indicator-center font-semibold">
                                        {String(t("wordPage.secondaryBadge"))}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    className={`btn btn-xl font-normal ${index === activeSyllable
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
                            title={String(t("wordPage.wordPronunInfoHeader"))}
                        >
                            <IoInformationCircleOutline
                                className="h-6 w-6"
                                onClick={() =>
                                    wordPronunInfoModalRef.current &&
                                    wordPronunInfoModalRef.current.showModal()
                                }
                            />
                        </button>
                    </div>
                    <div className="my-4 flex justify-center">
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span>{String(t("wordPage.slowModeOption"))}</span>
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
                            title={String(t("exercise_page.buttons.playAudioBtn"))}
                            className="btn btn-circle btn-lg"
                            onClick={onPlayPause}
                            disabled={isRecordingWaveformActive || isAudioLoading}
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
                                onAudioprocess={(_ws: unknown, currentTime: number) => onAudioprocess(currentTime)}
                            />
                        </div>
                    </div>
                    {/* Recording Controls */}
                    <RecordingWaveform
                        wordKey={`wordPronunciation-${word.name}-${accent}`}
                        maxDuration={8}
                        disableControls={isPlaying}
                        onActivityChange={undefined}
                        t={t}
                        onRecordingSaved={undefined}
                        isAudioLoading={isAudioLoading}
                        displayPronunciation={displayPronunciation}
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
                            <button className="btn">{String(t("sound_page.closeBtn"))}</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default WordDetails;
