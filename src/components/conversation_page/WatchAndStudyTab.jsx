import { useState } from "react";
import { Accordion, Alert, Card, Col, Form, Ratio, Row } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { isElectron } from "../../utils/isElectron";

const WatchAndStudyTab = ({ videoUrl, dialog, skillCheckmark }) => {
    const [highlightState, setHighlightState] = useState({});
    const [iframeLoading, setiFrameLoading] = useState(true);

    const handleIframeLoad = () => setiFrameLoading(false);

    // Handle checkbox change
    const handleCheckboxChange = (index) => {
        setHighlightState((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    return (
        <div>
            <Row className="mb-4 g-4">
                <Col md={6}>
                    <Card className="shadow-sm">
                        <Card.Header className="fw-semibold">Watch the video</Card.Header>
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
                                                title="Conversation video"
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
                                    Want to watch the video offline? Head to the “Settings” page to download it.
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
                                <div className="fw-semibold">Study</div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="dialog-section mb-4">
                                    {dialog.map((line, index) => (
                                        <p key={index}>
                                            <strong>{line.speaker}:</strong>{" "}
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: line.speech.replace(
                                                        /highlight-dialog-(\d+)/g,
                                                        (match, p1) =>
                                                            highlightState[p1]
                                                                ? `text-bg-${p1 === "1" ? "primary" : "secondary"}`
                                                                : ""
                                                    ),
                                                }}></span>
                                        </p>
                                    ))}
                                </div>
                                <div className="bg-body-tertiary p-3">
                                    {skillCheckmark.map((skill, index) => (
                                        <Form.Check key={index} id={`skilllabel-${index}`} label={skill.label}>
                                            <Form.Check.Input
                                                type="checkbox"
                                                checked={!!highlightState[index + 1]}
                                                onChange={() => handleCheckboxChange(index + 1)}
                                            />
                                            <Form.Check.Label>
                                                <span
                                                    className={`${
                                                        highlightState[index + 1]
                                                            ? index === 0
                                                                ? "text-bg-primary"
                                                                : "text-bg-secondary"
                                                            : ""
                                                    }`}>
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
        </div>
    );
};

export default WatchAndStudyTab;
