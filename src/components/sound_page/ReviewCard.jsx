import he from "he";
import { Card, Col, Row } from "react-bootstrap";
import { EmojiSmile, EmojiNeutral, EmojiFrown } from "react-bootstrap-icons";

const ReviewCard = ({ sound, handleReviewClick, emojiStyle }) => {
    return (
        <Card className="shadow-sm">
            <Card.Header className="fw-semibold">Review</Card.Header>
            <Card.Body>
                <Card.Text>How do you pronounce the sound {he.decode(sound.phoneme)}?</Card.Text>
                <Row className="d-flex justify-content-center">
                    <Col xs={"auto"} className="me-2" onClick={() => handleReviewClick("good")}>
                        <EmojiSmile size={52} role="button" className={`bi bi-emoji-smile ${emojiStyle("good")}`} />
                    </Col>
                    <Col xs={"auto"} className="me-2" onClick={() => handleReviewClick("neutral")}>
                        <EmojiNeutral
                            size={52}
                            role="button"
                            className={`bi bi-emoji-neutral ${emojiStyle("neutral")}`}
                        />
                    </Col>
                    <Col xs={"auto"} className="me-2" onClick={() => handleReviewClick("bad")}>
                        <EmojiFrown size={52} role="button" className={`bi bi-emoji-frown ${emojiStyle("bad")}`} />
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default ReviewCard;
