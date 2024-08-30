import { useState } from "react";
import { Accordion, Card, Col, Form, Ratio, Row } from "react-bootstrap";

const WatchAndStudyTab = ({ videoUrl, dialog, skillCheckmark }) => {
    const [highlightState, setHighlightState] = useState({});

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
                                <iframe src={videoUrl} title="Study Video" allowFullScreen loading="lazy"></iframe>
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
