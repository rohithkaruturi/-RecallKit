import type { Request, Response, NextFunction } from 'express';

/**
 * Per-request timeout middleware.
 * Ensures long-running LLM calls do not leave clients hanging indefinitely.
 */
export function requestTimeout(ms: number = 40000) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          ok: false,
          error: {
            code: 'REQUEST_TIMEOUT',
            message: `Study generation timed out after ${ms / 1000} seconds. Please try again.`,
            retryable: true,
          },
        });
      }
    }, ms);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}
