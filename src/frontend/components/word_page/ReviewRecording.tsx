import { useEffect, useState } from "react";
import {
    BsEmojiFrown,
    BsEmojiFrownFill,
    BsEmojiNeutral,
    BsEmojiNeutralFill,
    BsEmojiSmile,
    BsEmojiSmileFill,
} from "react-icons/bs";
import { sonnerSuccessToast, sonnerWarningToast } from "../../utils/sonnerCustomToast.js";
import type { ReviewRecordingProps, ReviewType } from "./types";

const ReviewRecording = ({
    wordName,
    accent,
    isRecordingExists,
    t,
    onReviewUpdate,
}: ReviewRecordingProps) => {
    const [review, setReview] = useState<ReviewType>(null);

    // Load review from localStorage on mount
    useEffect(() => {
        const storedRaw = localStorage.getItem("ispeaker");
        const storedData = storedRaw ? JSON.parse(storedRaw) : {};
        const wordReview = storedData.wordReview?.[accent]?.[wordName] ?? null;
        setReview(wordReview as ReviewType);
    }, [accent, wordName]);

    const handleReviewClick = (type: Exclude<ReviewType, null>) => {
        if (!isRecordingExists) {
            sonnerWarningToast(String(t("toast.noRecording")));
            return;
        }

        const storedRaw = localStorage.getItem("ispeaker");
        const storedData = storedRaw ? JSON.parse(storedRaw) : {};
        storedData.wordReview = storedData.wordReview || {};
        storedData.wordReview[accent] = storedData.wordReview[accent] || {};
        storedData.wordReview[accent][wordName] = type;

        localStorage.setItem("ispeaker", JSON.stringify(storedData));
        setReview(type);

        sonnerSuccessToast(String(t("toast.reviewUpdated")));

        if (onReviewUpdate) onReviewUpdate();
    };

    const emojiStyle = (reviewType: Exclude<ReviewType, null>) => {
        const styles: Record<Exclude<ReviewType, null>, string> = {
            good: "text-success",
            neutral: "text-warning",
            bad: "text-error",
        };
        return review === reviewType ? styles[reviewType] : "";
    };

    return (
        <div className="my-4">
            <p className="mb-2 text-center">{String(t("wordPage.ratePronunciation"))}</p>
            <div className="flex flex-row items-center justify-center space-x-4">
                <button type="button" onClick={() => handleReviewClick("good")}>
                    {review === "good" ? (
                        <BsEmojiSmileFill
                            size={52}
                            role="button"
                            className={`cursor-pointer ${emojiStyle("good")}`}
                        />
                    ) : (
                        <BsEmojiSmile
                            size={52}
                            role="button"
                            className={`cursor-pointer ${emojiStyle("good")}`}
                        />
                    )}
                </button>
                <button type="button" onClick={() => handleReviewClick("neutral")}>
                    {review === "neutral" ? (
                        <BsEmojiNeutralFill
                            size={52}
                            role="button"
                            className={`cursor-pointer ${emojiStyle("neutral")}`}
                        />
                    ) : (
                        <BsEmojiNeutral
                            size={52}
                            role="button"
                            className={`cursor-pointer ${emojiStyle("neutral")}`}
                        />
                    )}
                </button>
                <button type="button" onClick={() => handleReviewClick("bad")}>
                    {review === "bad" ? (
                        <BsEmojiFrownFill
                            size={52}
                            role="button"
                            className={`cursor-pointer ${emojiStyle("bad")}`}
                        />
                    ) : (
                        <BsEmojiFrown
                            size={52}
                            role="button"
                            className={`cursor-pointer ${emojiStyle("bad")}`}
                        />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ReviewRecording;
