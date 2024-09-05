import { useEffect } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import TopNavBar from "./general/TopNavBar";

function Homepage() {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
    };

    useEffect(() => {
        document.title = "Homepage | SpeakerReact";
    }, []);

    const cardsInfo = [
        {
            title: "Sounds",
            description: "Watch videos and practice pronouncing sounds.",
            icon: "/images/ispeaker/menu/sound_menu_icon.svg",
            path: "sounds",
        },
        {
            title: "Exercises",
            description: "Practice listening to sounds and sentences in various exercise types.",
            icon: "/images/ispeaker/menu/exercise_menu_icon.svg",
            path: "exercises",
        },
        {
            title: "Conversations",
            description: "Improve your conversation skills for different situations.",
            icon: "/images/ispeaker/menu/conversation_menu_icon.svg",
            path: "conversations",
        },
        {
            title: "Exams",
            description: "Prepare yourself for different types of speaking exams.",
            icon: "/images/ispeaker/menu/exam_menu_icon.svg",
            path: "exams",
        },
    ];

    return (
        <>
            <TopNavBar />
            <Row className="justify-content-center text-center">
                <Col md="auto">
                    <h1 className="fw-bold">SpeakerReact</h1>
                </Col>
            </Row>
            <Row xs={1} md={2} className="g-4 mt-1 d-flex justify-content-center">
                {cardsInfo.map((card, idx) => (
                    <Col key={idx}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title>{card.title}</Card.Title>
                                <Card.Text>{card.description}</Card.Text>
                                <Card.Text className="mt-auto mb-3 d-flex justify-content-center">
                                    <img alt={`${card.title} section icon`} className="w-25" src={card.icon} />
                                </Card.Text>
                                <div className="mt-auto d-flex justify-content-center">
                                    <Button
                                        variant="primary"
                                        className="w-50"
                                        onClick={() => handleNavigate(card.path)}
                                        disabled={card.disabled}
                                        aria-label={`Open the ${card.title} section`}>
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
