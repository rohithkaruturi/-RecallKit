/**
 * Parses raw text output from the LLM into a JavaScript object.
 * Robustly strips markdown fences, conversational preambles, and handles JSON syntax errors.
 */
export function parseJsonResponse(raw: string): { success: true; data: unknown } | { success: false; error: string } {
  if (!raw || typeof raw !== 'string' || raw.trim() === '') {
    return { success: false, error: 'Empty response received from AI model' };
  }

  let cleaned = raw.trim();

  // Strip Markdown code fences if present (e.g. ```json ... ``` or ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
    cleaned = cleaned.trim();
  }

  // Attempt direct JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed !== 'object' || parsed === null) {
      return { success: false, error: 'AI output parsed to non-object value' };
    }
    return { success: true, data: parsed };
  } catch (initialErr) {
    // If direct parse fails, try extracting the outermost JSON object {...}
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const extracted = cleaned.slice(firstBrace, lastBrace + 1);
      try {
        const parsed = JSON.parse(extracted);
        if (typeof parsed === 'object' && parsed !== null) {
          return { success: true, data: parsed };
        }
      } catch {
        // Fall through to failure report
      }
    }

    const message = initialErr instanceof Error ? initialErr.message : String(initialErr);
    return {
      success: false,
      error: `Malformed JSON: ${message}`,
    };
  }
}
