import type { Request, Response } from 'express';
import { GenerateRequestSchema } from '../../../shared/studySchema';
import { generateStudySet } from '../services/studyGenerator';
import { AppError } from '../utils/AppError';

/**
 * Handles POST /api/study/generate
 * Validates request payload, invokes the AI generator, and returns standard response contract.
 */
export async function generateStudyController(req: Request, res: Response): Promise<void> {
  // 1. Validate request body against schema
  const parsedRequest = GenerateRequestSchema.safeParse(req.body);

  if (!parsedRequest.success) {
    const errorMessages = (parsedRequest.error.issues || []).map(
      (err) => `${err.path.join('.') || 'body'}: ${err.message}`
    );

    res.status(400).json({
      ok: false,
      error: {
        code: 'INVALID_REQUEST',
        message: errorMessages.join('; '),
        retryable: false,
      },
    });
    return;
  }

  // 2. Invoke generator pipeline
  try {
    const studySet = await generateStudySet(parsedRequest.data);

    res.status(200).json({
      ok: true,
      data: studySet,
    });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        ok: false,
        error: {
          code: err.code,
          message: err.message,
          retryable: err.retryable,
        },
      });
      return;
    }

    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      ok: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: `An unexpected error occurred: ${message}`,
        retryable: true,
      },
    });
  }
}
