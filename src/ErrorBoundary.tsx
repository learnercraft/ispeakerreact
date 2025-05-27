import { useTranslation } from "react-i18next";
import ErrorBoundaryInner from "./ErrorBoundaryInner.js";
import type { ErrorBoundaryProps } from "./ErrorBoundaryInner.jsx";

const ErrorBoundary = (props: Omit<ErrorBoundaryProps, "t">) => {
    const { t } = useTranslation();

    return <ErrorBoundaryInner {...props} t={t}>{props.children}</ErrorBoundaryInner>;
};

export default ErrorBoundary;
