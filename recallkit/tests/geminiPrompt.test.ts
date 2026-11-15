import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildStudyPrompt, buildRepairPrompt } from '../server/src/prompts/studyPrompt';
import { getGroqClient, generateContentWithGroq } from '../server/src/services/groqService';
import { AppError } from '../server/src/utils/AppError';
import { RawStudySetSchema } from '../shared/studySchema';

describe('TASK 3 — Groq Integration & Prompt Engineering', () => {
  const sampleNotes = 'A process is a program in execution. The CPU scheduler chooses ready processes.';

  describe('1. Prompt Engineering (buildStudyPrompt)', () => {
    it('generates prompt for flashcards mode with empty quiz constraint', () => {
      const prompt = buildStudyPrompt(sampleNotes, 'flashcards', 'medium');
      expect(prompt).toContain('Mode: FLASHCARDS');
      expect(prompt).toContain('Difficulty: MEDIUM');
      expect(prompt).toContain('The "quiz" array MUST be empty ([])');
      expect(prompt).toContain(sampleNotes);
      expect(prompt).toContain('sourceExcerpt');
    });

    it('generates prompt for quiz mode with empty flashcards constraint', () => {
      const prompt = buildStudyPrompt(sampleNotes, 'quiz', 'hard');
      expect(prompt).toContain('Mode: QUIZ');
      expect(prompt).toContain('Difficulty: HARD');
      expect(prompt).toContain('The "flashcards" array MUST be empty ([])');
      expect(prompt).toContain('EXACTLY FOUR options');
    });

    it('generates prompt for both mode with both materials requested', () => {
      const prompt = buildStudyPrompt(sampleNotes, 'both', 'easy');
      expect(prompt).toContain('Mode: BOTH');
      expect(prompt).toContain('Difficulty: EASY');
      expect(prompt).toContain('Generate BOTH a set of flashcards AND multiple-choice quiz questions');
    });

    it('includes strict schema contract and sourceExcerpt requirement', () => {
      const prompt = buildStudyPrompt(sampleNotes, 'both', 'medium');
      expect(prompt).toContain('"sourceExcerpt"');
      expect(prompt).toContain('"correctOptionId"');
      expect(prompt).toContain('EXPECTED JSON SCHEMA');
    });

    it('builds a repair prompt including the validation errors and original task', () => {
      const original = 'Original prompt text';
      const invalidJson = '{"title":"Test"}';
      const errors = ['Missing required field "summary"', 'options array must have 4 items'];

      const repair = buildRepairPrompt(original, invalidJson, errors);
      expect(repair).toContain('VALIDATION ERRORS DETECTED');
      expect(repair).toContain('Missing required field "summary"');
      expect(repair).toContain('options array must have 4 items');
      expect(repair).toContain(invalidJson);
    });
  });

  describe('2. Groq Service & Configuration', () => {
    const originalEnv = process.env.GROQ_API_KEY;

    afterEach(() => {
      process.env.GROQ_API_KEY = originalEnv;
    });

    it('throws AppError with MISSING_API_KEY if key is missing or placeholder', () => {
      process.env.GROQ_API_KEY = 'your_api_key_here';
      expect(() => getGroqClient()).toThrow(AppError);

      try {
        getGroqClient();
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe('MISSING_API_KEY');
        expect((err as AppError).retryable).toBe(false);
      }
    });

    it('generates structured valid study set in mock mode', async () => {
      process.env.GROQ_API_KEY = 'mock';
      const prompt = buildStudyPrompt(sampleNotes, 'both', 'medium');
      const rawResponse = await generateContentWithGroq(prompt);

      expect(typeof rawResponse).toBe('string');
      const parsed = JSON.parse(rawResponse);
      const validation = RawStudySetSchema.safeParse(parsed);

      expect(validation.success).toBe(true);
      if (validation.success) {
        expect(validation.data.flashcards.length).toBeGreaterThan(0);
        expect(validation.data.quiz.length).toBeGreaterThan(0);
        expect(validation.data.quiz[0].options.length).toBe(4);
      }
    });
  });
});
