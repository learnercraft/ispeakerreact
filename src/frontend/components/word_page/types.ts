// Centralized types for word_page components

export interface Word {
    fileName: string;
    fileNameUS?: string;
    level: string[];
    name: string;
    nameUS?: string;
    pos: string[];
    pronunciation: string;
    pronunciationUS?: string;
    wordId: number;
}

export type AccentType = "american" | "british";

export type ReviewType = "good" | "neutral" | "bad" | null;

export type ReviewData = Record<string, Record<string, ReviewType>>;

export type TranslationFunction = (
    key: string,
    options?: Record<string, unknown>
) => string | string[];

export interface Syllable {
    text: string;
    primary: boolean;
    secondary: boolean;
}

export interface WordDetailsProps {
    word: Word;
    handleBack: () => void;
    t: TranslationFunction;
    accent: AccentType;
    onReviewUpdate?: () => void;
    scrollRef?: React.RefObject<HTMLDivElement>;
}

export interface ReviewRecordingProps {
    wordName: string;
    accent: AccentType;
    isRecordingExists: boolean;
    t: TranslationFunction;
    onReviewUpdate?: () => void;
}

export interface RecordingWaveformProps {
    wordKey: string;
    maxDuration: number;
    disableControls?: boolean;
    onActivityChange?: ((isActive: boolean) => void) | undefined;
    onRecordingSaved?: (() => void) | undefined;
    isAudioLoading?: boolean;
    displayPronunciation?: string;
    t: TranslationFunction;
    themeConfig?: WaveformThemeConfig;
}

export interface PronunciationCheckerProps {
    icon?: React.ReactNode;
    disabled?: boolean;
    wordKey: string;
    displayPronunciation?: string;
    modelName?: string;
    onLoadingChange?: (loading: boolean) => void;
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    t: TranslationFunction;
    scrollTo: (options?: { behavior: string }) => void;
}

export interface WaveformThemeColors {
    waveformColor: string;
    progressColor: string;
    cursorColor: string;
}

export interface WaveformThemeConfig {
    waveformLight: string;
    waveformDark: string;
    progressLight: string;
    progressDark: string;
    cursorLight: string;
    cursorDark: string;
}
