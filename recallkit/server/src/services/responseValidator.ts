import { validateRawStudySetForMode } from '../../../shared/studySchema';
import type { RawStudySet } from '../../../shared/types';
import type { GenerationMode } from '../../../shared/types';

export interface ValidationResult {
  success: boolean;
  data?: RawStudySet;
  errors: string[];
}

/**
 * Validates parsed AI response against Zod schemas, mode constraints,
 * and data relationship rules (including source excerpt grounding).
 */
export function validateStudyResponse(
  data: unknown,
  mode: GenerationMode,
  originalNotes?: string
): ValidationResult {
  // 1. Zod schema and mode validation
  const modeValidation = validateRawStudySetForMode(data, mode);
  if (!modeValidation.success) {
    return {
      success: false,
      errors: modeValidation.errors,
    };
  }

  const study = modeValidation.data;
  const errors: string[] = [];

  // 2. Data relationship check: verify options structure & uniqueness
  study.quiz.forEach((q, qIndex) => {
    if (q.options.length !== 4) {
      errors.push(`Quiz question #${qIndex + 1}: Must contain exactly 4 options, found ${q.options.length}`);
    }

    const optionIds = q.options.map((opt) => opt.id.trim().toUpperCase());
    const uniqueIds = new Set(optionIds);
    if (uniqueIds.size !== q.options.length) {
      errors.push(`Quiz question #${qIndex + 1}: Duplicate option IDs found (${optionIds.join(', ')})`);
    }

    const correctId = q.correctOptionId.trim().toUpperCase();
    if (!optionIds.includes(correctId)) {
      errors.push(
        `Quiz question #${qIndex + 1}: correctOptionId "${q.correctOptionId}" does not match any option (${optionIds.join(', ')})`
      );
    }
  });

  // 3. Grounding check: Source excerpt verification against original notes (if provided)
  if (originalNotes && originalNotes.trim().length > 0) {
    const normalizedNotes = normalizeText(originalNotes);

    study.flashcards.forEach((card, idx) => {
      if (!isExcerptGrounded(card.sourceExcerpt, normalizedNotes)) {
        errors.push(
          `Flashcard #${idx + 1}: sourceExcerpt "${truncate(card.sourceExcerpt, 40)}" not found in provided study notes`
        );
      }
    });

    study.quiz.forEach((q, idx) => {
      if (!isExcerptGrounded(q.sourceExcerpt, normalizedNotes)) {
        errors.push(
          `Quiz question #${idx + 1}: sourceExcerpt "${truncate(q.sourceExcerpt, 40)}" not found in provided study notes`
        );
      }
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: study,
    errors: [],
  };
}

/**
 * Normalizes text by lowercasing and collapsing whitespace/punctuation
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifies if the source excerpt is present or substantially represented in the notes.
 */
function isExcerptGrounded(excerpt: string, normalizedNotes: string): boolean {
  if (!excerpt || excerpt.trim().length === 0) return false;

  const normalizedExcerpt = normalizeText(excerpt);
  if (normalizedNotes.includes(normalizedExcerpt)) {
    return true;
  }

  // If exact normalized phrase is not found, check if key words (min 3 words) match consecutively
  const words = normalizedExcerpt.split(' ').filter((w) => w.length > 2);
  if (words.length <= 2) {
    return normalizedNotes.includes(normalizedExcerpt);
  }

  // Check 3-word n-gram matches from the excerpt
  for (let i = 0; i <= words.length - 3; i++) {
    const chunk = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    if (normalizedNotes.includes(chunk)) {
      return true;
    }
  }

  return false;
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}
