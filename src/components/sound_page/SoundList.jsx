import he from "he";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import AccentLocalStorage from "../../utils/AccentLocalStorage";
import AccentDropdown from "../general/AccentDropdown";
import LoadingOverlay from "../general/LoadingOverlay";
import TopNavBar from "../general/TopNavBar";
import PracticeSound from "./PracticeSound";

const SoundList = () => {
    const [selectedSound, setSelectedSound] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAccent, setSelectedAccent] = AccentLocalStorage();

    const [soundsData, setSoundsData] = useState({
        consonants: [],
        vowels_n_diphthongs: [],
        consonants_b: [],
        consonants_a: [],
        vowels_b: [],
        vowels_a: [],
    });

    const handlePracticeClick = (sound, accent, index) => {
        setSelectedSound({ sound, accent, index });
    };

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
                setLoading(false);
                NProgress.done();
            })
            .catch((error) => {
                console.error("Error fetching sounds data:", error);
                alert("Error while loading the data for this section. Please check your Internet connection.");
                NProgress.done();
            });
    }, []);

    useEffect(() => {
        document.title = "Sounds | Oxford iSpeaker";
    }, []);

    return (
        <>
            <TopNavBar />
            <h1 className="fw-semibold">Sounds</h1>
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
                    <AccentDropdown onAccentChange={setSelectedAccent} />
                    <div>
                        {loading ? (
                            <LoadingOverlay />
                        ) : (
                            <>
                                <h3 className="mb-4">Consonants</h3>
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
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePracticeClick(sound, selectedAccent, index)
                                                            }
                                                            aria-label={`Open the sound ${he.decode(sound.phoneme)}`}>
                                                            Practice
                                                        </Button>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                </Row>
                                <hr />
                                <h3 className="my-4">Vowels and Diphthongs</h3>
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
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePracticeClick(sound, selectedAccent, index)
                                                            }>
                                                            Practice
                                                        </Button>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                </Row>
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default SoundList;
