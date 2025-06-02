import type { UniqueIdentifier } from "@dnd-kit/core";
import type { horizontalListSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface TimedExerciseProps {
    timer: number;
    onQuit: () => void;
    setTimeIsUp: (isUp: boolean) => void;
}

export type AllQuizItems =
    | DictationQuizItem
    | MatchUpQuizItem
    | MemoryMatchQuizItem
    | OddOneOutQuestion
    | ReorderingQuizData
    | SnapQuizItem
    | SortingQuizItem
    | SoundAndSpellingQuizItem;

export type QuizItemWithExtras = AllQuizItems & { split?: string; type?: string };

// ExercisePage
export interface Exercise {
    id: string | number;
    title: string;
    titleKey?: string;
    infoKey?: string;
    american?: boolean;
    british?: boolean;
    file?: string;
}

export interface ExerciseSection {
    heading: string;
    titles: Exercise[];
    infoKey: string;
    file?: string;
}

export interface SelectedExercise {
    id: string | number;
    title: string;
    accent: string;
    file: string;
    heading: string;
}

export interface TooltipIconProps {
    info: string;
    onClick: () => void;
}

export interface ExerciseCardProps {
    heading: string;
    titles: Exercise[];
    infoKey: string;
    file?: string;
    onShowModal: (info: string) => void;
}

// ExerciseDetailPage
export interface ExerciseDetailPageProps {
    heading: string;
    id: string | number;
    title: string;
    accent: string;
    file: string;
    onBack: () => void;
}

export interface ExerciseDetailsType {
    id: string | number;
    split?: string;
    type?: string;
    british_american?: ExerciseDetailsType[];
    american?: ExerciseDetailsType[];
    british?: ExerciseDetailsType[];
    quiz?: AllQuizItems[];
    instructions?: string[];
    exercise?: string;
}
export type ExerciseDataType = Record<string, ExerciseDetailsType[]>;

// DictationQuiz
export type DictationWord = { textbox: string; level?: string } | { value: string };

export interface DictationQuizItem {
    words: DictationWord[];
    audio: { src: string };
    type?: string;
}

export interface DictationQuizProps extends TimedExerciseProps {
    quiz: DictationQuizItem[];
    onAnswer: (isCorrect: boolean, mode: string) => void;
}

// MatchUp
export interface AudioItem {
    src: string;
}

export interface WordItem {
    text: string;
    drag: boolean;
    id: string; // Always present
}

export interface MatchUpQuizItem {
    audio: AudioItem[];
    words: WordItem[];
    type?: string;
}

export interface MatchUpProps extends TimedExerciseProps {
    quiz: MatchUpQuizItem[];
    onAnswer: (correctCount: number, type: string, total: number) => void;
}

// MemoryMatch
export type CardFeedbackType = "correctPair" | "incorrectPair";

export interface MemoryMatchCard {
    value: string;
    text: string;
}

export interface MemoryMatchQuizItem {
    data: MemoryMatchCard[];
}

export interface MemoryMatchProps extends TimedExerciseProps {
    quiz: MemoryMatchQuizItem[];
    onMatchFinished: () => void;
}

export interface ShuffledCard extends MemoryMatchCard {
    id: number;
}

// OddOneOut
export interface OddOneOutOption {
    value: string;
    index: string;
    answer: "true" | "false";
}

export interface OddOneOutQuestion {
    data: OddOneOutOption[];
    question: { correctAns: string }[];
    split?: string;
    type?: string;
}

export interface OddOneOutProps extends TimedExerciseProps {
    quiz: OddOneOutQuestion[];
    onAnswer: (isCorrect: number, type: string) => void;
}

// Reordering
export interface ReorderingQuizData {
    data: { value: string }[];
    answer: string[];
    audio: { src: string };
    split: "word" | "sentence" | string;
}

export interface ReorderingProps extends TimedExerciseProps {
    quiz: ReorderingQuizData[];
    onAnswer: (isCorrect: number, type: "single" | "multiple", total?: number) => void;
}

export interface ShuffledItem {
    id: UniqueIdentifier;
    value: string;
    isCorrect?: boolean;
}

// Snap
export interface SnapQuizDataItem {
    value: string;
    index: string;
}

export interface SnapQuizFeedback {
    value?: string;
    index?: string;
    answer?: string;
    correctAns?: string;
}

export interface SnapQuizItem {
    data: SnapQuizDataItem[];
    feedbacks: SnapQuizFeedback[];
}

export interface SnapProps extends TimedExerciseProps {
    quiz: SnapQuizItem[];
    onAnswer: (isCorrect: number, type: "single" | "multiple", total?: number) => void;
}

export type ResultType = "success" | "danger" | null;

export interface DroppableAreaProps {
    feedback: SnapQuizFeedback;
    isDropped: boolean;
    result: ResultType;
    droppedOn: string | null;
}

export interface DraggableItemProps {
    isDropped: boolean;
}

// SortableWord
export interface Word {
    id: string;
    text?: string;
}

export interface Item {
    id: string;
    value?: string;
}

export interface SortableWordProps {
    word?: Word;
    item?: Item;
    isCorrect: boolean | null;
    disabled?: boolean;
    isOverlay?: boolean;
}

// SortingExercise
export interface RowOption {
    value: string;
    columnPos: number;
    id: string;
}

export interface TableHeading {
    text: string;
}

export interface SortingQuizItem {
    tableHeading: TableHeading[];
    rowOptions: RowOption[];
}

export interface SortingExerciseProps extends TimedExerciseProps {
    quiz: SortingQuizItem[];
    onAnswer: (correctCount: number, type: string, total: number) => void;
    useHorizontalStrategy?: boolean;
}

export interface SortableColumnProps {
    items: RowOption[];
    heading?: TableHeading;
    columnPos: number;
    sortableStrategy: typeof horizontalListSortingStrategy | typeof verticalListSortingStrategy;
    hasSubmitted: boolean;
    buttonsDisabled: boolean;
    t: (key: string) => string;
}

// SoundAndSpelling
export interface QuizOption {
    value: string;
    index: string;
    answer: "true" | "false";
}

export interface QuizQuestion {
    text: string;
    correctAns: string;
}

export interface QuizAudio {
    src: string;
}

export interface SoundAndSpellingQuizItem {
    data: QuizOption[];
    question: QuizQuestion[];
    audio: QuizAudio;
}

export interface SoundAndSpellingProps extends TimedExerciseProps {
    quiz: SoundAndSpellingQuizItem[];
    onAnswer: (score: number, type: string) => void;
}
