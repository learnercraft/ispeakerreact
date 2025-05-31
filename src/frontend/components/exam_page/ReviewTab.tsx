import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast.js";

interface Review {
    text: string;
}

interface ReviewTabProps {
    reviews: Review[];
    accent: string;
    examId: string | number;
}

const ReviewTab = ({ reviews, examId, accent }: ReviewTabProps) => {
    const { t } = useTranslation();

    const [checkedReviews, setCheckedReviews] = useState<Record<string, boolean>>(() => {
        // Retrieve saved reviews from ispeaker -> examReview in localStorage
        const savedData = localStorage.getItem("ispeaker");
        const parsedData = savedData ? JSON.parse(savedData) : {};
        return parsedData.examReview?.[accent] || {};
    });

    const handleCheckboxChange = (index: number) => {
        const key = `${examId}-${index}`;
        setCheckedReviews((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
        sonnerSuccessToast(t("toast.reviewUpdated"));
    };

    useEffect(() => {
        // Retrieve the existing ispeaker data
        const savedData = localStorage.getItem("ispeaker");
        const parsedData = savedData ? JSON.parse(savedData) : {};
        // Update the examReview section
        parsedData.examReview = parsedData.examReview || {};
        parsedData.examReview[accent] = { ...checkedReviews };

        // Save the updated ispeaker data back to localStorage
        localStorage.setItem("ispeaker", JSON.stringify(parsedData));
    }, [checkedReviews, examId, accent]);

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
                            checked={!!checkedReviews[`${examId}-${index}`]}
                            onChange={() => handleCheckboxChange(index)}
                        />
                    </label>
                </div>
            ))}
        </div>
    );
};

export default ReviewTab;
