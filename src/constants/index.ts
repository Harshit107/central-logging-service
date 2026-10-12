/**
 * Centralized Constants for Central Logging Service (TypeScript)
 */

export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const ROUTES = Object.freeze({
  API_BASE: API_PREFIX,
  HEALTH: `${API_PREFIX}/health`,
  LOGS: Object.freeze({
    BASE: `${API_PREFIX}/logs`,
    ERROR: "/error",
    INFO: "/info",
    USER_DATA: "/user-data",
    USER_DATA_BY_ID: "/user-data/:messageId",
  }),
});

export const ECOSYSTEM_URLS = Object.freeze({
  LOGGER_API: "https://logger-api.harshit107.online",
  LOGGER_UI: "https://logger.harshit107.online",
  MAIL_API: "https://freelyemail-api.harshit107.online",
  SHOWCASE_UI: "https://freelyemail.harshit107.online",
} as const);

export const DEFAULT_CONFIG = Object.freeze({
  PORT: 5001,
  SERVICE_NAME: "central-logging-service",
  HEADER_KEY_NAME: "x-logging-key",
  ECOSYSTEM_URLS,
});

export const LOG_LEVELS = Object.freeze({
  ERROR: "error",
  FATAL: "fatal",
  INFO: "info",
  DEBUG: "debug",
  WARN: "warn",
} as const);

export const USER_DATA_TYPES = Object.freeze({
  NOTIFICATION: "notification",
  OTP: "otp",
  LINK: "link",
  CUSTOM: "custom",
} as const);

export const USER_DATA_STATUSES = Object.freeze({
  QUEUED: "queued",
  DISPATCHED: "dispatched",
  DELIVERED: "delivered",
  ACKNOWLEDGED: "acknowledged",
  OPENED: "opened",
  FAILED: "failed",
  BOUNCED: "bounced",
} as const);

export const SUCCESS_MESSAGES = Object.freeze({
  HEALTH: "Central Logging Service is working perfectly fine.",
  ERROR_LOG_SAVED: "Error log recorded successfully",
  INFO_LOG_SAVED: "Informational log recorded successfully",
  USER_DATA_LOG_SAVED: "User-data log recorded successfully",
  USER_DATA_LOG_UPDATED: "User-data log updated successfully",
  RECORDS_RETRIEVED: "Matching records retrieved successfully",
});

export const ERROR_CODES = Object.freeze({
  // 400 Bad Request / Validation
  INVALID_JSON: "INVALID_JSON",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MISSING_REQUIRED_FIELDS: "MISSING_REQUIRED_FIELDS",
  INVALID_MESSAGE_ID: "INVALID_MESSAGE_ID",
  INVALID_LOG_LEVEL: "INVALID_LOG_LEVEL",

  // 401 / 403 Unauthorized / Forbidden
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_API_KEY: "INVALID_API_KEY",

  // 404 Not Found
  ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND",
  NO_RECORDS_FOUND: "NO_RECORDS_FOUND",

  // 429 Too Many Requests
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // 500 Internal Server Error
  DATABASE_CONNECTION_ERROR: "DATABASE_CONNECTION_ERROR",
  LOG_PERSISTENCE_FAILED: "LOG_PERSISTENCE_FAILED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
});

export const ERROR_MESSAGES = Object.freeze({
  [ERROR_CODES.INVALID_JSON]: "Invalid JSON payload provided",
  [ERROR_CODES.VALIDATION_ERROR]: "Validation failed for request data",
  [ERROR_CODES.MISSING_REQUIRED_FIELDS]: "Required fields are missing in log request",
  [ERROR_CODES.INVALID_MESSAGE_ID]: "A valid Message ID is required",
  [ERROR_CODES.INVALID_LOG_LEVEL]: "Invalid log level specified",
  [ERROR_CODES.UNAUTHORIZED]: "Authentication failed: Missing x-logging-key header",
  [ERROR_CODES.INVALID_API_KEY]: "Authentication failed: Invalid x-logging-key provided",
  [ERROR_CODES.ROUTE_NOT_FOUND]: "The requested route does not exist",
  [ERROR_CODES.NO_RECORDS_FOUND]: "No matching log records found for the given Message ID",
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: "Too many requests, please slow down",
  [ERROR_CODES.DATABASE_CONNECTION_ERROR]: "Database connection failed",
  [ERROR_CODES.LOG_PERSISTENCE_FAILED]: "Failed to store log record in database",
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: "Internal Server Error",
});
