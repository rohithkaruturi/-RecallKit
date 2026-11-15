import type { GenerationMode, Difficulty } from '../../../shared/types';

/**
 * Builds the system instructions and user prompt for Groq.
 * Enforces structured JSON output according to RecallKit's data contract.
 */
export function buildStudyPrompt(
  notes: string,
  mode: GenerationMode,
  difficulty: Difficulty
): string {
  const difficultyInstructions = getDifficultyGuidance(difficulty);
  const modeInstructions = getModeGuidance(mode);

  return `
You are an expert AI study assistant and instructional designer.
Your task is to transform the provided study notes into high-quality, interactive study materials.

=== INPUT NOTES ===
${notes.trim()}
=== END NOTES ===

=== CONFIGURATION ===
- Mode: ${mode.toUpperCase()}
- Difficulty: ${difficulty.toUpperCase()}

=== DIFFICULTY GUIDELINES (${difficulty.toUpperCase()}) ===
${difficultyInstructions}

=== MODE REQUIREMENTS ===
${modeInstructions}

=== CRITICAL CONTRACT RULES ===
1. TITLE: Create a concise, descriptive title (3-7 words) summarizing the main subject.
2. SUMMARY: Write a 1-3 sentence summary of the key concepts covered.
3. FLASHCARDS:
   - "front": Clear, unambiguous concept or question.
   - "back": Comprehensive, accurate explanation or definition.
   - "sourceExcerpt": MUST be a direct verbatim excerpt or close quote from the provided notes that justifies this card.
4. QUIZ QUESTIONS:
   - "question": High-quality multiple-choice question testing understanding (avoid trivial or trick questions).
   - "options": EXACTLY FOUR options with IDs "A", "B", "C", "D".
   - "correctOptionId": MUST be one of "A", "B", "C", "D" matching the correct answer.
   - "explanation": Clear reasoning why the correct answer is right and why distractors are incorrect.
   - "sourceExcerpt": MUST be a direct excerpt from the provided notes supporting the correct answer.
5. GROUNDING: Do NOT invent facts or hallucinate details not found or directly implied in the notes.
6. OUTPUT FORMAT: Return ONLY valid, parseable JSON conforming strictly to the schema below. No markdown backticks, no explanations outside the JSON object.

=== EXPECTED JSON SCHEMA ===
{
  "title": "string",
  "summary": "string",
  "flashcards": [
    {
      "front": "string",
      "back": "string",
      "sourceExcerpt": "string"
    }
  ],
  "quiz": [
    {
      "question": "string",
      "options": [
        { "id": "A", "text": "string" },
        { "id": "B", "text": "string" },
        { "id": "C", "text": "string" },
        { "id": "D", "text": "string" }
      ],
      "correctOptionId": "A",
      "explanation": "string",
      "sourceExcerpt": "string"
    }
  ]
}
`.trim();
}

/**
 * Builds a prompt for repairing an invalid AI response that failed Zod validation.
 */
export function buildRepairPrompt(
  originalPrompt: string,
  invalidJson: string,
  errors: string[]
): string {
  return `
Your previous response could not be accepted because it violated our strict runtime validation schema.

=== VALIDATION ERRORS DETECTED ===
${errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n')}

=== YOUR PREVIOUS RAW OUTPUT ===
${invalidJson.slice(0, 3000)}

=== ORIGINAL TASK INSTRUCTIONS ===
${originalPrompt}

=== REPAIR INSTRUCTIONS ===
Please fix all the validation errors listed above:
1. Ensure EVERY quiz question has EXACTLY 4 options with unique IDs ("A", "B", "C", "D").
2. Ensure "correctOptionId" exactly matches one of the option IDs.
3. Ensure every flashcard and quiz question includes a valid "sourceExcerpt".
4. Ensure no required fields are missing or empty.
5. Return ONLY pure, corrected JSON. No markdown fences.
`.trim();
}

function getDifficultyGuidance(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return '- Focus on foundational definitions, core terminology, and basic recall.\n- Keep questions direct and options clearly distinct.\n- Aim for 3-5 flashcards and/or 3-4 quiz questions.';
    case 'medium':
      return '- Focus on understanding, application, relationships between concepts, and comparisons.\n- Distractors should be plausible misconceptions.\n- Aim for 5-8 flashcards and/or 4-6 quiz questions.';
    case 'hard':
      return '- Focus on synthesis, edge cases, subtle distinctions, trade-offs, and scenario analysis.\n- Distractors should require careful critical thinking.\n- Aim for 6-10 flashcards and/or 5-8 quiz questions.';
  }
}

function getModeGuidance(mode: GenerationMode): string {
  switch (mode) {
    case 'flashcards':
      return '- Generate a comprehensive set of flashcards.\n- The "quiz" array MUST be empty ([])';
    case 'quiz':
      return '- Generate a challenging set of multiple-choice questions.\n- The "flashcards" array MUST be empty ([])';
    case 'both':
      return '- Generate BOTH a set of flashcards AND multiple-choice quiz questions covering the material thoroughly.';
  }
}
