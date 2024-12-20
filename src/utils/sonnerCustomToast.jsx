import { IoAlertCircleOutline, IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import { toast } from "sonner";

export const sonnerSuccessToast = (message) => {
    toast.custom(() => (
        <div className="alert alert-success shadow-lg" role="alert">
            <IoCheckmarkCircleOutline className="h-6 w-6" />
            <span>{message}</span>
        </div>
    ));
};

export const sonnerWarningToast = (message) => {
    toast.custom(() => (
        <div className="alert alert-warning shadow-lg" role="alert">
            <IoWarningOutline className="h-6 w-6" />
            <span>{message}</span>
        </div>
    ));
};

export const sonnerErrorToast = (message) => {
    toast.custom(() => (
        <div className="alert alert-error shadow-lg" role="alert">
            <IoAlertCircleOutline className="h-6 w-6" />
            <span>{message}</span>
        </div>
    ));
};
