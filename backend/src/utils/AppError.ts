/**
 * Custom application error class.
 * Carries an HTTP status code so the error middleware can send
 * the correct response without guessing.
 */
class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ── Specialized Error Classes ──────────────────────────────────────

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required.") {
    super(401, message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export default AppError;
