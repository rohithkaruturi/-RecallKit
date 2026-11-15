// ============================================================
// RecallKit — Custom Application Error
// ============================================================

export class AppError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly statusCode: number;

  constructor(
    code: string,
    message: string,
    retryable: boolean = false,
    statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.retryable = retryable;
    this.statusCode = statusCode;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
