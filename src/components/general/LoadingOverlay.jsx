import { Spinner } from "react-bootstrap";

const LoadingOverlay = () => {
    return (
        <div
            id="loader-wrapper"
            className="loading-overlay"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(var(--bs-body-bg-rgb), 0.8)",
                zIndex: 10000,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
            <Spinner animation="border" role="status" variant="primary" style={{ width: "4rem", height: "4rem" }}>
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );
};

export default LoadingOverlay;
