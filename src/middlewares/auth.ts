import { Request, Response, NextFunction } from "express";
import { APIError } from "./error";
import { DEFAULT_CONFIG, ERROR_CODES, ERROR_MESSAGES } from "../constants";

/**
 * Validates the inter-service secret header
 * Expected header: x-logging-key
 * Configured secret: LOGGING_SERVICE_API_KEY
 */
export const requireLoggingApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const configuredKey = process.env.LOGGING_SERVICE_API_KEY;

  // Fallback to repository private key if not specifically set
  const expectedKey = configuredKey || process.env.PRIVATE_API_KEY;

  if (!expectedKey) {
    console.error("FATAL: Neither LOGGING_SERVICE_API_KEY nor PRIVATE_API_KEY is configured in .env");
    return next(
      new APIError(
        "Logging service authentication is misconfigured",
        500,
        ERROR_CODES.INTERNAL_SERVER_ERROR
      )
    );
  }

  const headerName = DEFAULT_CONFIG.HEADER_KEY_NAME.toLowerCase();
  const providedKey = req.headers[headerName] || req.headers["x-api-key"];

  if (!providedKey) {
    return next(
      new APIError(
        ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
        401,
        ERROR_CODES.UNAUTHORIZED
      )
    );
  }

  const keyString = Array.isArray(providedKey) ? providedKey[0] : providedKey;

  if (typeof keyString !== "string" || keyString.trim() !== expectedKey.trim()) {
    return next(
      new APIError(
        ERROR_MESSAGES[ERROR_CODES.INVALID_API_KEY],
        403,
        ERROR_CODES.INVALID_API_KEY
      )
    );
  }

  next();
};

export default requireLoggingApiKey;
