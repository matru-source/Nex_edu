export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  logs?: string[];

  constructor(message: string, statusCode = 400, isOperational = true, logs?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.logs = logs;
    Error.captureStackTrace(this, this.constructor);
  }
}
