import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    IoCheckmarkCircleOutline,
    IoCloseCircleOutline,
    IoInformationCircleOutline,
    IoWarningOutline,
} from "react-icons/io5";
import PronunciationCheckerDialogContent from "./PronunciationCheckerDialogContent";
import PronunciationCheckerInfo from "./PronunciationCheckerInfo";
import {
    checkPythonInstalled,
    downloadModelStepIPC,
    installDependenciesIPC,
} from "./PronunciationUtils";
import {
    getPronunciationStepStatuses,
    getPronunciationInstallState,
} from "./pronunciationStepUtils";
import modelOptions from "./modelOptions";

const PronunciationSettings = () => {
    const { t } = useTranslation();
    const confirmDialogRef = useRef(null);
    const checkerDialogRef = useRef(null);
    const [pythonCheckResult, setPythonCheckResult] = useState(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [installState, setInstallState] = useState("not_installed");
    // Model selection state
    const [modelValue, setModelValue] = useState("vitouphy/wav2vec2-xls-r-300m-timit-phoneme");
    const onModelChange = (value) => setModelValue(value);

    const openConfirmDialog = () => {
        confirmDialogRef.current?.showModal();
    };

    const closeConfirmDialog = () => {
        confirmDialogRef.current?.close();
    };

    const openCheckerDialog = () => {
        checkerDialogRef.current?.showModal();
    };

    const closeCheckerDialog = () => {
        checkerDialogRef.current?.close();
        // Update installState after closing if all steps are done
        const { step1Status, step2Status, step3Status } = getPronunciationStepStatuses(
            pythonCheckResult,
            checking,
            error
        );
        const allStepsDone = [step1Status, step2Status, step3Status].every(
            (status) => status === "success" || status === "error"
        );
        if (allStepsDone) {
            // Transform pythonCheckResult to expected structure for getPronunciationInstallState
            const installStatusObj = {
                python: { found: pythonCheckResult?.found },
                dependencies: pythonCheckResult?.deps,
                model: { status: pythonCheckResult?.modelStatus },
            };
            setInstallState(getPronunciationInstallState(installStatusObj));
        }
    };

    // Helper to save install status to electron-conf
    const saveInstallStatus = async (result) => {
        if (window.electron?.ipcRenderer) {
            await window.electron.ipcRenderer.invoke("set-pronunciation-install-status", result);
        }
    };

    // On mount, load cached install status
    useEffect(() => {
        const fetchInstallStatus = async () => {
            if (window.electron?.ipcRenderer) {
                const cachedStatus = await window.electron.ipcRenderer.invoke(
                    "get-pronunciation-install-status"
                );
                const state = getPronunciationInstallState(cachedStatus);
                setInstallState(state);
                console.log("cachedStatus", cachedStatus);
                if (state === "complete") {
                    setPythonCheckResult(cachedStatus);
                    setError(null);
                } else if (state === "failed") {
                    setPythonCheckResult(cachedStatus);
                    setError(
                        cachedStatus?.log ||
                            cachedStatus?.modelMessage ||
                            cachedStatus?.dependencyLog ||
                            "Installation failed."
                    );
                    window.electron.log("error", `Pronunciation install failed. ${cachedStatus}`);
                } else {
                    setPythonCheckResult(null);
                    setError(null);
                }
            }
        };
        fetchInstallStatus();
    }, []);

    // Listen for dependency installation progress
    useEffect(() => {
        const handleDepProgress = (_event, depStatus) => {
            setPythonCheckResult((prev) => {
                let deps = Array.isArray(prev?.deps) ? [...prev.deps] : [];
                const idx = deps.findIndex((d) => d.name === depStatus.name);
                if (idx !== -1) deps[idx] = depStatus;
                else deps.push(depStatus);
                const updated = {
                    ...prev,
                    deps,
                    dependencyLog: depStatus.log || prev?.dependencyLog || "",
                };
                return updated;
            });
        };
        const handleCancelled = () => {
            setIsCancelling(false);
            setChecking(false);
            setPythonCheckResult(null);
            setError(null);
            checkerDialogRef.current?.close();
        };
        if (window.electron?.ipcRenderer) {
            window.electron.ipcRenderer.on("pronunciation-dep-progress", handleDepProgress);
            window.electron.ipcRenderer.on("pronunciation-cancelled", handleCancelled);
        }
        return () => {
            if (window.electron?.ipcRenderer) {
                window.electron.ipcRenderer.removeListener(
                    "pronunciation-dep-progress",
                    handleDepProgress
                );
                window.electron.ipcRenderer.removeListener(
                    "pronunciation-cancelled",
                    handleCancelled
                );
            }
        };
    }, []);

    // Listen for model download progress (live console output)
    useEffect(() => {
        const handleModelProgress = (_event, msg) => {
            setPythonCheckResult((prev) => {
                const updated = {
                    ...prev,
                    log: undefined, // Remove old log field if present
                    modelLog: (prev?.modelLog ? prev.modelLog + "\n" : "") + (msg.message || ""),
                    modelStatus: msg.status,
                    modelMessage: msg.message,
                };
                return updated;
            });
        };
        if (window.electron?.ipcRenderer) {
            window.electron.ipcRenderer.on("pronunciation-model-progress", handleModelProgress);
        }
        return () => {
            if (window.electron?.ipcRenderer) {
                window.electron.ipcRenderer.removeListener(
                    "pronunciation-model-progress",
                    handleModelProgress
                );
            }
        };
    }, []);

    // Decoupled logic for checking Python installation
    const checkPython = async () => {
        setChecking(true);
        setError(null);
        setPythonCheckResult(null);
        try {
            const result = await checkPythonInstalled();
            setPythonCheckResult((prev) => ({
                ...prev,
                pythonLog: result.log || "",
                ...result,
            }));
            if (result.found) {
                installDependencies();
            }
        } catch (err) {
            console.error("[Pronunciation] Python check error:", err);
            setError(err.message || String(err));
        } finally {
            setChecking(false);
        }
    };

    // Function to trigger dependency installation
    const installDependencies = async () => {
        if (window.electron?.ipcRenderer) {
            setChecking(true);
            try {
                const result = await installDependenciesIPC();
                setPythonCheckResult((prev) => {
                    const updated = { ...prev, ...result };
                    return updated;
                });
                if (result.deps && result.deps.every((dep) => dep.status === "success")) {
                    downloadModelStep();
                }
            } catch (err) {
                console.error("[Pronunciation] Dependency install error:", err);
                setError(err.message || String(err));
                window.electron.log(
                    "error",
                    `Dependency install error: ${err.message || String(err)}`
                );
            } finally {
                setChecking(false);
            }
        }
    };

    const downloadModelStep = async () => {
        if (window.electron?.ipcRenderer) {
            setChecking(true);
            setPythonCheckResult((prev) => {
                const updated = {
                    ...prev,
                    modelStatus: "downloading",
                    log: (prev?.log ? prev.log + "\n" : "") + "Starting model download...\n",
                };
                return updated;
            });
            try {
                // Pass modelValue to IPC
                const result = await downloadModelStepIPC(modelValue);
                setPythonCheckResult((prev) => {
                    const updated = { ...prev, ...result };
                    return updated;
                });
            } catch (err) {
                console.error("[Pronunciation] Model download error:", err);
                setPythonCheckResult((prev) => {
                    const updated = {
                        ...prev,
                        modelStatus: "error",
                        log: (prev?.log ? prev.log + "\n" : "") + (err.message || String(err)),
                    };
                    return updated;
                });
                window.electron.log("error", `Model download error: ${err.message || String(err)}`);
            } finally {
                setChecking(false);
            }
        }
    };

    // Save install status when installation is complete (all steps done)
    useEffect(() => {
        const { step1Status, step2Status, step3Status } = getPronunciationStepStatuses(
            pythonCheckResult,
            checking,
            error
        );
        const allStepsDone = [step1Status, step2Status, step3Status].every(
            (status) => status === "success" || status === "error"
        );
        if (pythonCheckResult && allStepsDone) {
            saveInstallStatus(pythonCheckResult);
        }
    }, [pythonCheckResult, checking, error]);

    const handleProceed = async () => {
        closeConfirmDialog();
        openCheckerDialog();
        if (window.electron?.ipcRenderer) {
            await window.electron.ipcRenderer.invoke("pronunciation-reset-cancel-flag");
        }
        checkPython();
    };

    // Use shared utility for step statuses
    const { step1Status, step2Status, step3Status } = getPronunciationStepStatuses(
        pythonCheckResult,
        checking,
        error
    );
    // Consider all steps done if none are pending
    const allStepsDone = [step1Status, step2Status, step3Status].every(
        (status) => status === "success" || status === "error"
    );
    // Consider installation failed if all steps are done and at least one is error
    const installationFailed =
        allStepsDone &&
        [step1Status, step2Status, step3Status].some((status) => status === "error");

    // Find the selected model's size
    const selectedModel = modelOptions.find((opt) => opt.value === modelValue);
    const selectedModelSize = selectedModel ? selectedModel.size : "";

    return (
        <>
            <div className="mt-4">
                <div className="flex gap-x-8 gap-y-6">
                    <div className="flex basis-1/2 items-center space-y-1">
                        <p className="font-semibold">
                            {t("settingPage.pronunciationSettings.pronunciationHeading")}
                        </p>
                    </div>
                    <div className="flex basis-1/2 justify-end">
                        {installState === "complete" ? (
                            <button className="btn" onClick={openConfirmDialog}>
                                {t("settingPage.pronunciationSettings.reinstallBtn")}
                            </button>
                        ) : (
                            <button className="btn" onClick={openConfirmDialog}>
                                {t("settingPage.pronunciationSettings.pronunciationBtn")}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation dialog */}
            <dialog ref={confirmDialogRef} className="modal">
                <PronunciationCheckerDialogContent
                    t={t}
                    checking={checking}
                    closeConfirmDialog={closeConfirmDialog}
                    handleProceed={handleProceed}
                    installState={installState}
                    modelValue={modelValue}
                    onModelChange={onModelChange}
                    error={error}
                />
            </dialog>

            {/* Checker dialog */}
            <dialog ref={checkerDialogRef} className="modal">
                <div className="modal-box w-3/4 max-w-2xl">
                    <h3 className="text-lg font-bold">
                        {t("settingPage.pronunciationSettings.installationProcess")}
                    </h3>

                    {!allStepsDone ? (
                        <div className="py-4">
                            <div role="alert" className="alert alert-warning text-base">
                                <IoWarningOutline className="h-6 w-6" />
                                <span>
                                    {t(
                                        "settingPage.pronunciationSettings.installationProcessWarning"
                                    )}
                                </span>
                            </div>
                        </div>
                    ) : installationFailed ? (
                        <div className="py-4">
                            <div role="alert" className="alert alert-error text-base">
                                <IoCloseCircleOutline className="h-6 w-6" />
                                <span>
                                    {t(
                                        "settingPage.pronunciationSettings.installationProcessFailed"
                                    )}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="py-4">
                            <div role="alert" className="alert alert-success text-base">
                                <IoCheckmarkCircleOutline className="h-6 w-6" />
                                <span>
                                    {t(
                                        "settingPage.pronunciationSettings.installationProcessSuccess"
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    {isCancelling && (
                        <div className="py-4">
                            <div role="alert" className="alert alert-info text-base">
                                <IoInformationCircleOutline className="h-6 w-6" />
                                {t(
                                    "settingPage.pronunciationSettings.installationProcessCancelling"
                                )}
                            </div>
                        </div>
                    )}

                    <PronunciationCheckerInfo
                        t={t}
                        checking={checking || isCancelling}
                        error={error}
                        pythonCheckResult={pythonCheckResult}
                        modelSize={selectedModelSize}
                    />
                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={
                                !allStepsDone
                                    ? () => {
                                          if (window.electron?.ipcRenderer) {
                                              setIsCancelling(true);
                                              window.electron.ipcRenderer.invoke(
                                                  "pronunciation-cancel-process"
                                              );
                                          }
                                      }
                                    : closeCheckerDialog
                            }
                            disabled={isCancelling}
                        >
                            {!allStepsDone ? (
                                isCancelling ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm mr-2"
                                            role="status"
                                        />
                                        {t("settingPage.exerciseSettings.cancelBtn")}
                                    </>
                                ) : (
                                    t("settingPage.exerciseSettings.cancelBtn")
                                )
                            ) : (
                                t("sound_page.closeBtn", "Close")
                            )}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default PronunciationSettings;
