import { useEffect, useRef, useState } from "react";
import { IoCheckmark, IoCloseOutline } from "react-icons/io5";
import {
    getPronunciationStepStatuses,
    PronunciationInstallStatus,
    PronunciationStepStatus,
} from "./pronunciationStepUtils.js";

interface PronunciationCheckerInfoProps {
    t: (key: string, options?: Record<string, unknown>) => string;
    checking: boolean;
    error: string | null;
    pythonCheckResult: PronunciationInstallStatus | null;
    modelSize: string;
}

const PronunciationCheckerInfo = ({
    t,
    checking,
    error,
    pythonCheckResult,
    modelSize,
}: PronunciationCheckerInfoProps) => {
    // Helper to get status icon
    const getStatusIcon = (status: PronunciationStepStatus) => {
        if (status === "pending")
            return <span className="loading loading-spinner loading-sm"></span>;
        if (status === "success")
            return <IoCheckmark className="text-success h-5 w-5 items-center" />;
        if (status === "error")
            return <IoCloseOutline className="text-error h-5 w-5 items-center" />;
        return null;
    };

    const { step1Status, step2Status, step3Status, deps } = getPronunciationStepStatuses(
        pythonCheckResult,
        checking,
        error
    );

    const steps = [
        {
            key: "step1",
            label: t("settingPage.pronunciationSettings.installationProcessStep1"),
            status: step1Status,
        },
        {
            key: "step2",
            label: t("settingPage.pronunciationSettings.installationProcessStep2"),
            status: step2Status,
            deps,
        },
        {
            key: "step3",
            label: t("settingPage.pronunciationSettings.installationProcessStep3", {
                size: modelSize,
            }),
            status: step3Status,
        },
    ];

    // Ref for the log container
    const logRef = useRef<HTMLDivElement | null>(null);
    // Get the log output
    const logOutput = [
        pythonCheckResult?.pythonLog
            ? `--- Python Check ---\n${pythonCheckResult.pythonLog}`
            : null,
        pythonCheckResult?.dependencyLog
            ? `--- Dependency Installation ---\n${pythonCheckResult.dependencyLog}`
            : null,
        pythonCheckResult?.modelLog
            ? `--- Model Download ---\n${pythonCheckResult.modelLog}`
            : null,
    ]
        .filter(Boolean)
        .join("\n\n");
    // Auto-scroll to bottom when log changes
    useEffect(() => {
        if (logRef.current && logOutput) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logOutput]);

    // Add state for copy confirmation
    const [copied, setCopied] = useState(false);

    return (
        <div className="mt-2">
            <ol className="mb-4 space-y-2">
                {steps.map((step) => (
                    <li key={step.key} className="flex items-start gap-x-2">
                        <div className="flex gap-x-2 pt-1">{getStatusIcon(step.status)}</div>
                        <div className="flex min-w-0 flex-auto flex-col gap-x-4">
                            <div className="flex min-w-0 flex-auto items-center gap-x-2">
                                {step.label}
                                {step.status === "success" && (
                                    <span className="text-success font-semibold">
                                        {t("settingPage.pronunciationSettings.stepDone")}
                                    </span>
                                )}
                                {step.status === "error" && (
                                    <span className="text-error font-semibold">
                                        {t("settingPage.pronunciationSettings.stepFailed")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
            <div className="bg-base-100 border-base-300 collapse-arrow collapse border dark:border-slate-600">
                <input
                    type="checkbox"
                    title={t("settingPage.pronunciationSettings.showDetailsCollapse")}
                />
                <div className="collapse-title font-semibold">
                    {t("settingPage.pronunciationSettings.showDetailsCollapse")}
                </div>
                <div className="collapse-content text-sm">
                    {checking && (
                        <div className="mb-2">
                            <span className="loading loading-spinner loading-sm"></span>
                        </div>
                    )}
                    {error && <div className="text-error mb-2">{error}</div>}
                    {pythonCheckResult && (
                        <div>
                            {logOutput ? (
                                <>
                                    <div
                                        ref={logRef}
                                        className="bg-base-200 border-base-300 mb-4 max-h-60 overflow-y-auto rounded border p-2 font-mono whitespace-pre-wrap"
                                    >
                                        {logOutput}
                                    </div>

                                    <button
                                        className="btn btn-sm btn-outline mb-2"
                                        type="button"
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(
                                                `\u0060\u0060\u0060\n${logOutput}\n\u0060\u0060\u0060`
                                            );
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1500);
                                        }}
                                    >
                                        {copied
                                            ? t(
                                                  "settingPage.pronunciationSettings.pronunciationCopyLogCopied"
                                              )
                                            : t(
                                                  "settingPage.pronunciationSettings.pronunciationCopyLogBtn"
                                              )}
                                    </button>
                                </>
                            ) : pythonCheckResult.stderr ? (
                                <div>
                                    <span className="font-bold">Stderr:</span>{" "}
                                    <pre className="inline whitespace-pre-wrap">
                                        {pythonCheckResult.stderr}
                                    </pre>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PronunciationCheckerInfo;
