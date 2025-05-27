import React from "react";
import { FaGithub } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { HiOutlineClipboardCopy } from "react-icons/hi";
import { Toaster } from "sonner";
import Container from "./ui/Container.js";
import openExternal from "./utils/openExternal.js";
import { sonnerSuccessToast } from "./utils/sonnerCustomToast.js";

// Define the props and state types
export interface ErrorBoundaryProps {
    t: (key: string) => string;
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("React Error Boundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleCopy = () => {
        const { error, errorInfo } = this.state;
        const fullError = `Error log:\n
\`\`\`
App version: v${__APP_VERSION__}\n${error?.toString()}\n\nStack Trace:\n${errorInfo?.componentStack}
\`\`\`
`;

        navigator.clipboard.writeText(fullError).then(() => {
            sonnerSuccessToast(this.props.t("toast.appCrashCopySuccess"));
        });
    };

    handleRefresh = () => location.reload();

    render() {
        const { hasError, error, errorInfo } = this.state;
        const { t } = this.props;

        if (hasError) {
            return (
                <Container>
                    <div className="flex min-h-screen flex-row items-center justify-center">
                        <div className="w-full rounded-lg bg-red-50 p-6 text-red-700 dark:bg-red-300 dark:text-black">
                            <h2 className="mb-4 text-2xl font-bold">
                                🚨 {t("appCrash.appCrashedTitle")}
                            </h2>
                            <p className="mb-4">{t("appCrash.appCrashedDesc")}</p>
                            <div className="card bg-base-100 card-md max-h-100 overflow-auto whitespace-pre-wrap shadow-sm lg:max-h-64">
                                <div className="card-body">
                                    <code className="font-mono! dark:text-red-200">
                                        App version: v{__APP_VERSION__}
                                        {"\n"}
                                        {error?.toString()}
                                        {"\n"}
                                        {errorInfo?.componentStack}
                                    </code>
                                </div>
                            </div>
                            <div className="my-6 flex flex-wrap justify-center gap-2">
                                <button onClick={this.handleCopy} className="btn btn-primary">
                                    <HiOutlineClipboardCopy className="h-5 w-5" />
                                    {t("appCrash.copyBtn")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        openExternal(
                                            "https://github.com/learnercraft/ispeakerreact/issues/new?template=bug_report.yml"
                                        )
                                    }
                                    className="btn btn-info"
                                >
                                    <FaGithub className="h-5 w-5" />
                                    {t("appCrash.openGitHubBtn")}
                                </button>
                                <button type="button" onClick={this.handleRefresh} className="btn btn-secondary">
                                    <FiRefreshCw className="h-5 w-5" />
                                    {t("appCrash.refreshBtn")}
                                </button>
                            </div>
                        </div>
                    </div>
                    <Toaster
                        className="flex justify-center"
                        position="bottom-center"
                        duration={7000}
                    />
                </Container>
            );
        }

        return this.props.children;
    }
}
