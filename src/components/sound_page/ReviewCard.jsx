import he from "he";
import { Trans, useTranslation } from "react-i18next";
import {
    BsEmojiFrown,
    BsEmojiFrownFill,
    BsEmojiNeutral,
    BsEmojiNeutralFill,
    BsEmojiSmile,
    BsEmojiSmileFill,
} from "react-icons/bs";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast";
import { useReview } from "./hooks/useReview";

const ReviewCard = ({ sound, accent, index, soundsData }) => {
    const { t } = useTranslation();

    // Integrate the useReview hook
    const { review, handleReviewClick } = useReview(sound, accent, index, soundsData);

    // Local function for emoji styling
    const emojiStyle = (reviewType) => {
        const styles = {
            good: "text-success",
            neutral: "text-warning",
            bad: "text-error",
        };
        return review === reviewType ? styles[reviewType] : "";
    };

    return (
        <div className="card card-bordered flex h-auto flex-col justify-between pb-6 shadow-md dark:border-slate-600">
            <div className="card-body">
                <p className="mb-2 text-center">
                    <Trans
                        i18nKey="sound_page.reviewInstructions"
                        values={{ phoneme: he.decode(sound.phoneme) }}
                    >
                        <span lang="en">{he.decode(sound.phoneme)}</span>?
                    </Trans>
                </p>
                <div className="flex flex-row items-center justify-center space-x-4">
                    <a
                        onClick={() => {
                            handleReviewClick("good");
                            sonnerSuccessToast(t("toast.reviewUpdated"));
                        }}
                    >
                        {review === "good" ? (
                            <BsEmojiSmileFill
                                size={52}
                                role="button"
                                className={`${emojiStyle("good")}`}
                            />
                        ) : (
                            <BsEmojiSmile
                                size={52}
                                role="button"
                                className={`${emojiStyle("good")}`}
                            />
                        )}
                    </a>
                    <a
                        onClick={() => {
                            handleReviewClick("neutral");
                            sonnerSuccessToast(t("toast.reviewUpdated"));
                        }}
                    >
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
                    </a>
                    <a
                        onClick={() => {
                            handleReviewClick("bad");
                            sonnerSuccessToast(t("toast.reviewUpdated"));
                        }}
                    >
                        {review === "bad" ? (
                            <BsEmojiFrownFill
                                size={52}
                                role="button"
                                className={`${emojiStyle("bad")}`}
                            />
                        ) : (
                            <BsEmojiFrown
                                size={52}
                                role="button"
                                className={`${emojiStyle("bad")}`}
                            />
                        )}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
