export interface AccentData {
    accent: "british" | "american";
}

export type ExamData = Record<string, ExamDetails>;

export interface DialogLine {
    speaker: string;
    speech: string;
}

export interface SkillCheckmark {
    label: string;
}

export interface TaskData {
    para: string;
    listItems: string[];
    images: string[];
}

export interface WatchAndStudy {
    videoLink: string;
    offlineFile: string;
    subtitle: string;
    taskData: TaskData;
    study: {
        dialog: DialogLine[];
        skills: SkillCheckmark[];
    };
}

export interface Sentence {
    audioSrc: string;
    sentence: string;
}

export interface Subtopic {
    title: string;
    sentences: Sentence[];
}

export interface Listen {
    BrE: {
        subtopics: Subtopic[];
    };
    AmE: {
        subtopics: Subtopic[];
    };
}

export interface Tips {
    dos: string[];
    donts: string[];
}

export interface Practise {
    task: TaskData[];
    tips: Tips;
}

export interface Review {
    text: string;
}

// ExamDetailPage
export interface ExamDetails {
    description: string;
    watch_and_study: WatchAndStudy;
    listen: Listen;
    practise: Practise;
    reviews: Review[];
}

export interface ExamDetailPageProps {
    id: string;
    title: string;
    onBack: () => void;
    accent: AccentData;
}

//ExamPage
export interface ExamTitle {
    title: string;
    id: string;
    exam_popup: string;
}

export interface ExamSection {
    heading: string;
    titles: ExamTitle[];
}

export interface SelectedExam {
    id: string;
    title: string;
    heading: string;
}

export interface TooltipIconProps {
    exam_popup: string;
}

export interface ExamCardProps {
    heading: string;
    titles: ExamTitle[];
}

// ListeningTab
export interface ListeningTabProps {
    subtopicsBre: Subtopic[];
    subtopicsAme: Subtopic[];
    currentAccent: string;
}

// PracticeTab
export interface PracticeTabProps {
    accent: string;
    examId: string | number;
    taskData: TaskData[];
    tips: Tips;
}

// ReviewTab
export interface ReviewTabProps {
    reviews: Review[];
    accent: string;
    examId: string | number;
}

// WatchAndStudyTab
export interface WatchAndStudyTabProps {
    videoUrl: string;
    subtitleUrl: string;
    taskData: TaskData;
    dialog: DialogLine[];
    skills: SkillCheckmark[];
}
