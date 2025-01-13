import PropTypes from "prop-types";
import {
    BsEmojiFrown,
    BsEmojiFrownFill,
    BsEmojiNeutral,
    BsEmojiNeutralFill,
    BsEmojiSmile,
    BsEmojiSmileFill,
} from "react-icons/bs";
import { sonnerSuccessToast, sonnerWarningToast } from "../../utils/sonnerCustomToast";
import { useState, useEffect } from "react";

const ReviewRecording = ({ wordName, accent, isRecordingExists, t, onReviewUpdate }) => {
    const [review, setReview] = useState(null);

    // Load review from localStorage on mount
    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem("ispeaker")) || {};
        const wordReview = storedData.wordReview?.[accent]?.[wordName] || null;
        setReview(wordReview);
    }, [accent, wordName]);

    const handleReviewClick = (type) => {
        if (!isRecordingExists) {
            sonnerWarningToast(t("toast.noRecording"));
            return;
        }

        const storedData = JSON.parse(localStorage.getItem("ispeaker")) || {};
        storedData.wordReview = storedData.wordReview || {};
        storedData.wordReview[accent] = storedData.wordReview[accent] || {};
        storedData.wordReview[accent][wordName] = type;

        localStorage.setItem("ispeaker", JSON.stringify(storedData));
        setReview(type);

        sonnerSuccessToast(t("toast.reviewUpdated"));

        onReviewUpdate();
    };

    const emojiStyle = (reviewType) => {
        const styles = {
            good: "text-success",
            neutral: "text-warning",
            bad: "text-error",
        };
        return review === reviewType ? styles[reviewType] : "";
    };

    return (
        <div className="my-4">
            <p className="mb-2 text-center">{t("wordPage.ratePronunciation")}</p>
            <div className="flex flex-row items-center justify-center space-x-4">
                <button type="button" onClick={() => handleReviewClick("good")}>
                    {review === "good" ? (
                        <BsEmojiSmileFill
                            size={52}
                            role="button"
                            className={`${emojiStyle("good")}`}
                        />
                    ) : (
                        <BsEmojiSmile size={52} role="button" className={`${emojiStyle("good")}`} />
                    )}
                </button>
                <button type="button" onClick={() => handleReviewClick("neutral")}>
                    {review === "neutral" ? (
                        <BsEmojiNeutralFill
                            size={52}
                            role="button"
                            className={`${emojiStyle("neutral")}`}
                        />
                    ) : (
                        <BsEmojiNeutral
                            size={52}
                            role="button"
                            className={`${emojiStyle("neutral")}`}
                        />
                    )}
                </button>
                <button type="button" onClick={() => handleReviewClick("bad")}>
                    {review === "bad" ? (
                        <BsEmojiFrownFill
                            size={52}
                            role="button"
                            className={`${emojiStyle("bad")}`}
                        />
                    ) : (
                        <BsEmojiFrown size={52} role="button" className={`${emojiStyle("bad")}`} />
                    )}
                </button>
            </div>
        </div>
    );
};

ReviewRecording.propTypes = {
    wordName: PropTypes.string.isRequired,
    accent: PropTypes.string.isRequired,
    isRecordingExists: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
    onReviewUpdate: PropTypes.func,
};

export default ReviewRecording;
