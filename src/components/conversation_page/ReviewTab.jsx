import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast";

const ReviewTab = ({ reviews, accent, conversationId }) => {
    const { t } = useTranslation();

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

        sonnerSuccessToast(t("toast.reviewUpdated"));
    };

    return (
        <div className="container-lg mx-auto">
            {reviews.map((review, index) => (
                <div key={index} className="mb-2">
                    <label htmlFor={`review-${index}`} className="cursor-pointer">
                        <span>{t(review.text)}</span>
                        <input
                            id={`review-${index}`}
                            type="checkbox"
                            className="checkbox checkbox-sm ms-2 align-text-bottom"
                            checked={!!reviewState[index + 1]}
                            onChange={() => handleCheckboxChange(index + 1)}
                        />
                    </label>
                </div>
            ))}
        </div>
    );
};

export default ReviewTab;
