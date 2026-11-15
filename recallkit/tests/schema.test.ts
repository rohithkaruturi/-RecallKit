import { describe, it, expect } from 'vitest';
import {
  RawStudySetSchema,
  RawQuizQuestionSchema,
  RawFlashcardSchema,
  GenerateRequestSchema,
  validateRawStudySetForMode,
  StudySetSchema,
} from '../shared/studySchema';

describe('TASK 2 — Zod Schemas & Validation Contracts', () => {
  const validFlashcard = {
    front: 'What is a process?',
    back: 'A program in execution.',
    sourceExcerpt: 'A process is a program in execution.',
  };

  const validQuizQuestion = {
    question: 'What schedules processes?',
    options: [
      { id: 'A', text: 'Memory Manager' },
      { id: 'B', text: 'CPU Scheduler' },
      { id: 'C', text: 'File System' },
      { id: 'D', text: 'Device Driver' },
    ],
    correctOptionId: 'B',
    explanation: 'The CPU scheduler selects the next process to execute.',
    sourceExcerpt: 'The CPU scheduler selects a process.',
  };

  const validStudySet = {
    title: 'Operating Systems',
    summary: 'Introduction to operating systems and scheduling',
    flashcards: [validFlashcard],
    quiz: [validQuizQuestion],
  };

  describe('1. RawFlashcardSchema', () => {
    it('accepts valid flashcard', () => {
      const res = RawFlashcardSchema.safeParse(validFlashcard);
      expect(res.success).toBe(true);
    });

    it('rejects empty front', () => {
      const res = RawFlashcardSchema.safeParse({
        ...validFlashcard,
        front: '',
      });
      expect(res.success).toBe(false);
    });

    it('rejects empty back', () => {
      const res = RawFlashcardSchema.safeParse({
        ...validFlashcard,
        back: '   ',
      });
      expect(res.success).toBe(false);
    });

    it('rejects empty sourceExcerpt', () => {
      const res = RawFlashcardSchema.safeParse({
        ...validFlashcard,
        sourceExcerpt: '',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('2. RawQuizQuestionSchema', () => {
    it('accepts valid quiz question with 4 unique options and matching correctOptionId', () => {
      const res = RawQuizQuestionSchema.safeParse(validQuizQuestion);
      expect(res.success).toBe(true);
    });

    it('rejects if question text is empty', () => {
      const res = RawQuizQuestionSchema.safeParse({
        ...validQuizQuestion,
        question: '',
      });
      expect(res.success).toBe(false);
    });

    it('rejects if options array has less than 4 options', () => {
      const res = RawQuizQuestionSchema.safeParse({
        ...validQuizQuestion,
        options: [
          { id: 'A', text: 'Opt 1' },
          { id: 'B', text: 'Opt 2' },
          { id: 'C', text: 'Opt 3' },
        ],
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('exactly 4 options');
      }
    });

    it('rejects if options array has more than 4 options', () => {
      const res = RawQuizQuestionSchema.safeParse({
        ...validQuizQuestion,
        options: [
          { id: 'A', text: 'Opt 1' },
          { id: 'B', text: 'Opt 2' },
          { id: 'C', text: 'Opt 3' },
          { id: 'D', text: 'Opt 4' },
          { id: 'E', text: 'Opt 5' },
        ],
      });
      expect(res.success).toBe(false);
    });

    it('rejects duplicate option IDs', () => {
      const res = RawQuizQuestionSchema.safeParse({
        ...validQuizQuestion,
        options: [
          { id: 'A', text: 'Opt 1' },
          { id: 'A', text: 'Opt 2' },
          { id: 'C', text: 'Opt 3' },
          { id: 'D', text: 'Opt 4' },
        ],
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        const hasDuplicateMessage = res.error.issues.some((e) =>
          e.message.toLowerCase().includes('unique')
        );
        expect(hasDuplicateMessage).toBe(true);
      }
    });

    it('rejects when correctOptionId does not exist in options', () => {
      const res = RawQuizQuestionSchema.safeParse({
        ...validQuizQuestion,
        correctOptionId: 'Z',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        const hasMismatchMessage = res.error.issues.some((e) =>
          e.message.includes('does not match any available options')
        );
        expect(hasMismatchMessage).toBe(true);
      }
    });
  });

  describe('3. RawStudySetSchema', () => {
    it('accepts the full sample JSON matching specification', () => {
      const res = RawStudySetSchema.safeParse(validStudySet);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.title).toBe('Operating Systems');
        expect(res.data.flashcards.length).toBe(1);
        expect(res.data.quiz.length).toBe(1);
      }
    });

    it('rejects missing or empty title', () => {
      const res = RawStudySetSchema.safeParse({
        ...validStudySet,
        title: '',
      });
      expect(res.success).toBe(false);
    });

    it('rejects missing or empty summary', () => {
      const res = RawStudySetSchema.safeParse({
        ...validStudySet,
        summary: '   ',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('4. Mode-Aware Validation (validateRawStudySetForMode)', () => {
    it('passes for "both" mode when flashcards and quiz are present', () => {
      const res = validateRawStudySetForMode(validStudySet, 'both');
      expect(res.success).toBe(true);
    });

    it('fails for "both" mode when flashcards array is empty', () => {
      const res = validateRawStudySetForMode(
        { ...validStudySet, flashcards: [] },
        'both'
      );
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.errors[0]).toContain('flashcards');
      }
    });

    it('fails for "both" mode when quiz array is empty', () => {
      const res = validateRawStudySetForMode(
        { ...validStudySet, quiz: [] },
        'both'
      );
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.errors[0]).toContain('quiz');
      }
    });

    it('passes for "flashcards" mode even if quiz is empty', () => {
      const res = validateRawStudySetForMode(
        { ...validStudySet, quiz: [] },
        'flashcards'
      );
      expect(res.success).toBe(true);
    });

    it('passes for "quiz" mode even if flashcards is empty', () => {
      const res = validateRawStudySetForMode(
        { ...validStudySet, flashcards: [] },
        'quiz'
      );
      expect(res.success).toBe(true);
    });
  });

  describe('5. GenerateRequestSchema', () => {
    const validRequest = {
      notes:
        'A process is a program in execution. The CPU scheduler chooses from among the processes in memory that are ready to execute.',
      mode: 'both',
      difficulty: 'medium',
    };

    it('accepts valid generate request', () => {
      const res = GenerateRequestSchema.safeParse(validRequest);
      expect(res.success).toBe(true);
    });

    it('rejects notes under 50 characters', () => {
      const res = GenerateRequestSchema.safeParse({
        ...validRequest,
        notes: 'Too short notes',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('at least 50 characters');
      }
    });

    it('rejects invalid mode', () => {
      const res = GenerateRequestSchema.safeParse({
        ...validRequest,
        mode: 'invalid_mode',
      });
      expect(res.success).toBe(false);
    });

    it('rejects invalid difficulty', () => {
      const res = GenerateRequestSchema.safeParse({
        ...validRequest,
        difficulty: 'expert',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('6. StudySetSchema (Enriched with App IDs)', () => {
    it('validates a complete enriched study set with application IDs', () => {
      const enrichedSet = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Operating Systems',
        summary: 'Intro to OS',
        flashcards: [
          {
            id: 'card-1',
            front: 'Q',
            back: 'A',
            sourceExcerpt: 'Excerpt',
          },
        ],
        quiz: [
          {
            id: 'quiz-1',
            question: 'What is OS?',
            options: [
              { id: 'A', text: '1' },
              { id: 'B', text: '2' },
              { id: 'C', text: '3' },
              { id: 'D', text: '4' },
            ],
            correctOptionId: 'A',
            explanation: 'Exp',
            sourceExcerpt: 'Src',
          },
        ],
        createdAt: new Date().toISOString(),
      };

      const res = StudySetSchema.safeParse(enrichedSet);
      expect(res.success).toBe(true);
    });
  });
});
