import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast";

const ReviewTab = ({ reviews, examId, accent }) => {
    const { t } = useTranslation();

    const [checkedReviews, setCheckedReviews] = useState(() => {
        // Retrieve saved reviews from ispeaker -> examReview in localStorage
        const savedData = JSON.parse(localStorage.getItem("ispeaker")) || {};
        return savedData.examReview?.[accent] || {};
    });

    const handleCheckboxChange = (index) => {
        const key = `${examId}-${index}`;
        setCheckedReviews((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
        sonnerSuccessToast(t("toast.reviewUpdated"));
    };

    useEffect(() => {
        // Retrieve the existing ispeaker data
        const savedData = JSON.parse(localStorage.getItem("ispeaker")) || {};
        // Update the examReview section
        savedData.examReview = savedData.examReview || {};
        savedData.examReview[accent] = { ...checkedReviews };

        // Save the updated ispeaker data back to localStorage
        localStorage.setItem("ispeaker", JSON.stringify(savedData));
    }, [checkedReviews, examId, accent]);

    console.log("reviews prop type:", typeof reviews, reviews);

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

ReviewTab.propTypes = {
    reviews: PropTypes.array.isRequired,
    examId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    accent: PropTypes.string.isRequired,
};

export default ReviewTab;
