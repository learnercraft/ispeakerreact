import { useState, useEffect } from "react";
import { Form } from "react-bootstrap";

const ReviewTab = ({ reviews, accent, conversationId }) => {
    const [reviewState, setReviewState] = useState({});

    const reviewKey = `${accent}-${conversationId}-review`;

    // Load saved review states from localStorage
    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem("ispeaker")) || {};
        const savedReviews = storedData.conversationReview?.[accent] || {};
        const initialReviewState = reviews.reduce((acc, review, index) => {
            const key = `${reviewKey}${index + 1}`;
            acc[index + 1] = savedReviews[key] || false;
            return acc;
        }, {});
        setReviewState(initialReviewState);
    }, [accent, conversationId, reviews, reviewKey]);

    // Handle checkbox change
    const handleCheckboxChange = (index) => {
        const newReviewState = { ...reviewState, [index]: !reviewState[index] };
        setReviewState(newReviewState);

        // Load existing data from localStorage
        const storedData = JSON.parse(localStorage.getItem("ispeaker")) || {};
        const currentAccentData = storedData.conversationReview?.[accent] || {};

        // Update the specific review state while preserving the rest of the data
        const updatedReviews = {
            ...currentAccentData,
            [`${reviewKey}${index}`]: newReviewState[index],
        };

        // Save updated data back to localStorage
        localStorage.setItem(
            "ispeaker",
            JSON.stringify({
                ...storedData,
                conversationReview: {
                    ...storedData.conversationReview,
                    [accent]: updatedReviews,
                },
            })
        );
    };

    return (
        <Form>
            {reviews.map((review, index) => (
                <Form.Check
                    key={index}
                    id={`review-${index}`}
                    type="checkbox"
                    label={review.text}
                    checked={!!reviewState[index + 1]}
                    onChange={() => handleCheckboxChange(index + 1)}
                    className="mb-2"
                />
            ))}
        </Form>
    );
};

export default ReviewTab;
