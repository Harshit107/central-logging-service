import { Request, Response, NextFunction } from "express";
import { ERROR_CODES, ERROR_MESSAGES } from "../constants";

export class APIError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string | null = null,
    details: any = null
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode =
      errorCode ||
      (statusCode === 400
        ? ERROR_CODES.VALIDATION_ERROR
        : statusCode === 401
        ? ERROR_CODES.UNAUTHORIZED
        : statusCode === 403
        ? ERROR_CODES.INVALID_API_KEY
        : statusCode === 404
        ? ERROR_CODES.ROUTE_NOT_FOUND
        : statusCode === 429
        ? ERROR_CODES.RATE_LIMIT_EXCEEDED
        : ERROR_CODES.INTERNAL_SERVER_ERROR);
    this.details = details;
    Object.setPrototypeOf(this, APIError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle malformed JSON body errors from express.json()
  if (err instanceof SyntaxError && (err as any).status === 400 && "body" in err) {
    res.status(400).json({
      success: false,
      data: null,
      message: ERROR_MESSAGES[ERROR_CODES.INVALID_JSON],
      error: {
        errorCode: ERROR_CODES.INVALID_JSON,
        message: ERROR_MESSAGES[ERROR_CODES.INVALID_JSON],
      },
    });
    return;
  }

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError" && err.errors) {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    res.status(400).json({
      success: false,
      data: null,
      message: messages.join(", "),
      error: {
        errorCode: ERROR_CODES.VALIDATION_ERROR,
        message: messages.join(", "),
        details: err.errors,
      },
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId or type conversion)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      data: null,
      message: `Invalid format for field: ${err.path}`,
      error: {
        errorCode: ERROR_CODES.VALIDATION_ERROR,
        message: `Invalid format for field: ${err.path}`,
      },
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const errorCode =
    err.errorCode ||
    (statusCode === 400
      ? ERROR_CODES.VALIDATION_ERROR
      : statusCode === 401
      ? ERROR_CODES.UNAUTHORIZED
      : statusCode === 403
      ? ERROR_CODES.INVALID_API_KEY
      : statusCode === 404
      ? ERROR_CODES.ROUTE_NOT_FOUND
      : statusCode === 429
      ? ERROR_CODES.RATE_LIMIT_EXCEEDED
      : ERROR_CODES.INTERNAL_SERVER_ERROR);
  const message = err.message || ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR];

  if (statusCode === 500) {
    console.error("Central Logging Service Error:", err);
  }

  const errorPayload: Record<string, any> = {
    errorCode,
    message,
  };

  if (err.details !== undefined && err.details !== null) {
    errorPayload.details = err.details;
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error: errorPayload,
  });
};

export default errorHandler;
