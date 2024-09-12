import he from "he";
import { Suspense, lazy, useEffect, useState } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import AccentLocalStorage from "../../utils/AccentLocalStorage";
import { useIsElectron } from "../../utils/isElectron";
import AccentDropdown from "../general/AccentDropdown";
import LoadingOverlay from "../general/LoadingOverlay";
import TopNavBar from "../general/TopNavBar";
import { getFileFromIndexedDB, saveFileToIndexedDB } from "../setting_page/offlineStorageDb";

const PracticeSound = lazy(() => import("./PracticeSound"));

const SoundList = () => {
    const [selectedSound, setSelectedSound] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAccent, setSelectedAccent] = AccentLocalStorage();
    const isElectron = useIsElectron();

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
        const fetchData = async () => {
            try {
                setLoading(true);

                // If it's not an Electron environment, check IndexedDB first
                if (!isElectron) {
                    const cachedDataBlob = await getFileFromIndexedDB("sounds_data.json", "json");

                    if (cachedDataBlob) {
                        // Convert Blob to text, then parse the JSON
                        const cachedDataText = await cachedDataBlob.text();
                        const cachedData = JSON.parse(cachedDataText);

                        setSoundsData(cachedData);
                        setLoading(false);

                        return;
                    }
                }

                // If not in IndexedDB or running in Electron, fetch from the network
                const response = await fetch(`${import.meta.env.BASE_URL}json/sounds_data.json`);
                const data = await response.json();

                setSoundsData(data);
                setLoading(false);

                // Save the fetched data to IndexedDB (excluding Electron)
                if (!isElectron) {
                    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
                    await saveFileToIndexedDB("sounds_data.json", blob, "json");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Error while loading the data for this section. Please check your Internet connection.");
            }
        };
        fetchData();
    }, [isElectron]);

    useEffect(() => {
        document.title = `Sounds | iSpeakerReact ${__APP_VERSION__}`;
    }, []);

    return (
        <>
            <TopNavBar />
            <h1 className="fw-semibold">Sounds</h1>
            {selectedSound ? (
                <Suspense fallback={isElectron ? null : <LoadingOverlay />}>
                    <PracticeSound
                        sound={selectedSound.sound}
                        accent={selectedSound.accent}
                        soundsData={soundsData}
                        index={selectedSound.index}
                        onBack={() => handleGoBack()}
                    />
                </Suspense>
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
