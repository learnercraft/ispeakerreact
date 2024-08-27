import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";
import TopNavBar from "./general/TopNavBar";

function Homepage() {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
    };

    const cardsInfo = [
        {
            title: "Sounds",
            description: "Watch videos and practice pronouncing sounds in British and American English.",
            icon: "/images/ispeaker/sound_page.svg",
            path: "sounds",
        },
        {
            title: "Exercises (coming soon)",
            description: "Practice listening to sounds and sentences in various exercise types.",
            icon: "/images/ispeaker/exercises_page.svg",
            path: "exercises",
            disabled: true,
        },
        {
            title: "Conversations",
            description: "Improve your conversation skills. Adapt your skills in different situations.",
            icon: "/images/ispeaker/conversation_page.svg",
            path: "conversations",
        },
        {
            title: "Exams (coming soon)",
            description: "Prepare yourself for different types of speaking exams.",
            icon: "/images/ispeaker/exam-speaking_page.svg",
            path: "exams",
            disabled: true,
        },
        {
            title: "Help",
            description: "How to use the iSpeaker app.",
            icon: "/images/ispeaker/help_page.svg",
            path: "help",
        },
    ];

    return (
        <>
            <TopNavBar />
            <Row className="justify-content-center text-center">
                <Col md="auto">
                    <h1 className="fw-bold">Oxford iSpeaker</h1>
                </Col>
            </Row>
            <Row xs={1} md={3} className="g-4 mt-1 d-flex justify-content-center">
                {cardsInfo.map((card, idx) => (
                    <Col key={idx}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title>{card.title}</Card.Title>
                                <Card.Text>{card.description}</Card.Text>
                                <Card.Text className="mt-auto mb-3 d-flex justify-content-center">
                                    <img className="w-25" src={card.icon} />
                                </Card.Text>
                                <div className="mt-auto d-flex justify-content-center">
                                    <Button
                                        variant="primary"
                                        className="w-50"
                                        onClick={() => handleNavigate(card.path)}
                                        disabled={card.disabled}>
                                        Open
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );
}

export default Homepage;
