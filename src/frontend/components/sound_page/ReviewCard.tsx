import he from "he";
import { useEffect, useState } from "react";
import { Trans } from "react-i18next";
import {
    BsEmojiFrown,
    BsEmojiFrownFill,
    BsEmojiNeutral,
    BsEmojiNeutralFill,
    BsEmojiSmile,
    BsEmojiSmileFill,
} from "react-icons/bs";
import { checkRecordingExists } from "../../utils/databaseOperations.js";
import { sonnerSuccessToast, sonnerWarningToast } from "../../utils/sonnerCustomToast.js";
import type { ReviewCardProps, ReviewType } from "./types.js";

const ReviewCard = ({ sound, accent, t, onReviewUpdate }: ReviewCardProps) => {
    const [review, setReview] = useState<ReviewType>(null);
    const [hasRecording, setHasRecording] = useState(false);

    // Load review from localStorage on mount
    useEffect(() => {
        const storedString = localStorage.getItem("ispeaker");
        let storedData: Record<string, unknown> = {};
        if (storedString) {
            try {
                storedData = JSON.parse(storedString);
            } catch {
                storedData = {};
            }
        }
        const soundReview =
            (storedData.soundReview &&
                typeof storedData.soundReview === "object" &&
                (storedData.soundReview as Record<string, unknown>)[accent] &&
                typeof (storedData.soundReview as Record<string, unknown>)[accent] === "object" &&
                (
                    (storedData.soundReview as Record<string, unknown>)[accent] as Record<
                        string,
                        unknown
                    >
                )[`${sound.type}${sound.id}`]) ||
            null;
        setReview((soundReview as ReviewType) ?? null);
    }, [accent, sound]);

    // Check if recording exists
    useEffect(() => {
        const checkRecording = async () => {
            const recordingKey = `${sound.type === "consonants" ? "constant" : sound.type === "vowels" ? "vowel" : "dipthong"}-${accent}-${sound.id}-0`;
            const exists = await checkRecordingExists(recordingKey);
            setHasRecording(exists);
        };
        checkRecording();
    }, [accent, sound]);

    const handleReviewClick = (type: Exclude<ReviewType, null>) => {
        if (!hasRecording) {
            sonnerWarningToast(t("toast.noRecording"));
            return;
        }

        const storedString = localStorage.getItem("ispeaker");
        let storedData: Record<string, unknown> = {};
        if (storedString) {
            try {
                storedData = JSON.parse(storedString);
            } catch {
                storedData = {};
            }
        }
        if (!storedData.soundReview || typeof storedData.soundReview !== "object") {
            storedData.soundReview = {};
        }
        if (
            !(storedData.soundReview as Record<string, unknown>)[accent] ||
            typeof (storedData.soundReview as Record<string, unknown>)[accent] !== "object"
        ) {
            (storedData.soundReview as Record<string, unknown>)[accent] = {};
        }
        ((storedData.soundReview as Record<string, unknown>)[accent] as Record<string, unknown>)[
            `${sound.type}${sound.id}`
        ] = type;

        localStorage.setItem("ispeaker", JSON.stringify(storedData));
        setReview(type);

        sonnerSuccessToast(t("toast.reviewUpdated"));

        if (onReviewUpdate) {
            onReviewUpdate();
        }
    };

    const emojiStyle = (reviewType: Exclude<ReviewType, null>): string => {
        const styles: Record<Exclude<ReviewType, null>, string> = {
            good: "text-success",
            neutral: "text-warning",
            bad: "text-error",
        };
        return review === reviewType ? styles[reviewType] : "";
    };

    return (
        <div className="card card-lg card-border flex h-auto flex-col justify-between pb-6 shadow-md dark:border-slate-600">
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
                        onClick={() => handleReviewClick("good")}
                        className="cursor-pointer"
                        role="button"
                    >
                        {review === "good" ? (
                            <BsEmojiSmileFill size={52} className={emojiStyle("good")} />
                        ) : (
                            <BsEmojiSmile size={52} className={emojiStyle("good")} />
                        )}
                    </a>
                    <a
                        onClick={() => handleReviewClick("neutral")}
                        className="cursor-pointer"
                        role="button"
                    >
                        {review === "neutral" ? (
                            <BsEmojiNeutralFill size={52} className={emojiStyle("neutral")} />
                        ) : (
                            <BsEmojiNeutral size={52} className={emojiStyle("neutral")} />
                        )}
                    </a>
                    <a
                        onClick={() => handleReviewClick("bad")}
                        className="cursor-pointer"
                        role="button"
                    >
                        {review === "bad" ? (
                            <BsEmojiFrownFill size={52} className={emojiStyle("bad")} />
                        ) : (
                            <BsEmojiFrown size={52} className={emojiStyle("bad")} />
                        )}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
