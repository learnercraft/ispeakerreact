import { useState, useEffect } from "react";
import { Form } from "react-bootstrap";

const ReviewTab = ({ reviews, examId, accent }) => {
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

    return (
        <>
            {reviews.map((review, index) => (
                <Form.Check
                    key={index}
                    type="checkbox"
                    id={`review-${index}`}
                    label={review.text}
                    checked={!!checkedReviews[`${examId}-${index}`]}
                    onChange={() => handleCheckboxChange(index)}
                />
            ))}
        </>
    );
};

export default ReviewTab;
