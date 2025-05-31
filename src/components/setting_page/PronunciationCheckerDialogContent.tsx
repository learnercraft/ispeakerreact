import { Trans } from "react-i18next";
import { IoInformationCircleOutline } from "react-icons/io5";
import openExternal from "../../utils/openExternal.js";
import modelOptions from "./modelOptions.js";

interface PronunciationCheckerDialogContentProps {
    t: (key: string, options?: Record<string, unknown>) => string;
    checking: boolean;
    closeConfirmDialog: () => void;
    handleProceed: () => void;
    installState: "not_installed" | "failed" | "complete";
    modelValue: string;
    onModelChange: (value: string) => void;
}

const PronunciationCheckerDialogContent = ({
    t,
    checking,
    closeConfirmDialog,
    handleProceed,
    installState,
    modelValue,
    onModelChange,
}: PronunciationCheckerDialogContentProps) => {
    const selectedModel = modelOptions.find((opt) => opt.value === modelValue);
    return (
        <div className="modal-box">
            <h3 className="text-lg font-bold">
                {t("settingPage.pronunciationSettings.pronunciationModalHeading")}
            </h3>
            <div className="py-4">
                {/* Model selection dropdown */}
                <div className="mb-4">
                    <label className="mb-2 block font-semibold">
                        {t("settingPage.pronunciationSettings.modelSelectLabel")}
                        <div className="dropdown dropdown-bottom dropdown-center">
                            <button
                                type="button"
                                title={t("settingPage.pronunciationSettings.modelExplanationTitle")}
                                tabIndex={0}
                                role="button"
                                className="btn btn-circle btn-ghost btn-sm align-middle"
                            >
                                <IoInformationCircleOutline className="h-5 w-5" />
                            </button>
                            <div
                                tabIndex={0}
                                className="dropdown-content card bg-base-100 z-3 w-96 text-base font-normal shadow-md"
                            >
                                <div className="card-body">
                                    <h3 className="text-base font-semibold">
                                        {t(
                                            "settingPage.pronunciationSettings.modelExplanationTitle"
                                        )}
                                    </h3>
                                    <p>
                                        {t(
                                            "settingPage.pronunciationSettings.modelExplanationBody"
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </label>
                    <select
                        title={t("settingPage.pronunciationSettings.modelSelectLabel")}
                        className="select select-bordered w-full"
                        value={modelValue}
                        onChange={(e) => onModelChange(e.target.value)}
                        disabled={checking}
                    >
                        {modelOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.value} ({opt.size})
                            </option>
                        ))}
                    </select>
                    {/* Show description for selected model */}
                    <div className="mt-2 min-h-[1.5em] text-sm text-gray-600 dark:text-slate-400">
                        {selectedModel && t(selectedModel.description)}
                    </div>
                </div>
                {installState === "failed" && (
                    <div className="alert alert-error mb-4 text-base">
                        <IoInformationCircleOutline className="h-6 w-6" />
                        <div>
                            <p className="mb-2">
                                {t("settingPage.pronunciationSettings.previousInstallFailedMsg")}
                            </p>
                            <p>
                                <Trans
                                    i18nKey="settingPage.pronunciationSettings.pronunciationModalBodyPython2"
                                    components={[
                                        <a
                                            key="python-link"
                                            type="button"
                                            className="link font-semibold underline"
                                            onClick={() =>
                                                openExternal(
                                                    "https://learnercraft.github.io/blog/2025-05-20-how-to-install-python-for-beginners/"
                                                )
                                            }
                                        />,
                                    ]}
                                />
                            </p>
                        </div>
                    </div>
                )}
                {installState === "complete" && (
                    <div className="alert alert-info mb-4 text-base">
                        <IoInformationCircleOutline className="h-6 w-6" />
                        <span>{t("settingPage.pronunciationSettings.previousInstallMsg")}</span>
                    </div>
                )}
                {installState === "not_installed" && (
                    <div role="alert" className="alert alert-info mb-4 text-base">
                        <IoInformationCircleOutline className="h-6 w-6" />
                        <div>
                            <p className="mb-2">
                                <Trans
                                    i18nKey="settingPage.pronunciationSettings.pronunciationModalBodyPython"
                                    components={[
                                        <a
                                            key="python-link"
                                            type="button"
                                            className="link font-semibold underline"
                                            onClick={() =>
                                                openExternal("https://www.python.org/downloads/")
                                            }
                                        />,
                                    ]}
                                />
                            </p>
                            <p>
                                <Trans
                                    i18nKey="settingPage.pronunciationSettings.pronunciationModalBodyPython2"
                                    components={[
                                        <a
                                            key="python-link"
                                            type="button"
                                            className="link font-semibold underline"
                                            onClick={() =>
                                                openExternal(
                                                    "https://learnercraft.github.io/blog/2025-05-20-how-to-install-python-for-beginners/"
                                                )
                                            }
                                        />,
                                    ]}
                                />
                            </p>
                        </div>
                    </div>
                )}
                <p>{t("settingPage.pronunciationSettings.pronunciationModalBody")}</p>
            </div>

            <div className="modal-action">
                <button
                    type="button"
                    className="btn"
                    onClick={closeConfirmDialog}
                    disabled={checking}
                >
                    {t("settingPage.exerciseSettings.cancelBtn")}
                </button>
                {!checking && (
                    <button type="button" className="btn btn-primary" onClick={handleProceed}>
                        {t("settingPage.pronunciationSettings.pronunciationModalBtn")}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PronunciationCheckerDialogContent;
