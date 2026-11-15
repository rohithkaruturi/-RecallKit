import { describe, it, expect } from 'vitest';
import { parseJsonResponse } from '../server/src/services/responseParser';
import { validateStudyResponse } from '../server/src/services/responseValidator';

describe('TASK 9 — Backend Failure Simulation Catalog', () => {
  const sampleNotes =
    'Operating systems manage computer hardware and execution. Processes represent programs in execution. Schedulers allocate CPU cycles.';

  const validResponse = {
    title: 'Operating Systems Basics',
    summary: 'Hardware management and CPU process scheduling.',
    flashcards: [
      {
        front: 'What is a process?',
        back: 'A program in execution.',
        sourceExcerpt: 'Processes represent programs in execution.',
      },
    ],
    quiz: [
      {
        question: 'What allocates CPU cycles to ready processes?',
        options: [
          { id: 'A', text: 'Disk Swapper' },
          { id: 'B', text: 'Scheduler' },
          { id: 'C', text: 'Memory Bus' },
          { id: 'D', text: 'Graphics Card' },
        ],
        correctOptionId: 'B',
        explanation: 'Schedulers allocate CPU cycles.',
        sourceExcerpt: 'Schedulers allocate CPU cycles.',
      },
    ],
  };

  // 1. Valid JSON
  it('Scenario 1: Handles Valid JSON correctly', () => {
    const raw = JSON.stringify(validResponse);
    const parsed = parseJsonResponse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const validated = validateStudyResponse(parsed.data, 'both', sampleNotes);
      expect(validated.success).toBe(true);
    }
  });

  // 2. Malformed JSON
  it('Scenario 2: Handles Malformed JSON without crashing', () => {
    const raw = '{ title: "Unquoted key, unclosed string';
    const parsed = parseJsonResponse(raw);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error).toContain('Malformed JSON');
    }
  });

  // 3. Empty Output
  it('Scenario 3: Handles Empty / Whitespace Output gracefully', () => {
    const raw = '   \n\t  ';
    const parsed = parseJsonResponse(raw);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error).toContain('Empty response');
    }
  });

  // 4. Invalid Response Shape (primitive or array instead of object)
  it('Scenario 4: Handles Invalid Response Shape (e.g. array instead of object)', () => {
    const raw = JSON.stringify(['just an array of strings']);
    const parsed = parseJsonResponse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const validated = validateStudyResponse(parsed.data, 'both', sampleNotes);
      expect(validated.success).toBe(false);
      expect(validated.errors.length).toBeGreaterThan(0);
    }
  });

  // 5. Missing Properties
  it('Scenario 5: Rejects Missing Required Properties (e.g. missing title & summary)', () => {
    const invalid = {
      flashcards: validResponse.flashcards,
      quiz: validResponse.quiz,
    };
    const validated = validateStudyResponse(invalid, 'both', sampleNotes);
    expect(validated.success).toBe(false);
    expect(validated.errors.some((e) => e.includes('title'))).toBe(true);
  });

  // 6. Invalid Quiz Options (3 options instead of 4)
  it('Scenario 6: Rejects Invalid Quiz Options (< 4 options)', () => {
    const invalid = {
      ...validResponse,
      quiz: [
        {
          ...validResponse.quiz[0],
          options: [
            { id: 'A', text: '1' },
            { id: 'B', text: '2' },
            { id: 'C', text: '3' },
          ],
        },
      ],
    };
    const validated = validateStudyResponse(invalid, 'both', sampleNotes);
    expect(validated.success).toBe(false);
    expect(validated.errors.some((e) => e.includes('4 options'))).toBe(true);
  });

  // 7. Duplicate Option IDs
  it('Scenario 7: Rejects Duplicate Option IDs (e.g. A, A, C, D)', () => {
    const invalid = {
      ...validResponse,
      quiz: [
        {
          ...validResponse.quiz[0],
          options: [
            { id: 'A', text: 'Opt 1' },
            { id: 'A', text: 'Opt 2' },
            { id: 'C', text: 'Opt 3' },
            { id: 'D', text: 'Opt 4' },
          ],
        },
      ],
    };
    const validated = validateStudyResponse(invalid, 'both', sampleNotes);
    expect(validated.success).toBe(false);
    expect(validated.errors.some((e) => e.toLowerCase().includes('unique'))).toBe(true);
  });

  // 8. Invalid Correct Answer ID
  it('Scenario 8: Rejects Invalid correctOptionId not present in options', () => {
    const invalid = {
      ...validResponse,
      quiz: [
        {
          ...validResponse.quiz[0],
          correctOptionId: 'Z',
        },
      ],
    };
    const validated = validateStudyResponse(invalid, 'both', sampleNotes);
    expect(validated.success).toBe(false);
    expect(validated.errors.some((e) => e.includes('does not match any available options'))).toBe(true);
  });

  // 9. Ungrounded Excerpt
  it('Scenario 9: Rejects Source Excerpts not found in notes', () => {
    const invalid = {
      ...validResponse,
      flashcards: [
        {
          front: 'What is photosynthesis?',
          back: 'Process using sunlight to synthesize foods.',
          sourceExcerpt: 'Chlorophyll absorbs sunlight in plant thylakoid membranes.',
        },
      ],
    };
    const validated = validateStudyResponse(invalid, 'both', sampleNotes);
    expect(validated.success).toBe(false);
    expect(validated.errors.some((e) => e.includes('sourceExcerpt'))).toBe(true);
  });
});
