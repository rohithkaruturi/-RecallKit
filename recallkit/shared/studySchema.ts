import { z } from 'zod';
import type { GenerationMode } from './types';

// ============================================================
// Generation Request & Mode Schemas
// ============================================================

export const GenerationModeSchema = z.enum(['flashcards', 'quiz', 'both']);
export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

export const GenerateRequestSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(50, 'Notes must be at least 50 characters to generate meaningful study material')
    .max(20000, 'Notes cannot exceed 20,000 characters'),
  mode: GenerationModeSchema,
  difficulty: DifficultySchema,
});

export type GenerateRequestInput = z.infer<typeof GenerateRequestSchema>;

// ============================================================
// Raw AI Output Schemas (AI generates these before App IDs)
// ============================================================

export const QuizOptionSchema = z.object({
  id: z.string().trim().min(1, 'Option ID cannot be empty'),
  text: z.string().trim().min(1, 'Option text cannot be empty'),
});

export const RawQuizQuestionSchema = z
  .object({
    question: z.string().trim().min(1, 'Question text cannot be empty'),
    options: z
      .array(QuizOptionSchema)
      .length(4, 'Quiz question must have exactly 4 options'),
    correctOptionId: z.string().trim().min(1, 'Correct option ID cannot be empty'),
    explanation: z.string().trim().min(1, 'Explanation cannot be empty'),
    sourceExcerpt: z.string().trim().min(1, 'Source excerpt cannot be empty'),
  })
  .superRefine((data, ctx) => {
    // 1. Validate that all 4 option IDs are unique
    const optionIds = data.options.map((opt) => opt.id.trim().toUpperCase());
    const uniqueIds = new Set(optionIds);
    if (uniqueIds.size !== data.options.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Option IDs must be unique within a question',
        path: ['options'],
      });
    }

    // 2. Validate that correctOptionId matches one of the options
    const normalizedCorrect = data.correctOptionId.trim().toUpperCase();
    const hasMatch = optionIds.includes(normalizedCorrect);
    if (!hasMatch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `correctOptionId "${data.correctOptionId}" does not match any available options (${data.options.map((o) => o.id).join(', ')})`,
        path: ['correctOptionId'],
      });
    }
  });

export type RawQuizQuestion = z.infer<typeof RawQuizQuestionSchema>;

export const RawFlashcardSchema = z.object({
  front: z.string().trim().min(1, 'Flashcard front question cannot be empty'),
  back: z.string().trim().min(1, 'Flashcard back answer cannot be empty'),
  sourceExcerpt: z.string().trim().min(1, 'Source excerpt cannot be empty'),
});

export type RawFlashcard = z.infer<typeof RawFlashcardSchema>;

export const RawStudySetSchema = z.object({
  title: z.string().trim().min(1, 'Study set title cannot be empty'),
  summary: z.string().trim().min(1, 'Study set summary cannot be empty'),
  flashcards: z.array(RawFlashcardSchema).max(30).optional().default([]),
  quiz: z.array(RawQuizQuestionSchema).max(30).optional().default([]),
});

export type RawStudySet = z.infer<typeof RawStudySetSchema>;

// ============================================================
// Mode-Aware Validation
// ============================================================

export function validateRawStudySetForMode(
  data: unknown,
  mode: GenerationMode
): { success: true; data: RawStudySet } | { success: false; errors: string[] } {
  const result = RawStudySetSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues || [];
    return {
      success: false,
      errors: issues.map(
        (err) => `${err.path.join('.') || 'root'}: ${err.message}`
      ),
    };
  }

  const study = result.data;
  const errors: string[] = [];

  if ((mode === 'flashcards' || mode === 'both') && study.flashcards.length === 0) {
    errors.push('flashcards: Mode requested flashcards, but received an empty array (minimum 1 required)');
  }

  if ((mode === 'quiz' || mode === 'both') && study.quiz.length === 0) {
    errors.push('quiz: Mode requested quiz, but received an empty array (minimum 1 required)');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: study };
}

// ============================================================
// Enriched Application Schemas (with app-generated IDs)
// ============================================================

export const FlashcardSchema = RawFlashcardSchema.extend({
  id: z.string().min(1, 'Flashcard ID is required'),
});

export const QuizQuestionSchema = z.object({
  id: z.string().min(1, 'Quiz Question ID is required'),
  question: z.string().trim().min(1),
  options: z.array(QuizOptionSchema).length(4),
  correctOptionId: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
  sourceExcerpt: z.string().trim().min(1),
});

export const StudySetSchema = z.object({
  id: z.string().min(1, 'StudySet ID is required'),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  flashcards: z.array(FlashcardSchema),
  quiz: z.array(QuizQuestionSchema),
  createdAt: z.string().datetime().or(z.string().min(1)),
});
