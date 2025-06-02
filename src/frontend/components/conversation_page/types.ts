export interface Sentence {
    audioSrc: string;
    sentence: string;
}

export interface Subtopic {
    title: string;
    sentences: Sentence[];
}

export interface DialogLine {
    speaker: string;
    speech: string;
}

export interface SkillCheckmark {
    label: string;
}

export interface Review {
    text: string;
}

// Watch and Study
export interface WatchAndStudy {
    study: {
        dialog: DialogLine[];
        skill_checkmark: SkillCheckmark[];
    };
    videoLink: string;
    offlineFile: string;
    subtitle: string;
}

// Accent data (for ConversationDetailPage)
export interface AccentData {
    listen: {
        subtopics: Subtopic[];
    };
    reviews: Review[];
    watch_and_study: WatchAndStudy;
}

// Props for each tab/page
export interface ConversationDetailPageProps {
    id: string | number;
    accent: string;
    title: string;
    onBack: () => void;
}

export interface PracticeTabProps {
    accent: string;
    conversationId: string | number;
}

export interface ReviewTabProps {
    reviews: Review[];
    accent: string;
    conversationId: string | number;
}

export interface ListeningTabProps {
    sentences: Subtopic[];
}

export interface WatchAndStudyTabProps {
    videoUrl: string;
    subtitleUrl: string;
    dialog: DialogLine[];
    skillCheckmark: SkillCheckmark[];
}

// Menu/List types
export interface ConversationTitle {
    title: string;
    id: string;
    info: string;
}

export interface ConversationSection {
    heading: string;
    titles: ConversationTitle[];
}

export interface SelectedConversation {
    id: string;
    title: string;
    heading: string;
}
