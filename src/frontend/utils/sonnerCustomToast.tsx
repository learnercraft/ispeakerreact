import { IoAlertCircleOutline, IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import { toast } from "sonner";

const sonnerSuccessToast = (message: string) => {
    toast.custom(() => (
        <div className="alert alert-success shadow-lg" role="alert">
            <IoCheckmarkCircleOutline className="h-6 w-6" />
            <span>{message}</span>
        </div>
    ));
};

const sonnerWarningToast = (message: string) => {
    toast.custom(() => (
        <div className="alert alert-warning shadow-lg" role="alert">
            <IoWarningOutline className="h-6 w-6" />
            <span>{message}</span>
        </div>
    ));
};

const sonnerErrorToast = (message: string) => {
    toast.custom(() => (
        <div className="alert alert-error shadow-lg" role="alert">
            <IoAlertCircleOutline className="h-6 w-6" />
            <span>{message}</span>
        </div>
    ));
};

export { sonnerErrorToast, sonnerSuccessToast, sonnerWarningToast };
