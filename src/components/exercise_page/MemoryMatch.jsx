import he from "he";
import { useCallback, useEffect, useState } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { useTranslation } from "react-i18next";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { LiaTimesCircle } from "react-icons/lia";
import "../../styles/memory-card.css";
import { ShuffleArray } from "../../utils/ShuffleArray";
import useCountdownTimer from "../../utils/useCountdownTimer";

const MemoryMatch = ({ quiz, timer, onQuit, setTimeIsUp, onMatchFinished }) => {
    const [shuffledQuiz, setShuffledQuiz] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [, setIsChecking] = useState(false);
    const [, setFeedback] = useState(null);
    const [cardFeedback, setCardFeedback] = useState({});
    const [hasStarted, setHasStarted] = useState(false);

    // Use the countdown timer
    const { formatTime, clearTimer, startTimer } = useCountdownTimer(timer, () =>
        setTimeIsUp(true)
    );

    const { t } = useTranslation();

    // Function to randomly pick 8 pairs from the entire quiz data
    const prepareQuiz = useCallback((quizData) => {
        // Step 1: Group pairs by their `value` within each object and assign a unique `id`
        let idCounter = 0; // To assign a unique identifier to each pair
        const groupedPairs = quizData.reduce((acc, quizItem) => {
            // Iterate over each item in the `data` array of each `quizItem`
            for (let i = 0; i < quizItem.data.length; i += 2) {
                const value = quizItem.data[i].value;
                const pair = quizItem.data.filter((item) => item.value === value).slice(0, 2); // Only take the first two
                if (pair.length === 2) {
                    acc.push({ id: idCounter++, pair }); // Add each pair with a unique `id`
                }
            }
            return acc;
        }, []);

        // Step 2: Shuffle the combined grouped pairs to randomize them
        const shuffledPairs = ShuffleArray([...groupedPairs]);

        // Step 3: Keep track of selected texts to avoid duplicates (but allow the same `value` across different pairs)
        const selectedTexts = new Set();
        const selectedPairs = [];

        // Step 4: Loop through the shuffled pairs and select 8 pairs, while filtering out pairs with duplicate texts
        for (const { id, pair } of shuffledPairs) {
            const [first, second] = pair;

            // Check if either text has already been used
            if (!selectedTexts.has(first.text) && !selectedTexts.has(second.text)) {
                // Add both texts to the selectedTexts set
                selectedTexts.add(first.text);
                selectedTexts.add(second.text);

                // Add the pair (with its id) to the selectedPairs array
                selectedPairs.push({ id, pair });

                // Stop once we have 8 pairs
                if (selectedPairs.length === 8) break;
            }
        }

        // Step 5: Duplicate and shuffle the selected pairs to form the memory match cards
        const quizCards = ShuffleArray(
            selectedPairs.flatMap(({ id, pair }, index) => [
                { ...pair[0], id: id * 2 }, // Create a unique id for each card based on the pair's unique `id`
                { ...pair[1], id: id * 2 + 1 }, // Duplicate the matching pair with a different id
            ])
        );

        // Step 6: Set the state with the new set of shuffled cards
        setShuffledQuiz(quizCards);
        setFlippedCards([]);
        setMatchedCards([]);
        setFeedback(null);
    }, []);

    // Prepare quiz data when the component loads
    useEffect(() => {
        if (quiz && quiz.length > 0) {
            prepareQuiz(quiz);
        }
    }, [quiz, prepareQuiz]);

    // Handle card click logic
    const handleCardClick = (card) => {
        if (!hasStarted) {
            setHasStarted(true);
            startTimer(); // Start the timer immediately on the first card click
        }

        if (
            flippedCards.length < 2 &&
            !flippedCards.includes(card.id) &&
            !matchedCards.includes(card.id)
        ) {
            setFlippedCards((prev) => [...prev, card.id]);
        }
    };

    // Logic to check matching cards
    useEffect(() => {
        if (flippedCards.length === 2) {
            setIsChecking(true);
            setTimeout(() => {
                const [firstCardId, secondCardId] = flippedCards;
                const firstCard = shuffledQuiz.find((card) => card.id === firstCardId);
                const secondCard = shuffledQuiz.find((card) => card.id === secondCardId);

                // Compare using the pair's `id` instead of the `value`
                if (Math.floor(firstCard.id / 2) === Math.floor(secondCard.id / 2)) {
                    // Cards belong to the same pair, so it's a match
                    setMatchedCards((prev) => [...prev, firstCardId, secondCardId]);
                    setCardFeedback((prev) => ({
                        ...prev,
                        [firstCardId]: "correctPair",
                        [secondCardId]: "correctPair",
                    }));
                } else {
                    // Cards do not belong to the same pair
                    setCardFeedback((prev) => ({
                        ...prev,
                        [firstCardId]: "incorrectPair",
                        [secondCardId]: "incorrectPair",
                    }));
                }

                setTimeout(() => {
                    setFlippedCards([]);
                    setIsChecking(false);
                    setCardFeedback((prev) => {
                        // Clear feedback only for incorrect pairs
                        const updatedFeedback = { ...prev };
                        delete updatedFeedback[firstCardId];
                        delete updatedFeedback[secondCardId];
                        return updatedFeedback;
                    });
                }, 1000);
            }, 900);
        }
    }, [flippedCards, shuffledQuiz]);

    // Check if all matches are completed
    useEffect(() => {
        if (matchedCards.length === shuffledQuiz.length && shuffledQuiz.length > 0) {
            clearTimer();
            setTimeout(() => {
                if (onMatchFinished) onMatchFinished();
            }, 2000);
        }
    }, [matchedCards, shuffledQuiz, onMatchFinished, clearTimer]);

    // Handle quit action
    const handleQuit = () => {
        clearTimer();
        onQuit();
    };

    return (
        <>
            <div className="card-body">
                <div className="text-lg font-semibold">
                    <div className="flex items-center">
                        <div className="flex-1 md:flex-none">
                            {t("exercise_page.memoryMatchHeading")}
                        </div>
                        <div className="ms-auto flex justify-end">
                            {t("exercise_page.timer")} {formatTime()}
                        </div>
                    </div>
                </div>
                <div className="divider divider-secondary m-0"></div>
                <Flipper flipKey={flippedCards.concat(matchedCards)}>
                    <div className="grid grid-cols-4 gap-2">
                        {shuffledQuiz.map((card, index) => (
                            <div className="flex flex-row flex-wrap justify-center" key={index}>
                                <Flipped flipId={card.id}>
                                    <div
                                        onClick={() => handleCardClick(card)}
                                        className={`memory-card ${
                                            flippedCards.includes(card.id) ||
                                            matchedCards.includes(card.id)
                                                ? "flipped"
                                                : ""
                                        } ${
                                            cardFeedback[card.id] === "correctPair"
                                                ? "z-50 rounded-lg bg-success text-success-content"
                                                : cardFeedback[card.id] === "incorrectPair"
                                                  ? "z-50 rounded-lg bg-error text-error-content"
                                                  : ""
                                        }`}
                                    >
                                        <div className="card-inner">
                                            <div className="card-front"></div>
                                            <div
                                                className="card-back"
                                                style={{ transform: "rotateY(180deg)" }}
                                            >
                                                <span lang="en">{he.decode(card.text)}</span>
                                                {cardFeedback[card.id] === "correctPair" && (
                                                    <div className="absolute right-2 top-2 z-50 text-white">
                                                        <BsCheckCircleFill className="h-6 w-6" />
                                                    </div>
                                                )}
                                                {cardFeedback[card.id] === "incorrectPair" && (
                                                    <div className="absolute right-2 top-2 z-50 text-white">
                                                        <BsXCircleFill className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Flipped>
                            </div>
                        ))}
                    </div>
                </Flipper>

                <div className="card-actions justify-center">
                    <div className="my-3 flex flex-wrap justify-center gap-2">
                        <button type="button" className="btn btn-error" onClick={handleQuit}>
                            <LiaTimesCircle className="h-6 w-6" />
                            {t("exercise_page.buttons.quitBtn")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MemoryMatch;
