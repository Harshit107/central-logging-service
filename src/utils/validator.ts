import crypto from "crypto";
import { LOG_LEVELS, USER_DATA_TYPES } from "../constants";
import { CreateErrorLogDTO, CreateInfoLogDTO, CreateUserDataLogDTO } from "../types";

/**
 * Checks if a value is a non-empty string
 */
export const isNonEmptyString = (val: any): val is string => {
  return typeof val === "string" && val.trim().length > 0;
};

/**
 * Generates a collision-resistant messageId
 * Format: msg_<timestamp>_<randomHex>
 */
export const generateMessageId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(6).toString("hex");
  return `msg_${timestamp}_${random}`;
};

/**
 * Validates a messageId candidate
 */
export const isValidMessageId = (id: any): boolean => {
  if (!isNonEmptyString(id)) return false;
  const sanitized = id.trim();
  return /^[a-zA-Z0-9_-]{3,128}$/.test(sanitized);
};

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[-_]?key/i,
  /auth/i,
  /bearer/i,
  /credential/i,
];

/**
 * Recursively sanitizes sensitive fields from metadata
 */
export const sanitizeMetadata = (obj: any, depth = 0): any => {
  if (depth > 5 || !obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((item) => sanitizeMetadata(item, depth + 1));

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeMetadata(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Validates error log payload
 */
export const validateErrorLogPayload = (body: Partial<CreateErrorLogDTO> = {}): string[] => {
  const errors: string[] = [];
  if (!isNonEmptyString(body.message)) {
    errors.push("message is required and must be a non-empty string");
  }
  if (body.level && body.level !== LOG_LEVELS.ERROR && body.level !== LOG_LEVELS.FATAL) {
    errors.push(`level must be either '${LOG_LEVELS.ERROR}' or '${LOG_LEVELS.FATAL}'`);
  }
  return errors;
};

/**
 * Validates info log payload
 */
export const validateInfoLogPayload = (body: Partial<CreateInfoLogDTO> = {}): string[] => {
  const errors: string[] = [];
  if (!isNonEmptyString(body.eventName)) {
    errors.push("eventName is required and must be a non-empty string");
  }
  if (!isNonEmptyString(body.message)) {
    errors.push("message is required and must be a non-empty string");
  }
  if (
    body.level &&
    body.level !== LOG_LEVELS.INFO &&
    body.level !== LOG_LEVELS.DEBUG &&
    body.level !== LOG_LEVELS.WARN
  ) {
    errors.push(`level must be '${LOG_LEVELS.INFO}', '${LOG_LEVELS.DEBUG}', or '${LOG_LEVELS.WARN}'`);
  }
  return errors;
};

/**
 * Validates user-data log payload
 */
export const validateUserDataPayload = (body: Partial<CreateUserDataLogDTO> = {}): string[] => {
  const errors: string[] = [];
  if (!body || typeof body !== "object") {
    errors.push("Payload must be a valid JSON object");
    return errors;
  }
  const allowedTypes = Object.values(USER_DATA_TYPES);
  if (body.type && !allowedTypes.includes(body.type as any)) {
    errors.push(`type must be one of: ${allowedTypes.join(", ")}`);
  }
  return errors;
};
