import { AppError } from '../utils/AppError';

const defaultGroqModel = 'llama-3.3-70b-versatile';

export function getGroqClient(): string {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new AppError(
      'MISSING_API_KEY',
      'Groq API key is not configured. Please set GROQ_API_KEY in server/.env',
      false,
      500
    );
  }

  return apiKey;
}

export async function generateContentWithGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey === 'mock') {
    return getMockGroqResponse(prompt);
  }

  const key = getGroqClient();
  const modelName = process.env.GROQ_MODEL || defaultGroqModel;
  const endpoint = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: modelName,
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a study-material generation model. Return only valid JSON matching the exact schema requested by the user.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const message = errorBody || `Groq request failed with status ${response.status}`;

      if (response.status === 401 || response.status === 403) {
        throw new AppError(
          'AUTH_ERROR',
          'Invalid or unauthorized Groq API key. Please verify your GROQ_API_KEY in server/.env',
          false,
          401
        );
      }

      if (response.status === 429) {
        throw new AppError(
          'RATE_LIMITED',
          'Groq API rate limit or quota exceeded. Please try again shortly.',
          true,
          429
        );
      }

      if (response.status === 500 || response.status === 502 || response.status === 503) {
        throw new AppError(
          'SERVICE_UNAVAILABLE',
          'Groq service is temporarily unavailable. Please retry.',
          true,
          503
        );
      }

      throw new AppError(
        'GROQ_PROVIDER_ERROR',
        `Failed to generate study material from Groq: ${message}`,
        true,
        502
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = payload?.choices?.[0]?.message?.content;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      throw new AppError(
        'EMPTY_AI_RESPONSE',
        'Groq returned an empty response',
        true,
        502
      );
    }

    return text;
  } catch (err: unknown) {
    if (err instanceof AppError) {
      throw err;
    }

    const message = err instanceof Error ? err.message : String(err);

    if (message.includes('429') || message.includes('rate limit')) {
      throw new AppError(
        'RATE_LIMITED',
        'Groq API rate limit or quota exceeded. Please try again shortly.',
        true,
        429
      );
    }

    if (message.includes('401') || message.includes('403') || message.includes('unauthorized')) {
      throw new AppError(
        'AUTH_ERROR',
        'Invalid or unauthorized Groq API key. Please verify your GROQ_API_KEY in server/.env',
        false,
        401
      );
    }

    if (message.includes('500') || message.includes('503') || message.includes('unavailable')) {
      throw new AppError(
        'SERVICE_UNAVAILABLE',
        'Groq service is temporarily unavailable. Please retry.',
        true,
        503
      );
    }

    throw new AppError(
      'GROQ_PROVIDER_ERROR',
      `Failed to generate study material from Groq: ${message}`,
      true,
      502
    );
  }
}

export function getMockGroqResponse(prompt: string): string {
  const isFlashcardOnly = prompt.includes('Mode: FLASHCARDS');
  const isQuizOnly = prompt.includes('Mode: QUIZ');

  const flashcards = isQuizOnly
    ? []
    : [
        {
          front: 'What is a process in operating systems?',
          back: 'A program in execution, consisting of program code, current activity, registers, and memory.',
          sourceExcerpt: 'A process is a program in execution.',
        },
        {
          front: 'What is the role of the CPU scheduler?',
          back: 'It selects from among the processes in memory that are ready to execute and allocates the CPU.',
          sourceExcerpt: 'The CPU scheduler selects the next process to execute.',
        },
      ];

  const quiz = isFlashcardOnly
    ? []
    : [
        {
          question: 'What selects which process executes next on the CPU?',
          options: [
            { id: 'A', text: 'Memory Manager' },
            { id: 'B', text: 'CPU Scheduler' },
            { id: 'C', text: 'File System' },
            { id: 'D', text: 'Device Controller' },
          ],
          correctOptionId: 'B',
          explanation: 'The CPU scheduler is responsible for selecting processes from the ready queue.',
          sourceExcerpt: 'The CPU scheduler selects the next process to execute.',
        },
      ];

  return JSON.stringify({
    title: 'Operating Systems & Process Management',
    summary: 'Core concepts of process execution and CPU scheduling in modern operating systems.',
    flashcards,
    quiz,
  });
}
