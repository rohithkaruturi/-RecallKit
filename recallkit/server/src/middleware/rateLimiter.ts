import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for study material generation endpoint.
 * Prevents API abuse and token exhaustion.
 */
export const studyRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      ok: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a moment before generating more study material.',
        retryable: true,
      },
    });
  },
});
