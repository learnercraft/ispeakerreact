import { Toast, ToastContainer } from "react-bootstrap";
import CloseButton from "react-bootstrap/CloseButton";

const ToastNotification = ({ show, onClose, message, variant, autohide = true, delay = 10000 }) => {
    return (
        <ToastContainer className="p-3 sticky-bottom bottom-0 start-50">
            <Toast
                show={show}
                onClose={onClose}
                className={`d-flex text-bg-${variant} border-0 align-items-center`}
                autohide={autohide}
                delay={delay}>
                <Toast.Body>{message}</Toast.Body>
                <CloseButton className="me-2 m-auto" />
            </Toast>
        </ToastContainer>
    );
};

export default ToastNotification;
