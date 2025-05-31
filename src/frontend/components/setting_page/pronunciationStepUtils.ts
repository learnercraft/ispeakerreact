// Types for pronunciation checker install process

export type PronunciationStepStatus = "pending" | "success" | "error";

export interface PronunciationDependency {
    name: string;
    status: "pending" | "success" | "error" | "cancelled";
    log?: string;
}

export interface PronunciationPythonStatus {
    found: boolean;
    version?: string | null;
    stderr?: string;
    log?: string;
}

export interface PronunciationModelStatus {
    status: "pending" | "success" | "error" | "found" | "downloading" | string;
    message?: string;
    log?: string;
}

export interface PronunciationInstallStatus {
    python?: PronunciationPythonStatus;
    dependencies?: PronunciationDependency[];
    model?: PronunciationModelStatus;
    stderr?: string;
    log?: string;
    timestamp?: number;
    // For legacy/IPC compatibility
    found?: boolean;
    version?: string | null;
    deps?: PronunciationDependency[];
    modelStatus?: string;
    modelMessage?: string;
    modelLog?: string;
    pythonLog?: string;
    dependencyLog?: string;
}

// Utility to calculate step statuses for pronunciation checker
export const getPronunciationStepStatuses = (
    pythonCheckResult: PronunciationInstallStatus | null,
    checking: boolean,
    error: string | null
): {
    step1Status: PronunciationStepStatus;
    step2Status: PronunciationStepStatus;
    step3Status: PronunciationStepStatus;
    deps: PronunciationDependency[] | undefined;
} => {
    // Step 1: Checking Python installation
    const step1Status: PronunciationStepStatus = checking
        ? "pending"
        : error
          ? "error"
          : pythonCheckResult && pythonCheckResult.found
            ? "success"
            : pythonCheckResult && pythonCheckResult.found === false
              ? "error"
              : "pending";

    // Step 2: Installing dependencies
    let step2Status: PronunciationStepStatus = "pending";
    const deps =
        pythonCheckResult && Array.isArray(pythonCheckResult.deps)
            ? pythonCheckResult.deps
            : undefined;
    if (step1Status === "error") {
        step2Status = "error";
    } else if (deps) {
        if (deps.some((dep) => dep.status === "error")) step2Status = "error";
        else if (deps.every((dep) => dep.status === "success")) step2Status = "success";
        else if (deps.some((dep) => dep.status === "pending")) step2Status = "pending";
    } else if (step1Status === "success") {
        step2Status = checking ? "pending" : "success";
    }

    // Step 3: Downloading phoneme model
    let step3Status: PronunciationStepStatus = "pending";
    if (step1Status === "error" || step2Status === "error") {
        step3Status = "error";
    } else if (pythonCheckResult && pythonCheckResult.modelStatus) {
        if (
            pythonCheckResult.modelStatus === "found" ||
            pythonCheckResult.modelStatus === "success"
        ) {
            step3Status = "success";
        } else if (pythonCheckResult.modelStatus === "downloading") {
            step3Status = "pending";
        } else if (pythonCheckResult.modelStatus === "error") {
            step3Status = "error";
        }
    } else if (checking) {
        step3Status = "pending";
    }

    return { step1Status, step2Status, step3Status, deps };
};

// Utility to determine overall install state: 'not_installed', 'failed', or 'complete'
export const getPronunciationInstallState = (
    statusObj: PronunciationInstallStatus | null
): "not_installed" | "failed" | "complete" => {
    if (!statusObj) return "not_installed";
    // Recursively check for any error/failed status
    const hasErrorStatus = (obj: unknown): boolean => {
        if (!obj || typeof obj !== "object") return false;
        if (Array.isArray(obj)) {
            return obj.some(hasErrorStatus);
        }
        for (const key in obj) {
            const value = (obj as Record<string, unknown>)[key];
            if (
                (key === "status" &&
                    (value === "error" || value === "failed" || value === "cancelled")) ||
                (key === "found" && value === false)
            ) {
                return true;
            }
            if (typeof value === "object" && value !== null && hasErrorStatus(value)) {
                return true;
            }
        }
        return false;
    };
    if (hasErrorStatus(statusObj)) return "failed";
    // If all steps are success/found, consider complete
    if (
        statusObj.python?.found === true &&
        (!statusObj.dependencies ||
            (Array.isArray(statusObj.dependencies) &&
                statusObj.dependencies.every((dep) => dep.status === "success"))) &&
        (statusObj.model?.status === "found" || statusObj.model?.status === "success")
    ) {
        return "complete";
    }
    return "not_installed";
};
