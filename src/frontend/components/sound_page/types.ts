// Sound type
export type SoundType = "consonants" | "vowels" | "diphthongs";

// Accent type
export type AccentType = "british" | "american";

export interface Phoneme {
    type: SoundType;
    key: string;
}

export type TranslationFunction = (
    key: string,
    options?: Record<string, unknown>
) => string | string[];

// Menu item for a sound
export interface SoundMenuItem extends Phoneme {
    phoneme: string;
    id: number;
    word: string;
}

// Tongue twister line and item
export type TongueTwisterLine = string;

export interface TongueTwisterItem {
    text?: string;
    title?: string;
    lines?: TongueTwisterLine[];
}

// Used in SoundMain for accent-specific data
export interface PhonemeData {
    initial: string;
    medial: string;
    final: string;
    mainOnlineVideo: string;
    mainOfflineVideo: string;
    practiceOnlineVideos: (string | null)[];
    practiceOfflineVideos: (string | null)[];
    tongueTwister?: TongueTwisterItem[];
}

// Used in SoundMain for each sound
export interface SoundData {
    phoneme: string;
    info: string[];
    id: number;
    british: PhonemeData[] | null;
    american: PhonemeData[] | null;
}

// Used in SoundMain for all sounds
export interface SoundsData {
    consonants: SoundData[];
    vowels: SoundData[];
    diphthongs: SoundData[];
}

// Used in ReviewCard
export type ReviewType = "good" | "neutral" | "bad" | null;

// Used in WatchVideoCard
export interface VideoData {
    mainOfflineVideo: string;
    mainOnlineVideo: string;
}

// Used in TongueTwister
export interface Sound {
    type: SoundType;
    id: number;
}

// Props

export interface ReviewCardProps {
    sound: SoundMenuItem;
    accent: AccentType;
    t: TranslationFunction;
    onReviewUpdate?: () => void;
}

export interface WatchVideoCardProps {
    videoData: VideoData;
    accent: AccentType;
    t: TranslationFunction;
    phoneme: Phoneme;
}

export interface TongueTwisterProps {
    tongueTwisters: TongueTwisterItem[];
    t: TranslationFunction;
    sound: Sound;
    accent: AccentType;
}

export interface PracticeSoundProps {
    sound: SoundMenuItem;
    accent: AccentType;
    onBack: () => void;
}

// SoundList
export interface TabNavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    scrollTo: () => void;
    t: TranslationFunction;
}

// SoundList
export interface SoundCardProps {
    sound: SoundMenuItem;
    index: number;
    selectedAccent: AccentType;
    handlePracticeClick: (sound: SoundMenuItem, accent: AccentType, index: number) => void;
    getBadgeColor: (sound: SoundMenuItem, index: number) => string | null;
    getReviewText: (review: string | undefined) => string;
    getReviewKey: (sound: SoundMenuItem, index: number) => string;
    reviews: Record<string, string>;
    t: TranslationFunction;
}

export interface ReviewCardProps {
    sound: SoundMenuItem;
    accent: AccentType;
    t: TranslationFunction;
    onReviewUpdate?: () => void;
}

// SoundPracticeCard
export interface SoundPracticeCardProps {
    textContent: string;
    videoUrl: string;
    offlineVideo: string;
    accent: AccentType;
    t: TranslationFunction;
    phoneme: string;
    phonemeId: number;
    index: number;
    type: SoundType;
    shouldShowPhoneme?: boolean;
}

// SoundPracticeCard
export interface SoundVideoDialogState {
    isOpen?: boolean;
    videoUrl: string | null;
    title: string;
    phoneme: string;
    isLocalVideo: boolean;
    onIframeLoad: (() => void) | null;
    iframeLoading: boolean;
    showOnlineVideoAlert: boolean;
    t: TranslationFunction;
}

// SoundPracticeCard
export interface SoundVideoDialogContextType {
    showDialog: (state: SoundVideoDialogState) => void;
    isAnyCardActive: boolean;
    setCardActive: (cardId: string, isActive: boolean) => void;
    closeDialog: () => void;
    handleIframeLoad: () => void;
    dialogState: SoundVideoDialogState;
    activeCard: string | null;
    t: TranslationFunction;
}
