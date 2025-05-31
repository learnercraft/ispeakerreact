import he from "he";
import { useCallback, useEffect, useState } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { useTranslation } from "react-i18next";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { LiaTimesCircle } from "react-icons/lia";
import "../../styles/memory-card.css";
import ShuffleArray from "../../utils/ShuffleArray.js";
import useCountdownTimer from "../../utils/useCountdownTimer.js";

// Types for the quiz prop
export interface MemoryMatchCard {
    value: string;
    text: string;
}

export interface MemoryMatchQuizItem {
    data: MemoryMatchCard[];
}

export interface MemoryMatchProps {
    quiz: MemoryMatchQuizItem[];
    timer: number;
    onQuit: () => void;
    setTimeIsUp: (isUp: boolean) => void;
    onMatchFinished: () => void;
}

interface ShuffledCard extends MemoryMatchCard {
    id: number;
}

type CardFeedbackType = "correctPair" | "incorrectPair";

const MemoryMatch = ({ quiz, timer, onQuit, setTimeIsUp, onMatchFinished }: MemoryMatchProps) => {
    const [shuffledQuiz, setShuffledQuiz] = useState<ShuffledCard[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [matchedCards, setMatchedCards] = useState<number[]>([]);
    const [, setIsChecking] = useState(false);
    const [, setFeedback] = useState<null | string>(null);
    const [cardFeedback, setCardFeedback] = useState<Record<number, CardFeedbackType>>({});
    const [hasStarted, setHasStarted] = useState(false);

    // Use the countdown timer
    const { formatTime, clearTimer, startTimer } = useCountdownTimer(timer, () =>
        setTimeIsUp(true)
    );

    const { t } = useTranslation();

    // Function to randomly pick 8 pairs from the entire quiz data
    const prepareQuiz = useCallback((quizData: MemoryMatchQuizItem[]) => {
        let idCounter = 0;
        const groupedPairs: { id: number; pair: MemoryMatchCard[] }[] = quizData.reduce(
            (acc: { id: number; pair: MemoryMatchCard[] }[], quizItem) => {
                for (let i = 0; i < quizItem.data.length; i += 2) {
                    const value = quizItem.data[i].value;
                    const pair = quizItem.data.filter((item) => item.value === value).slice(0, 2);
                    if (pair.length === 2) {
                        acc.push({ id: idCounter++, pair });
                    }
                }
                return acc;
            },
            []
        );

        const shuffledPairs = ShuffleArray([...groupedPairs]);
        const selectedTexts = new Set<string>();
        const selectedPairs: { id: number; pair: MemoryMatchCard[] }[] = [];

        for (const { id, pair } of shuffledPairs) {
            const [first, second] = pair;
            if (!selectedTexts.has(first.text) && !selectedTexts.has(second.text)) {
                selectedTexts.add(first.text);
                selectedTexts.add(second.text);
                selectedPairs.push({ id, pair });
                if (selectedPairs.length === 8) break;
            }
        }

        const quizCards: ShuffledCard[] = ShuffleArray(
            selectedPairs.flatMap(({ id, pair }) => [
                { ...pair[0], id: id * 2 },
                { ...pair[1], id: id * 2 + 1 },
            ])
        );

        setShuffledQuiz(quizCards);
        setFlippedCards([]);
        setMatchedCards([]);
        setFeedback(null);
    }, []);

    useEffect(() => {
        if (quiz && quiz.length > 0) {
            prepareQuiz(quiz);
        }
    }, [quiz, prepareQuiz]);

    const handleCardClick = (card: ShuffledCard) => {
        if (!hasStarted) {
            setHasStarted(true);
            startTimer();
        }
        if (
            flippedCards.length < 2 &&
            !flippedCards.includes(card.id) &&
            !matchedCards.includes(card.id)
        ) {
            setFlippedCards((prev) => [...prev, card.id]);
        }
    };

    useEffect(() => {
        if (flippedCards.length === 2) {
            setIsChecking(true);
            setTimeout(() => {
                const [firstCardId, secondCardId] = flippedCards;
                const firstCard = shuffledQuiz.find((card) => card.id === firstCardId);
                const secondCard = shuffledQuiz.find((card) => card.id === secondCardId);
                if (!firstCard || !secondCard) return;
                if (Math.floor(firstCard.id / 2) === Math.floor(secondCard.id / 2)) {
                    setMatchedCards((prev) => [...prev, firstCardId, secondCardId]);
                    setCardFeedback((prev) => ({
                        ...prev,
                        [firstCardId]: "correctPair",
                        [secondCardId]: "correctPair",
                    }));
                } else {
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
                        return Object.fromEntries(
                            Object.entries(prev).filter(
                                ([key]) =>
                                    Number(key) !== firstCardId && Number(key) !== secondCardId
                            )
                        );
                    });
                }, 1000);
            }, 900);
        }
    }, [flippedCards, shuffledQuiz]);

    useEffect(() => {
        if (matchedCards.length === shuffledQuiz.length && shuffledQuiz.length > 0) {
            clearTimer();
            setTimeout(() => {
                if (onMatchFinished) onMatchFinished();
            }, 2000);
        }
    }, [matchedCards, shuffledQuiz, onMatchFinished, clearTimer]);

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
                        {shuffledQuiz.map((card) => (
                            <div className="flex flex-row flex-wrap justify-center" key={card.id}>
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
                                                ? "bg-success text-success-content z-50 rounded-lg"
                                                : cardFeedback[card.id] === "incorrectPair"
                                                  ? "bg-error text-error-content z-50 rounded-lg"
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
                                                    <div className="absolute top-2 right-2 z-50 text-white">
                                                        <BsCheckCircleFill className="h-6 w-6" />
                                                    </div>
                                                )}
                                                {cardFeedback[card.id] === "incorrectPair" && (
                                                    <div className="absolute top-2 right-2 z-50 text-white">
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
