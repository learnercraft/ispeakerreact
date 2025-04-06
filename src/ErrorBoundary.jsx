import { useTranslation } from "react-i18next";
import ErrorBoundaryInner from "./ErrorBoundaryInner";

const ErrorBoundary = (props) => {
    const { t } = useTranslation();

    return <ErrorBoundaryInner {...props} t={t} />;
};

export default ErrorBoundary;
