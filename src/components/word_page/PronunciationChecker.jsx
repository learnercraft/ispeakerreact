import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import convertToWav from "../../utils/ffmpegWavConverter";
import isElectron from "../../utils/isElectron";
import openExternal from "../../utils/openExternal";
import { getPronunciationInstallState } from "../setting_page/pronunciationStepUtils";
import {
    arePhonemesClose,
    charLevenshtein,
    formatToOfficialSpacing,
    normalizeIPAString,
    isLearnerSubstitution,
} from "./ipaUtils";
import { parseIPA } from "./syllableParser";

// Add CSS animation for radial progress
// https://github.com/saadeghi/daisyui/discussions/3206
const radialProgressStyle = `
@property --_value {
    syntax: "<number>";
    inherits: true;
    initial-value: 0;
}
.animate-value {
    animation: grow 1s ease-in-out 0s forwards;
}
@keyframes grow {
    from {
        --_value: 0;
    }
    to {
        --_value: var(--target-value);
    }
}
`;

const PronunciationChecker = ({
    icon,
    disabled,
    wordKey,
    displayPronunciation,
    modelName,
    onLoadingChange,
}) => {
    const { t } = useTranslation();
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const notInstalledDialogRef = useRef();
    const webDialogRef = useRef();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState("");
    const [errorDetails, setErrorDetails] = useState("");
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [showFailedInstall, setShowFailedInstall] = useState(false);
    let accuracyScore = null;

    useEffect(() => {
        if (!isElectron()) return;
        const handler = (_event, msg) => {
            if (msg && msg.status === "progress") {
                setProgress(msg.message);
            }
        };
        window.electron?.ipcRenderer?.on("pronunciation-model-progress", handler);
        return () => {
            window.electron?.ipcRenderer?.removeListener("pronunciation-model-progress", handler);
        };
    }, []);

    useEffect(() => {
        if (showResult) setProgress("");
    }, [showResult]);

    useEffect(() => {
        if (onLoadingChange) onLoadingChange(loading);
    }, [loading, onLoadingChange]);

    const checkPronunciation = async () => {
        if (!isElectron()) {
            // Show dialog for web
            if (webDialogRef.current) {
                webDialogRef.current.showModal();
            }
            return;
        }
        // Fetch install status on demand
        let installStatus = null;
        if (window.electron?.ipcRenderer) {
            installStatus = await window.electron.ipcRenderer.invoke(
                "get-pronunciation-install-status"
            );
        }
        // 1. No install status at all
        const installState = getPronunciationInstallState(installStatus);
        if (installState === "not_installed") {
            setShowFailedInstall(false);
            if (notInstalledDialogRef.current) notInstalledDialogRef.current.showModal();
            return;
        }
        if (installState === "failed") {
            setShowFailedInstall(true);
            if (notInstalledDialogRef.current) notInstalledDialogRef.current.showModal();
            return;
        } else {
            setShowFailedInstall(false);
        }
        setLoading(true);
        setProgress("");
        setErrorDetails("");
        try {
            // 1. Get the original recording blob from Electron
            const originalBlobArrayBuffer = await window.electron.getRecordingBlob(wordKey);
            const originalBlob = new Blob([originalBlobArrayBuffer]);

            // 2. Convert to real WAV
            const realWavBlob = await convertToWav(originalBlob);

            // 3. Save the new WAV to disk with -realwav suffix
            const realWavKey = `${wordKey}-realwav`;
            await window.electron.saveRecording(realWavKey, await realWavBlob.arrayBuffer());

            // 4. Get the file path for the new WAV
            const audioPath = await window.electron.ipcRenderer.invoke(
                "get-recording-path",
                realWavKey
            );

            // 5. Run the Python process with the new WAV and selected model
            const response = await window.electron.ipcRenderer.invoke(
                "pronunciation-check",
                audioPath,
                modelName
            );

            if (response && response.status === "success") {
                const phonemes = response.phonemes;
                const readablePhonemes = phonemes ? JSON.parse(`"${phonemes}"`) : null;
                setResult(readablePhonemes);
            } else {
                setResult(`Error: ${response?.message || "Unknown error"}`);
                setErrorDetails(response?.traceback || response?.message || "Unknown error");
                window.electron.log(
                    "error",
                    `Pronunciation check error. Traceback: ${response?.traceback || "Unknown error"}`
                );
            }
        } catch (err) {
            setResult(`Error: ${err.message || err}`);
            setErrorDetails(err.stack || err.message || JSON.stringify(err));
            window.electron.log(
                "error",
                `Pronunciation check error. Stack trace: ${err.stack || err.message || JSON.stringify(err)}`
            );
        } finally {
            setShowResult(true);
            setLoading(false);
        }
    };

    const parsedPhonemes = parseIPA(displayPronunciation);
    const phoneme = parsedPhonemes.map((syl) => syl.text).join(" ");
    // Remove all spaces for comparison
    const normalizedResultNoSpaces = normalizeIPAString(result).replace(/ /g, "");
    const normalizedPhonemeNoSpaces = normalizeIPAString(phoneme).replace(/ /g, "");
    // Character-based Levenshtein with fuzzy matching
    const phonemeLevenshtein =
        result && phoneme
            ? charLevenshtein(normalizedResultNoSpaces, normalizedPhonemeNoSpaces)
            : null;
    const isClose = phonemeLevenshtein !== null && phonemeLevenshtein <= 1;

    // Display logic: format and highlight aligned model output
    let alignedResult = result;
    let diff = null;
    let rendered = null;
    const resultTooFarOff = phonemeLevenshtein !== null && phonemeLevenshtein > 5;

    if (resultTooFarOff) {
        rendered = <p className="text-accent">{t("wordPage.pronunciationChecker.cannotHear")}</p>;
    } else if (result && phoneme) {
        // Format model output to match official phoneme's spacing
        alignedResult = formatToOfficialSpacing(normalizedResultNoSpaces, phoneme);
        // Build a diff array for rendering (character by character)
        diff = [];
        const modelArr = alignedResult.replace(/ /g, "").split("");
        const officialArr = normalizedPhonemeNoSpaces.split("");
        let i = 0,
            j = 0;
        while (i < modelArr.length && j < officialArr.length) {
            if (arePhonemesClose(modelArr[i], officialArr[j])) {
                diff.push({ type: "same", value: modelArr[i] });
                i++;
                j++;
            } else if (isLearnerSubstitution(modelArr[i], officialArr[j])) {
                diff.push({ type: "substitution", value: modelArr[i] });
                i++;
                j++;
            } else {
                diff.push({ type: "replace", value: modelArr[i] });
                i++;
                j++;
            }
        }
        while (i < modelArr.length) {
            diff.push({ type: "delete", value: modelArr[i] });
            i++;
        }
        while (j < officialArr.length) {
            diff.push({ type: "insert", value: officialArr[j] });
            j++;
        }

        // --- Score calculation ---
        let matchCount = 0;
        let extraAtEnd = 0;
        let mispronounced = 0;
        let totalErrors = 0;

        // Analyze errors
        diff.forEach((d, idx) => {
            if (d.type === "same") {
                matchCount++;
            } else {
                // Check if it's an extra sound at the end
                if (d.type === "delete" && idx >= officialArr.length) {
                    extraAtEnd++;
                } else {
                    totalErrors++;
                    if (d.type === "replace") {
                        mispronounced++;
                    }
                }
            }
        });

        const totalPhonemes = officialArr.length;

        // Calculate score
        if (matchCount === 0 || matchCount / totalPhonemes < 0.3) {
            // Completely different word
            accuracyScore = 0;
        } else {
            // Start with base score
            let score = 100;

            // Count different types of errors present
            const hasExtra = extraAtEnd > 0;
            const hasMispronounced = mispronounced > 0;
            const hasSubstitution = diff.some((d) => d.type === "substitution");
            const otherErrors = totalErrors - mispronounced - extraAtEnd;
            const hasOtherErrors = otherErrors > 0;

            // Calculate error type count
            const errorTypes = [hasExtra, hasMispronounced, hasSubstitution, hasOtherErrors].filter(
                Boolean
            ).length;

            if (errorTypes === 1) {
                // Single error type - be lenient
                if (hasExtra) score -= 10;
                if (hasMispronounced) score -= 10;
                if (hasSubstitution) score -= 5;
                if (hasOtherErrors) score -= 25;
            } else if (errorTypes > 1) {
                // Multiple error types - progressive penalties
                if (hasExtra) score -= 10;
                if (hasMispronounced) score -= 10;
                if (hasSubstitution) score -= 10;
                if (hasOtherErrors) score -= 30;
            }

            accuracyScore = Math.round(Math.max(0, score));
        }
        // --- End score calculation ---

        // Render alignedResult with spaces, highlighting differences
        // Insert spaces to match official phoneme's spacing
        let spaceIdx = 0;
        let charCount = 0;
        const officialSyllables = phoneme.trim().split(/\s+/);
        const syllableBoundaries = officialSyllables.map((syll) => syll.length);
        let currentBoundary = syllableBoundaries[spaceIdx] || 0;
        rendered = [];
        let afterLastSyllable = false;
        for (let idx = 0; idx < diff.length; idx++) {
            const d = diff[idx];
            // Insert a space after the last official syllable if there are extra phonemes
            if (!afterLastSyllable && charCount === currentBoundary && idx !== diff.length - 1) {
                rendered.push(<span key={`space-${idx}`}> </span>);
                spaceIdx++;
                if (spaceIdx >= syllableBoundaries.length) {
                    afterLastSyllable = true;
                }
                currentBoundary += syllableBoundaries[spaceIdx] || 0;
            }
            // If we've just passed the last syllable boundary, insert a separator before extra phonemes
            if (
                afterLastSyllable &&
                charCount === currentBoundary - (syllableBoundaries[spaceIdx - 1] || 0)
            ) {
                rendered.push(
                    <span key={`extra-separator`} className="mx-1 text-xs text-gray-600 dark:text-slate-400">
                        |{/* separator for extra phonemes */}
                    </span>
                );
                // Only insert once
                afterLastSyllable = false;
            }
            if (d.type === "same") rendered.push(<span key={idx}>{d.value}</span>);
            if (d.type === "replace")
                rendered.push(
                    <span key={idx} className="bg-info text-info-content rounded px-1">
                        {d.value}
                    </span>
                );
            if (d.type === "substitution")
                rendered.push(
                    <span key={idx} className="bg-warning text-warning-content rounded px-1">
                        {d.value}
                    </span>
                );
            if (d.type === "insert")
                rendered.push(
                    <span key={idx} className="bg-accent text-accent-content rounded px-1">
                        {d.value}
                    </span>
                );
            if (d.type === "delete")
                rendered.push(
                    <span key={idx} className="bg-error text-error-content rounded px-1">
                        {d.value}
                    </span>
                );
            charCount++;
        }
    }

    return (
        <>
            <div className="my-4 flex w-full flex-col items-center gap-2">
                <button
                    type="button"
                    className="btn btn-info"
                    onClick={checkPronunciation}
                    disabled={disabled || loading}
                >
                    {icon} {t("wordPage.pronunciationChecker.checkPronunciationBtn")}
                </button>
            </div>

            <div
                className={`flex justify-center gap-2 overflow-hidden py-4 transition-all duration-500 ease-in-out ${showResult || loading ? "max-h-3/4 opacity-100" : "max-h-0 opacity-0"}`}
            >
                {(showResult || loading) && (
                    <div className="card card-border card-lg w-full shadow-md md:w-2xl dark:border-slate-600">
                        <div className="card-body">
                            <h2 className="card-title">
                                {t("wordPage.pronunciationChecker.pronunciationResult")}
                            </h2>
                            <div className="divider divider-secondary mt-0 mb-4"></div>
                            {loading ? (
                                <div className="my-2 flex flex-col items-center justify-center">
                                    <span className="loading loading-spinner loading-lg"></span>
                                    <span className="my-2">
                                        {progress || t("wordPage.pronunciationChecker.inProgress")}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    {result && result.startsWith && result.startsWith("Error:") ? (
                                        <>
                                            <p className="text-error">
                                                {t("wordPage.pronunciationChecker.errorOccurred")}
                                            </p>
                                            <p className="font-mono break-words whitespace-pre-wrap">
                                                {result.replace(/^Error:\s*/, "")}
                                            </p>
                                            {errorDetails && (
                                                <div className="flex justify-center">
                                                    <button
                                                        className="link underline"
                                                        type="button"
                                                        onClick={() => setShowErrorDialog(true)}
                                                    >
                                                        {t(
                                                            "wordPage.pronunciationChecker.errorDetails"
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : result === null || resultTooFarOff ? (
                                        <p className="text-accent">
                                            {t("wordPage.pronunciationChecker.cannotHear")}
                                        </p>
                                    ) : (
                                        <>
                                            {accuracyScore !== null && (
                                                <div className="mb-4 flex flex-col items-center">
                                                    <style>{radialProgressStyle}</style>
                                                    <div
                                                        className={`radial-progress animate-value mb-2 ${
                                                            accuracyScore >= 70
                                                                ? "text-primary"
                                                                : accuracyScore >= 40
                                                                  ? "text-warning"
                                                                  : "text-error"
                                                        }`}
                                                        style={{
                                                            "--value": "var(--_value)",
                                                            "--size": "5rem",
                                                            "--target-value": accuracyScore,
                                                        }}
                                                        aria-valuenow={accuracyScore}
                                                        role="progressbar"
                                                    >
                                                        <span className="text-xl font-semibold">
                                                            {accuracyScore}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 italic dark:text-slate-400">
                                                        {t(
                                                            "wordPage.pronunciationChecker.approximateScore"
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                            <p>
                                                <span className="font-bold">
                                                    {t(
                                                        "wordPage.pronunciationChecker.receivedResult"
                                                    )}
                                                </span>{" "}
                                                {rendered}
                                            </p>
                                            <p>
                                                <span className="font-bold">
                                                    {t(
                                                        "wordPage.pronunciationChecker.correctResult"
                                                    )}
                                                </span>{" "}
                                                {phoneme}
                                            </p>
                                            <p className="font-bold">
                                                {t("wordPage.pronunciationChecker.colorLegend")}
                                            </p>
                                            <ul className="list-inside list-disc">
                                                <li>
                                                    <span className="bg-info text-info-content rounded px-1">
                                                        {t(
                                                            "wordPage.pronunciationChecker.colorLegendMispronounce"
                                                        )}
                                                    </span>
                                                </li>
                                                <li>
                                                    <span className="bg-error text-error-content rounded px-1">
                                                        {t(
                                                            "wordPage.pronunciationChecker.colorLegendExtra"
                                                        )}
                                                    </span>
                                                </li>
                                                <li>
                                                    <span className="bg-accent text-accent-content rounded px-1">
                                                        {t(
                                                            "wordPage.pronunciationChecker.colorLegendMissing"
                                                        )}
                                                    </span>
                                                </li>
                                                <li>
                                                    <span className="bg-warning text-warning-content rounded px-1">
                                                        {t(
                                                            "wordPage.pronunciationChecker.colorLegendSubstitution"
                                                        )}
                                                    </span>
                                                </li>
                                            </ul>
                                            {phonemeLevenshtein === 0 && (
                                                <p className="text-success">
                                                    {t(
                                                        "wordPage.pronunciationChecker.perfectResult"
                                                    )}
                                                </p>
                                            )}
                                            {isClose && phonemeLevenshtein !== 0 && (
                                                <p className="text-success">
                                                    {t("wordPage.pronunciationChecker.closeResult")}
                                                </p>
                                            )}
                                            {!isClose && phonemeLevenshtein !== 0 && (
                                                <p className="text-accent">
                                                    {t(
                                                        "wordPage.pronunciationChecker.notSoCloseResult"
                                                    )}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600 italic dark:text-slate-400">
                                                {t("wordPage.pronunciationChecker.disclaimerText")}
                                            </p>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <dialog ref={notInstalledDialogRef} className="modal">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">
                        {showFailedInstall
                            ? t("wordPage.pronunciationChecker.installationProcessFailed")
                            : t("wordPage.pronunciationChecker.pronunciationCheckerNotInstalled")}
                    </h3>
                    <p className="py-4">
                        {showFailedInstall
                            ? t("wordPage.pronunciationChecker.installationProcessFailedMsg")
                            : t(
                                  "wordPage.pronunciationChecker.pronunciationCheckerNotInstalledMsg"
                              )}
                    </p>
                    <div className="modal-action">
                        <button
                            className="btn btn-primary"
                            onClick={() => notInstalledDialogRef.current.close()}
                        >
                            {t("wordPage.pronunciationChecker.okBtn")}
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog ref={webDialogRef} className="modal">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">
                        {t("wordPage.pronunciationChecker.featureNotAvailable")}
                    </h3>
                    <p className="py-4">
                        <Trans
                            i18nKey="wordPage.pronunciationChecker.featureNotAvailableMsg"
                            components={[
                                <button
                                    key="download-link"
                                    type="button"
                                    className="link font-semibold underline"
                                    onClick={() =>
                                        openExternal(
                                            "https://learnercraft.github.io/ispeakerreact/download"
                                        )
                                    }
                                />,
                            ]}
                        />
                    </p>
                    <div className="modal-action">
                        <button
                            className="btn btn-primary"
                            onClick={() => webDialogRef.current.close()}
                        >
                            {t("wordPage.pronunciationChecker.okBtn")}
                        </button>
                    </div>
                </div>
            </dialog>

            {/* Error Details Dialog */}
            <dialog
                open={showErrorDialog}
                className="modal"
                onClose={() => setShowErrorDialog(false)}
            >
                <div className="modal-box">
                    <h3 className="text-lg font-bold">
                        {t("wordPage.pronunciationChecker.errorDetailsTitle")}
                    </h3>
                    <div className="py-4">
                        <pre className="max-h-64 overflow-auto rounded bg-gray-100 p-4 text-sm break-all whitespace-pre-wrap dark:bg-gray-800">
                            {errorDetails}
                        </pre>
                    </div>
                    <div className="modal-action">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowErrorDialog(false)}
                        >
                            {t("wordPage.pronunciationChecker.okBtn")}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
};

PronunciationChecker.propTypes = {
    icon: PropTypes.node,
    disabled: PropTypes.bool,
    wordKey: PropTypes.string.isRequired,
    displayPronunciation: PropTypes.string,
    modelName: PropTypes.string.isRequired,
    onLoadingChange: PropTypes.func,
};

export default PronunciationChecker;
