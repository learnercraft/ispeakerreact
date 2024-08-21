import { useState, useEffect } from "react";
import { Row, Col, Button, Dropdown, Card, Badge } from "react-bootstrap";
import TopNavBar from "./TopNavBar";
import PracticeSound from "./PracticeSound";
import he from "he";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const SoundList = () => {
    const [selectedSound, setSelectedSound] = useState(null);

    const [soundsData, setSoundsData] = useState({
        consonants: [],
        vowels_n_diphthongs: [],
        consonants_b: [],
        consonants_a: [],
        vowels_b: [],
        vowels_a: [],
    });
    const [selectedAccent, setSelectedAccent] = useState(() => {
        const savedSettings = JSON.parse(localStorage.getItem("ispeaker"));
        return savedSettings?.selectedAccent || "american";
    });

    const selectedAccentOptions = [
        { name: "American English", value: "american" },
        { name: "British English", value: "british" },
    ];

    const handlePracticeClick = (sound, accent, index) => {
        setSelectedSound({ sound, accent, index });
    };

    useEffect(() => {
        const currentSettings = JSON.parse(localStorage.getItem("ispeaker")) || {};
        const updatedSettings = { ...currentSettings, selectedAccent: selectedAccent };
        localStorage.setItem("ispeaker", JSON.stringify(updatedSettings));
    }, [selectedAccent]);

    // Trigger re-render when the review option is updated
    const [reviews, setReviews] = useState({});

    const [reviewsUpdateTrigger, setReviewsUpdateTrigger] = useState(0);

    useEffect(() => {
        const ispeakerData = JSON.parse(localStorage.getItem("ispeaker") || "{}");
        const accentReviews = ispeakerData.soundReview ? ispeakerData.soundReview[selectedAccent] || {} : {};
        setReviews(accentReviews);
    }, [selectedAccent, reviewsUpdateTrigger]);

    // Method to trigger re-render
    const triggerReviewsUpdate = () => {
        setReviewsUpdateTrigger(Date.now());
    };

    const handleGoBack = () => {
        setSelectedSound(null);
        triggerReviewsUpdate();
    };

    const getReviewKey = (sound, index) => {
        const type = soundsData.consonants.some((s) => s.phoneme === sound.phoneme) ? "consonant" : "vowel";
        const formattedIndex = index + 1;
        return `${type}${formattedIndex}`;
    };

    const getBadgeColor = (sound, index) => {
        // Retrieve the entire data structure from localStorage
        const ispeakerData = JSON.parse(localStorage.getItem("ispeaker") || "{}");
        const accentReviews = ispeakerData.soundReview ? ispeakerData.soundReview[selectedAccent] || {} : {};

        // Generate the correct review key for this sound based on its index
        const reviewKey = getReviewKey(sound, index);
        const review = accentReviews[reviewKey]; // Access the specific review by its key

        switch (review) {
            case "good":
                return "success";
            case "neutral":
                return "warning";
            case "bad":
                return "danger";
            default:
                return "secondary"; // No review found or the key does not exist
        }
    };

    useEffect(() => {
        NProgress.start();
        fetch("json/sounds_data.json")
            .then((response) => response.json())
            .then((data) => {
                setSoundsData(data);
                NProgress.done();
            })
            .catch((error) => {
                console.error("Error fetching sounds data:", error);
                NProgress.done();
            });
    }, []);

    return (
        <>
            <TopNavBar />
            {selectedSound ? (
                <PracticeSound
                    sound={selectedSound.sound}
                    accent={selectedSound.accent}
                    soundsData={soundsData}
                    index={selectedSound.index}
                    onBack={() => handleGoBack()}
                />
            ) : (
                <>
                    <Dropdown className="mb-3">
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            <span className="fw-semibold">Accent:</span> {selectedAccentOptions.find((item) => item.value === selectedAccent).name}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {selectedAccentOptions.map((item) => (
                                <Dropdown.Item key={item.value} onClick={() => setSelectedAccent(item.value)} active={selectedAccent === item.value}>
                                    {item.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <div>
                        <h3>Consonants</h3>
                        <Row className="d-flex justify-content-center">
                            {soundsData.consonants
                                .filter(
                                    (sound) =>
                                        (selectedAccent === "british" && sound.b_s === "yes") ||
                                        (selectedAccent === "american" && sound.a_s === "yes")
                                )
                                .map((sound, index) => (
                                    <Col xs={"auto"} md={2} key={index} className="mb-4">
                                        <Card className="h-100 shadow-sm">
                                            <Card.Body className="text-center">
                                                <Badge
                                                    bg={getBadgeColor(sound, index)}
                                                    className="position-absolute top-0 end-0 rounded-start-0 rounded-bottom-0">
                                                    {reviews[`${getReviewKey(sound, index)}`] || ""}
                                                </Badge>
                                                <Card.Title>{he.decode(sound.phoneme)}</Card.Title>
                                                <Card.Text>{sound.example_word}</Card.Text>
                                                <Button size="sm" onClick={() => handlePracticeClick(sound, selectedAccent, index)}>
                                                    Practice
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                        </Row>
                        <h3>Vowels and Diphthongs</h3>
                        <Row className="d-flex justify-content-center">
                            {soundsData.vowels_n_diphthongs
                                .filter(
                                    (sound) =>
                                        (selectedAccent === "british" && sound.b_s === "yes") ||
                                        (selectedAccent === "american" && sound.a_s === "yes")
                                )
                                .map((sound, index) => (
                                    <Col xs={"auto"} md={2} key={index} className="mb-4">
                                        <Card className="h-100 shadow-sm">
                                            <Card.Body className="text-center">
                                                <Badge
                                                    bg={getBadgeColor(sound, index)}
                                                    className="position-absolute top-0 end-0 rounded-start-0 rounded-bottom-0">
                                                    {reviews[`${getReviewKey(sound, index)}`] || ""}
                                                </Badge>
                                                <Card.Title>{he.decode(sound.phoneme)}</Card.Title>
                                                <Card.Text>{sound.example_word}</Card.Text>
                                                <Button size="sm" onClick={() => handlePracticeClick(sound, selectedAccent, index)}>
                                                    Practice
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                        </Row>
                    </div>
                </>
            )}
        </>
    );
};

export default SoundList;
