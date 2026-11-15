export type GenerationMode = 'flashcards' | 'quiz' | 'both';
export type Difficulty = 'easy' | 'medium' | 'hard';
export interface RawQuizOption {
    id: string;
    text: string;
}
export interface RawQuizQuestion {
    question: string;
    options: RawQuizOption[];
    correctOptionId: string;
    explanation: string;
    sourceExcerpt: string;
}
export interface RawFlashcard {
    front: string;
    back: string;
    sourceExcerpt: string;
}
export interface RawStudySet {
    title: string;
    summary: string;
    flashcards: RawFlashcard[];
    quiz: RawQuizQuestion[];
}
export interface QuizOption {
    id: string;
    text: string;
}
export interface QuizQuestion {
    id: string;
    question: string;
    options: QuizOption[];
    correctOptionId: string;
    explanation: string;
    sourceExcerpt: string;
}
export interface Flashcard {
    id: string;
    front: string;
    back: string;
    sourceExcerpt: string;
}
export interface StudySet {
    id: string;
    title: string;
    summary: string;
    flashcards: Flashcard[];
    quiz: QuizQuestion[];
    createdAt: string;
}
export interface GenerateRequest {
    notes: string;
    mode: GenerationMode;
    difficulty: Difficulty;
}
export interface ApiResponse<T> {
    ok: true;
    data: T;
}
export interface ApiError {
    ok: false;
    error: {
        code: string;
        message: string;
        retryable: boolean;
    };
}
export type ApiResult<T> = ApiResponse<T> | ApiError;
//# sourceMappingURL=types.d.ts.map