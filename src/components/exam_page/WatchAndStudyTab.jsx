import { useState } from "react";
import { Accordion, Alert, Card, Col, Form, Image, Modal, Row } from "react-bootstrap";
import Ratio from "react-bootstrap/Ratio";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { isElectron } from "../../utils/isElectron";

const WatchAndStudyTab = ({ videoUrl, taskData, dialog, skills }) => {
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState("");
    const [iframeLoading, setiFrameLoading] = useState(true);

    const handleImageClick = (imageName) => {
        setModalImage(`${import.meta.env.BASE_URL}images/ispeaker/exam_images/jpg/${imageName}.jpg`);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleIframeLoad = () => setiFrameLoading(false);

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

    const examTaskQuestion = t(taskData.para, { returnObjects: true });
    const examTaskList = taskData.listItems && t(taskData.listItems, { returnObjects: true });

    return (
        <>
            <Card className="mb-4 shadow-sm">
                <Card.Header className="fw-semibold">{t("tabConversationExam.taskCard")}</Card.Header>
                <Card.Body>
                    <Row className="g-4 d-flex justify-content-center">
                        {taskData.images.map((image, index) => (
                            <Col md={4} key={index}>
                                <Ratio aspectRatio="16x9">
                                    <Image
                                        role="button"
                                        src={`${
                                            import.meta.env.BASE_URL
                                        }images/ispeaker/exam_images/webp/${image}.webp`}
                                        thumbnail
                                        onClick={() => handleImageClick(image)}
                                    />
                                </Ratio>
                            </Col>
                        ))}
                    </Row>
                    <div className="mt-3">
                        {examTaskQuestion.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                        {examTaskList && (
                            <ul>
                                {examTaskList.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Card.Body>
            </Card>
            <Row className="g-4">
                <Col md={6}>
                    <Card className="shadow-sm">
                        <Card.Header className="fw-semibold">{t("tabConversationExam.watchCard")}</Card.Header>
                        <Card.Body>
                            <Ratio aspectRatio="16x9">
                                <div>
                                    {isElectron() && videoUrl && videoUrl.startsWith("http://localhost") ? (
                                        <video controls className="w-100 h-100">
                                            <source src={videoUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <>
                                            {iframeLoading && (
                                                <Skeleton className="placeholder" height="100%" width="100%" />
                                            )}
                                            <iframe
                                                src={videoUrl}
                                                title="Exam video"
                                                loading="lazy"
                                                allowFullScreen
                                                onLoad={handleIframeLoad}
                                                style={
                                                    iframeLoading ? { visibility: "hidden" } : { visibility: "visible" }
                                                }
                                                className="w-100 h-100"></iframe>
                                        </>
                                    )}
                                </div>
                            </Ratio>
                            {isElectron() && !videoUrl.startsWith("http://localhost") ? (
                                <Alert variant="secondary" className="mt-4">
                                    {t("alert.alertOnlineVideo")}
                                </Alert>
                            ) : (
                                ""
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className="fw-semibold">{t("tabConversationExam.studyCard")}</div>
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
                                                    {t(skill.label)}
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
                    <Modal.Title>{t("tabConversationExam.imageFullSizeModal")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Image src={modalImage} fluid />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default WatchAndStudyTab;
