import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod/v4";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast.js";
import { ReviewTabProps } from "./types.js";

// Create Zod schemas for validation
const CheckedReviewsSchema = z.record(z.string(), z.boolean());

const ExamReviewSchema = z.record(z.string(), CheckedReviewsSchema);

const SavedSettingsSchema = z
    .object({
        examReview: ExamReviewSchema.optional(),
    })
    .catchall(z.unknown()); // Allow other properties

// Infer TypeScript types
type CheckedReviews = z.infer<typeof CheckedReviewsSchema>;
type SavedSettings = z.infer<typeof SavedSettingsSchema>;

const ReviewTab = ({ reviews, examId, accent }: ReviewTabProps) => {
    const { t } = useTranslation();

    // Safe localStorage operations with Zod validation
    const getSavedSettings = (): SavedSettings => {
        try {
            const raw = localStorage.getItem("ispeaker");
            if (!raw) return {};

            const parsed = JSON.parse(raw);
            const result = SavedSettingsSchema.safeParse(parsed);

            if (result.success) {
                return result.data;
            } else {
                console.warn("❌ Failed to validate saved settings:", result.error);
                return {};
            }
        } catch (error) {
            console.warn("❌ Failed to parse saved settings:", error);
            return {};
        }
    };

    const setSavedSettings = (settings: SavedSettings): void => {
        try {
            localStorage.setItem("ispeaker", JSON.stringify(settings));
        } catch (error) {
            console.error("❌ Failed to save settings:", error);
        }
    };

    const [checkedReviews, setCheckedReviews] = useState<CheckedReviews>(() => {
        const savedSettings = getSavedSettings();
        const examReviewData = savedSettings.examReview?.[accent];

        // Validate the retrieved data with Zod
        const result = CheckedReviewsSchema.safeParse(examReviewData || {});
        return result.success ? result.data : {};
    });

    const handleCheckboxChange = (index: number) => {
        const key = `${examId}-${index}`;

        setCheckedReviews((prev) => {
            // Validate the current state before updating
            const currentResult = CheckedReviewsSchema.safeParse(prev);
            const currentState = currentResult.success ? currentResult.data : {};

            const newState = {
                ...currentState,
                [key]: !currentState[key],
            };

            // Validate the new state
            const newResult = CheckedReviewsSchema.safeParse(newState);
            if (newResult.success) {
                return newResult.data;
            } else {
                console.warn("❌ Failed to validate new checkbox state:", newResult.error);
                return currentState;
            }
        });

        sonnerSuccessToast(t("toast.reviewUpdated"));
    };

    useEffect(() => {
        // Get current settings and validate them
        const savedSettings = getSavedSettings();

        // Ensure examReview exists and is valid
        if (!savedSettings.examReview) {
            savedSettings.examReview = {};
        }

        // Validate and update the examReview for the current accent
        const examReviewResult = CheckedReviewsSchema.safeParse(checkedReviews);
        if (examReviewResult.success) {
            savedSettings.examReview[accent] = examReviewResult.data;
            setSavedSettings(savedSettings);
        } else {
            console.warn(
                "❌ Failed to validate checked reviews before saving:",
                examReviewResult.error
            );
        }
    }, [checkedReviews, examId, accent]);

    return (
        <div className="container-lg mx-auto">
            {reviews.map((review, index) => {
                const key = `${examId}-${index}`;
                const isChecked = !!checkedReviews[key];

                return (
                    <div key={index} className="mb-2">
                        <label htmlFor={`review-${index}`} className="cursor-pointer">
                            <span>{t(review.text)}</span>
                            <input
                                id={`review-${index}`}
                                type="checkbox"
                                className="checkbox checkbox-sm ms-2 align-text-bottom"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(index)}
                            />
                        </label>
                    </div>
                );
            })}
        </div>
    );
};

export default ReviewTab;
