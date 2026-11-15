import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseJsonResponse } from '../server/src/services/responseParser';
import { validateStudyResponse } from '../server/src/services/responseValidator';
import { generateStudySet, enrichWithApplicationIds } from '../server/src/services/studyGenerator';
import * as groqService from '../server/src/services/groqService';
import { AppError } from '../server/src/utils/AppError';

describe('TASK 4 — AI Response Parsing & Validation Pipeline', () => {
  const sampleNotes =
    'A process is a program in execution. The CPU scheduler chooses from among the processes in memory that are ready to execute. Threads are the smallest unit of execution.';

  const validRawStudySet = {
    title: 'Operating Systems & Processes',
    summary: 'Overview of processes, threads, and CPU scheduling.',
    flashcards: [
      {
        front: 'What is a process?',
        back: 'A program in execution.',
        sourceExcerpt: 'A process is a program in execution.',
      },
    ],
    quiz: [
      {
        question: 'What is a process?',
        options: [
          { id: 'A', text: 'A program in execution' },
          { id: 'B', text: 'A hardware register' },
          { id: 'C', text: 'A file on disk' },
          { id: 'D', text: 'A network socket' },
        ],
        correctOptionId: 'A',
        explanation: 'A process is defined as a program in execution.',
        sourceExcerpt: 'A process is a program in execution.',
      },
    ],
  };

  describe('1. Response Parser (responseParser.ts)', () => {
    it('parses clean JSON', () => {
      const res = parseJsonResponse(JSON.stringify(validRawStudySet));
      expect(res.success).toBe(true);
      if (res.success) {
        expect((res.data as any).title).toBe(validRawStudySet.title);
      }
    });

    it('strips markdown code fences (```json ... ```)', () => {
      const raw = `\`\`\`json\n${JSON.stringify(validRawStudySet)}\n\`\`\``;
      const res = parseJsonResponse(raw);
      expect(res.success).toBe(true);
      if (res.success) {
        expect((res.data as any).title).toBe(validRawStudySet.title);
      }
    });

    it('extracts JSON surrounded by conversational text', () => {
      const raw = `Sure! Here is the JSON you requested:\n${JSON.stringify(validRawStudySet)}\nHope this helps you study!`;
      const res = parseJsonResponse(raw);
      expect(res.success).toBe(true);
      if (res.success) {
        expect((res.data as any).title).toBe(validRawStudySet.title);
      }
    });

    it('rejects empty string', () => {
      const res = parseJsonResponse('');
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain('Empty response');
      }
    });

    it('rejects malformed JSON syntax', () => {
      const res = parseJsonResponse('{ "title": "Broken JSON, missing brace');
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain('Malformed JSON');
      }
    });
  });

  describe('2. Response Validator (responseValidator.ts)', () => {
    it('accepts perfectly valid AI response', () => {
      const res = validateStudyResponse(validRawStudySet, 'both', sampleNotes);
      expect(res.success).toBe(true);
      expect(res.errors.length).toBe(0);
    });

    it('rejects missing required properties (title missing)', () => {
      const invalid = { ...validRawStudySet, title: undefined };
      const res = validateStudyResponse(invalid, 'both', sampleNotes);
      expect(res.success).toBe(false);
      expect(res.errors.some((e) => e.includes('title'))).toBe(true);
    });

    it('rejects wrong data types (flashcards is a string)', () => {
      const invalid = { ...validRawStudySet, flashcards: 'not an array' };
      const res = validateStudyResponse(invalid, 'both', sampleNotes);
      expect(res.success).toBe(false);
      expect(res.errors.length).toBeGreaterThan(0);
    });

    it('rejects empty flashcard array in flashcards mode', () => {
      const invalid = { ...validRawStudySet, flashcards: [] };
      const res = validateStudyResponse(invalid, 'flashcards', sampleNotes);
      expect(res.success).toBe(false);
      expect(res.errors.some((e) => e.includes('flashcards'))).toBe(true);
    });

    it('rejects quiz question with less than 4 options', () => {
      const invalid = {
        ...validRawStudySet,
        quiz: [
          {
            ...validRawStudySet.quiz[0],
            options: [
              { id: 'A', text: '1' },
              { id: 'B', text: '2' },
              { id: 'C', text: '3' },
            ],
          },
        ],
      };
      const res = validateStudyResponse(invalid, 'both', sampleNotes);
      expect(res.success).toBe(false);
      expect(res.errors.some((e) => e.includes('4 options'))).toBe(true);
    });

    it('rejects duplicate quiz option IDs', () => {
      const invalid = {
        ...validRawStudySet,
        quiz: [
          {
            ...validRawStudySet.quiz[0],
            options: [
              { id: 'A', text: '1' },
              { id: 'A', text: '2' },
              { id: 'C', text: '3' },
              { id: 'D', text: '4' },
            ],
          },
        ],
      };
      const res = validateStudyResponse(invalid, 'both', sampleNotes);
      expect(res.success).toBe(false);
      expect(res.errors.some((e) => e.toLowerCase().includes('unique'))).toBe(true);
    });

    it('rejects invalid correctOptionId not present in options', () => {
      const invalid = {
        ...validRawStudySet,
        quiz: [
          {
            ...validRawStudySet.quiz[0],
            correctOptionId: 'Z',
          },
        ],
      };
      const res = validateStudyResponse(invalid, 'both', sampleNotes);
      expect(res.success).toBe(false);
      expect(res.errors.some((e) => e.includes('does not match any available options'))).toBe(true);
    });

    it('detects ungrounded source excerpt not found in original notes', () => {
      const invalid = {
        ...validRawStudySet,
        flashcards: [
          {
            front: 'What is quantum entanglement?',
            back: 'Spooky action at a distance.',
            sourceExcerpt: 'Quantum particles remain connected so that physical properties are linked.',
          },
        ],
      };
      const res = validateStudyResponse(invalid, 'both', sampleNotes);
      expect(res.success).toBe(false);
      expect(res.errors.some((e) => e.includes('sourceExcerpt'))).toBe(true);
    });
  });

  describe('3. Study Generator Orchestrator & Repair Mechanism (studyGenerator.ts)', () => {
    it('returns enriched StudySet on first attempt when AI response is valid', async () => {
      vi.spyOn(groqService, 'generateContentWithGroq').mockResolvedValueOnce(
        JSON.stringify(validRawStudySet)
      );

      let traceData: any = null;
      const result = await generateStudySet(
        { notes: sampleNotes, mode: 'both', difficulty: 'medium' },
        (trace) => (traceData = trace)
      );

      expect(traceData).toEqual({ attempts: 1, repaired: false, errors: [] });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.flashcards[0].id).toBeDefined();
      expect(result.quiz[0].id).toBeDefined();
      expect(result.title).toBe(validRawStudySet.title);
    });

    it('triggers repair attempt and succeeds when attempt 1 is invalid but repair is valid', async () => {
      const invalidFirstAttempt = JSON.stringify({
        ...validRawStudySet,
        quiz: [
          {
            ...validRawStudySet.quiz[0],
            options: [
              { id: 'A', text: '1' },
              { id: 'B', text: '2' },
            ], // Only 2 options!
          },
        ],
      });

      const spy = vi.spyOn(groqService, 'generateContentWithGroq');
      spy.mockResolvedValueOnce(invalidFirstAttempt); // Attempt 1: invalid
      spy.mockResolvedValueOnce(JSON.stringify(validRawStudySet)); // Attempt 2: corrected

      let traceData: any = null;
      const result = await generateStudySet(
        { notes: sampleNotes, mode: 'both', difficulty: 'medium' },
        (trace) => (traceData = trace)
      );

      expect(spy).toHaveBeenCalledTimes(2);
      expect(traceData?.attempts).toBe(2);
      expect(traceData?.repaired).toBe(true);
      expect(result.quiz[0].options.length).toBe(4);
    });

    it('fails safely with AppError if both initial attempt and repair attempt fail', async () => {
      const invalidResponse = JSON.stringify({
        title: 'Broken',
        summary: 'Missing everything else',
        flashcards: [],
        quiz: [],
      });

      const spy = vi.spyOn(groqService, 'generateContentWithGroq');
      spy.mockResolvedValue(invalidResponse); // All attempts fail

      await expect(
        generateStudySet({ notes: sampleNotes, mode: 'both', difficulty: 'medium' })
      ).rejects.toThrow(AppError);

      try {
        await generateStudySet({ notes: sampleNotes, mode: 'both', difficulty: 'medium' });
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).code).toBe('INVALID_AI_OUTPUT');
        expect((err as AppError).retryable).toBe(true);
        expect((err as AppError).statusCode).toBe(502);
      }
    });
  });

  describe('4. ID Enrichment (enrichWithApplicationIds)', () => {
    it('attaches unique UUIDs to study set, flashcards, and questions', () => {
      const enriched = enrichWithApplicationIds(validRawStudySet);

      expect(enriched.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(enriched.flashcards[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(enriched.quiz[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(new Date(enriched.createdAt).getTime()).not.toBeNaN();
    });
  });
});
