
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorHandler: ErrorRequestHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  if (err.status && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({
      message: err.message,
    });
  }
  next(err);
}