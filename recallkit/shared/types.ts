// ============================================================
// RecallKit — Shared Type Definitions
// ============================================================
// These types are shared across the client and server.
// They define the data contract for the entire application.
// ============================================================

// --- Generation Config ---

export type GenerationMode = 'flashcards' | 'quiz' | 'both';
export type Difficulty = 'easy' | 'medium' | 'hard';

// --- Raw AI Output Structures (Pre-ID Enrichment) ---

export interface RawQuizOption {
  id: string;
  text: string;
}

export interface RawQuizQuestion {
  question: string;
  options: RawQuizOption[];   // exactly 4
  correctOptionId: string;    // must exist in options
  explanation: string;
  sourceExcerpt: string;      // quote from user's notes
}

export interface RawFlashcard {
  front: string;              // question
  back: string;               // answer
  sourceExcerpt: string;      // quote from user's notes
}

export interface RawStudySet {
  title: string;
  summary: string;
  flashcards: RawFlashcard[];
  quiz: RawQuizQuestion[];
}

// --- Application Data Structures (Post-ID Enrichment) ---

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;                 // app-generated unique UUID
  question: string;
  options: QuizOption[];      // exactly 4
  correctOptionId: string;    // must match one of options.id
  explanation: string;
  sourceExcerpt: string;
}

export interface Flashcard {
  id: string;                 // app-generated unique UUID
  front: string;
  back: string;
  sourceExcerpt: string;
}

export interface StudySet {
  id: string;                 // app-generated unique UUID
  title: string;
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  createdAt: string;          // ISO 8601 timestamp
}

// --- API Contract ---

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
