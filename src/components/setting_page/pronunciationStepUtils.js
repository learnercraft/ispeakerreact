// Utility to calculate step statuses for pronunciation checker
const getPronunciationStepStatuses = (pythonCheckResult, checking, error) => {
    // Step 1: Checking Python installation
    let step1Status = checking
        ? "pending"
        : error
          ? "error"
          : pythonCheckResult && pythonCheckResult.found
            ? "success"
            : pythonCheckResult && pythonCheckResult.found === false
              ? "error"
              : "pending";

    // Step 2: Installing dependencies
    let step2Status = "pending";
    let deps = pythonCheckResult && pythonCheckResult.deps;
    if (step1Status === "error") {
        step2Status = "error";
    } else if (deps && Array.isArray(deps)) {
        if (deps.some((dep) => dep.status === "error")) step2Status = "error";
        else if (deps.every((dep) => dep.status === "success")) step2Status = "success";
        else if (deps.some((dep) => dep.status === "pending")) step2Status = "pending";
    } else if (step1Status === "success") {
        step2Status = checking ? "pending" : "success";
    }

    // Step 3: Downloading phoneme model
    let step3Status = "pending";
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
const getPronunciationInstallState = (statusObj) => {
    if (!statusObj) return "not_installed";
    // Recursively check for any error/failed status
    const hasErrorStatus = (obj) => {
        if (!obj || typeof obj !== "object") return false;
        if (Array.isArray(obj)) {
            return obj.some(hasErrorStatus);
        }
        for (const key in obj) {
            if (
                (key === "status" &&
                    (obj[key] === "error" || obj[key] === "failed" || obj[key] === "cancelled")) ||
                (key === "found" && obj[key] === false)
            ) {
                return true;
            }
            if (typeof obj[key] === "object" && hasErrorStatus(obj[key])) {
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

export { getPronunciationInstallState, getPronunciationStepStatuses };
