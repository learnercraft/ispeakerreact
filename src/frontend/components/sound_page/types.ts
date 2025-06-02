export type TranslationFunction = (
    key: string,
    options?: Record<string, unknown>
) => string | string[];

// Accent type
export type AccentType = "british" | "american";

// Sound type
export type SoundType = "consonants" | "vowels" | "diphthongs";

// Menu item for a sound
export interface SoundMenuItem {
    phoneme: string;
    id: number;
    type: SoundType;
    key: string;
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

export interface Phoneme {
    type: SoundType;
    key: string;
}

// Used in TongueTwister
export interface Sound {
    type: SoundType;
    id: number;
}
