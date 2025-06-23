import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod/v4";
import { sonnerSuccessToast } from "../../utils/sonnerCustomToast.js";
import type { Review, ReviewTabProps } from "./types.js";

// Create Zod schemas for validation
const ReviewStateSchema = z.record(z.string(), z.boolean());

const ConversationReviewSchema = z.record(z.string(), ReviewStateSchema);

const SavedSettingsSchema = z
    .object({
        conversationReview: ConversationReviewSchema.optional(),
    })
    .catchall(z.unknown()); // Allow other properties

// Infer TypeScript types
type ReviewState = z.infer<typeof ReviewStateSchema>;
type SavedSettings = z.infer<typeof SavedSettingsSchema>;

const ReviewTab = ({ reviews, accent, conversationId }: ReviewTabProps) => {
    const { t } = useTranslation();

    const reviewKey = `conversation-${conversationId}-${accent}-review`;

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

    const [reviewState, setReviewState] = useState<ReviewState>(() => {
        const savedSettings = getSavedSettings();
        const savedReviews = savedSettings.conversationReview?.[accent] || {};

        // Validate and build initial review state
        const reviewStateResult = ReviewStateSchema.safeParse(savedReviews);
        const validSavedReviews = reviewStateResult.success ? reviewStateResult.data : {};

        const initialReviewState: ReviewState = reviews.reduce(
            (acc: ReviewState, _review: Review, index: number) => {
                const key = `${reviewKey}${index + 1}`;
                acc[key] = validSavedReviews[key] || false;
                return acc;
            },
            {}
        );

        // Validate the initial state
        const initialResult = ReviewStateSchema.safeParse(initialReviewState);
        return initialResult.success ? initialResult.data : {};
    });

    // Load saved review states from localStorage with validation
    useEffect(() => {
        const savedSettings = getSavedSettings();
        const savedReviews = savedSettings.conversationReview?.[accent] || {};

        // Validate saved reviews
        const reviewsResult = ReviewStateSchema.safeParse(savedReviews);
        const validSavedReviews = reviewsResult.success ? reviewsResult.data : {};

        const initialReviewState: ReviewState = reviews.reduce(
            (acc: ReviewState, _review: Review, index: number) => {
                const key = `${reviewKey}${index + 1}`;
                acc[key] = validSavedReviews[key] || false;
                return acc;
            },
            {}
        );

        // Validate the initial state before setting
        const initialResult = ReviewStateSchema.safeParse(initialReviewState);
        if (initialResult.success) {
            setReviewState(initialResult.data);
        } else {
            console.warn("❌ Failed to validate initial review state:", initialResult.error);
            setReviewState({});
        }
    }, [accent, conversationId, reviews, reviewKey]);

    // Handle checkbox change with validation
    const handleCheckboxChange = (index: number) => {
        const key = `${reviewKey}${index}`;

        setReviewState((prev) => {
            // Validate current state
            const currentResult = ReviewStateSchema.safeParse(prev);
            const currentState = currentResult.success ? currentResult.data : {};

            const newReviewState: ReviewState = {
                ...currentState,
                [key]: !currentState[key],
            };

            // Validate new state
            const newResult = ReviewStateSchema.safeParse(newReviewState);
            if (!newResult.success) {
                console.warn("❌ Failed to validate new review state:", newResult.error);
                return currentState;
            }

            // Save to localStorage with validation
            const savedSettings = getSavedSettings();

            // Ensure conversationReview exists
            if (!savedSettings.conversationReview) {
                savedSettings.conversationReview = {};
            }

            // Get current accent data and validate it
            const currentAccentDataResult = ReviewStateSchema.safeParse(
                savedSettings.conversationReview[accent] || {}
            );
            const currentAccentData = currentAccentDataResult.success
                ? currentAccentDataResult.data
                : {};

            // Update the specific review state while preserving the rest of the data
            const updatedReviews = {
                ...currentAccentData,
                [key]: newReviewState[key],
            };

            // Validate updated reviews before saving
            const updatedResult = ReviewStateSchema.safeParse(updatedReviews);
            if (updatedResult.success) {
                savedSettings.conversationReview[accent] = updatedResult.data;
                setSavedSettings(savedSettings);
            } else {
                console.warn("❌ Failed to validate updated reviews:", updatedResult.error);
            }

            return newResult.data;
        });

        sonnerSuccessToast(t("toast.reviewUpdated"));
    };

    return (
        <div className="container-lg mx-auto">
            {reviews.map((review, index) => {
                const reviewIndex = index + 1;
                const key = `${reviewKey}${reviewIndex}`;
                const isChecked = !!reviewState[key];

                return (
                    <div key={index} className="mb-2">
                        <label htmlFor={`review-${index}`} className="cursor-pointer">
                            <span>{t(review.text)}</span>
                            <input
                                id={`review-${index}`}
                                type="checkbox"
                                className="checkbox checkbox-sm ms-2 align-text-bottom"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(reviewIndex)}
                            />
                        </label>
                    </div>
                );
            })}
        </div>
    );
};

export default ReviewTab;
