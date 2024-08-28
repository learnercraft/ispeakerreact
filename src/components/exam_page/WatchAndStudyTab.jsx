import { useState } from "react";
import { Accordion, Card, Col, Row, Modal, Image, Form } from "react-bootstrap";
import Ratio from "react-bootstrap/Ratio";

const WatchAndStudyTab = ({ videoUrl, taskData, dialog, skills }) => {
    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState("");

    const handleImageClick = (imageName) => {
        setModalImage(`/images/ispeaker/Exam/jpg/${imageName}.jpg`);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    // State for highlighting the dialog
    const [highlightState, setHighlightState] = useState({
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
    });

    const handleCheckboxChange = (index) => {
        setHighlightState((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    const getHighlightClass = (index) => {
        switch (index) {
            case 1:
                return "text-bg-primary";
            case 2:
                return "text-bg-secondary";
            case 3:
                return "text-bg-success";
            case 4:
                return "text-bg-warning";
            case 5:
                return "text-bg-danger";
            case 6:
                return "text-bg-info";
            default:
                return "";
        }
    };

    const highlightDialog = (speech) => {
        return speech.replace(/highlight-dialog-(\d+)/g, (match, p1) => {
            const className = getHighlightClass(parseInt(p1, 10));
            return highlightState[p1] ? `${className} ${match}` : `${match}`;
        });
    };

    return (
        <>
            <Card className="mb-4">
                <Card.Header className="fw-semibold">Task</Card.Header>
                <Card.Body>
                    <Row className="g-4 d-flex justify-content-center">
                        {taskData.images.map((image, index) => (
                            <Col md={4} key={index}>
                                <Ratio aspectRatio="16x9">
                                    <Image
                                        role="button"
                                        src={`/images/ispeaker/Exam/webp/${image}.webp`}
                                        thumbnail
                                        onClick={() => handleImageClick(image)}
                                    />
                                </Ratio>
                            </Col>
                        ))}
                    </Row>
                    <div className="mt-3">
                        {taskData.para.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                        {taskData.listItems.length > 0 && (
                            <ul>
                                {taskData.listItems.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Card.Body>
            </Card>
            <Row className="g-4">
                <Col md={6}>
                    <Card>
                        <Card.Header className="fw-semibold">Watch the video</Card.Header>
                        <Card.Body>
                            <Ratio aspectRatio="16x9">
                                <iframe src={videoUrl} title="Video" allowFullScreen loading="lazy" />
                            </Ratio>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className="fw-semibold">Study</div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="dialog-section mb-4">
                                    {dialog.map((line, index) => (
                                        <div key={index}>
                                            <strong>{line.speaker}: </strong>
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: highlightDialog(line.speech),
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-body-tertiary p-3">
                                    {skills.map((skill, index) => (
                                        <Form.Check key={index} id={`skilllabel-${index}`} label={skill.label}>
                                            <Form.Check.Input
                                                type="checkbox"
                                                checked={!!highlightState[index + 1]}
                                                onChange={() => handleCheckboxChange(index + 1)}
                                            />
                                            <Form.Check.Label>
                                                <span
                                                    className={
                                                        highlightState[index + 1] ? getHighlightClass(index + 1) : ""
                                                    }>
                                                    {skill.label}
                                                </span>
                                            </Form.Check.Label>
                                        </Form.Check>
                                    ))}
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton className="fw-semibold">
                    <Modal.Title>Full size view</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Image src={modalImage} fluid />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default WatchAndStudyTab;
