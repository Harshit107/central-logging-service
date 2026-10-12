import ErrorLog, { IErrorLogDocument } from "../models/errorLog.model";
import InfoLog, { IInfoLogDocument } from "../models/infoLog.model";
import UserDataLog, { IUserDataLogDocument } from "../models/userDataLog.model";
import {
  generateMessageId,
  isValidMessageId,
  sanitizeMetadata,
  validateErrorLogPayload,
  validateInfoLogPayload,
  validateUserDataPayload,
} from "../utils/validator";
import { APIError } from "../middlewares/error";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  LOG_LEVELS,
  USER_DATA_TYPES,
  USER_DATA_STATUSES,
} from "../constants";
import {
  CreateErrorLogDTO,
  CreateInfoLogDTO,
  CreateUserDataLogDTO,
  UserDataLogRetrievalResult,
} from "../types";

/**
 * Persists an Error Log
 */
export const recordErrorLog = async (data: CreateErrorLogDTO): Promise<IErrorLogDocument> => {
  const errors = validateErrorLogPayload(data);
  if (errors.length > 0) {
    throw new APIError(errors.join(", "), 400, ERROR_CODES.VALIDATION_ERROR, { validationErrors: errors });
  }

  const logEntry = await ErrorLog.create({
    serviceName: data.serviceName || "default-service",
    environment: data.environment || process.env.NODE_ENV || "production",
    level: data.level || LOG_LEVELS.ERROR,
    message: data.message,
    errorCode: data.errorCode || null,
    stackTrace: data.stackTrace || null,
    correlationId: data.correlationId || null,
    metadata: sanitizeMetadata(data.metadata || {}),
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
  });

  return logEntry;
};

/**
 * Persists an Informational Log
 */
export const recordInfoLog = async (data: CreateInfoLogDTO): Promise<IInfoLogDocument> => {
  const errors = validateInfoLogPayload(data);
  if (errors.length > 0) {
    throw new APIError(errors.join(", "), 400, ERROR_CODES.VALIDATION_ERROR, { validationErrors: errors });
  }

  const logEntry = await InfoLog.create({
    serviceName: data.serviceName || "default-service",
    environment: data.environment || process.env.NODE_ENV || "production",
    level: data.level || LOG_LEVELS.INFO,
    eventName: data.eventName,
    message: data.message,
    correlationId: data.correlationId || null,
    metadata: sanitizeMetadata(data.metadata || {}),
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
  });

  return logEntry;
};

/**
 * Persists a User-Data Log with Message ID Guarantee
 */
export const recordUserDataLog = async (data: CreateUserDataLogDTO): Promise<IUserDataLogDocument> => {
  const errors = validateUserDataPayload(data);
  if (errors.length > 0) {
    throw new APIError(errors.join(", "), 400, ERROR_CODES.VALIDATION_ERROR, { validationErrors: errors });
  }

  // Preserve valid incoming Message ID; otherwise generate a collision-resistant one
  let messageId: string;
  if (isValidMessageId(data.messageId)) {
    messageId = data.messageId!.trim();
  } else {
    messageId = generateMessageId();
  }

  const logEntry = await UserDataLog.create({
    messageId,
    sender: data.sender || "FreelyEmail",
    recipient: data.recipient || data.to || null,
    replyTo: data.replyTo || null,
    app: data.app || data.appName || "FreelyEmail",
    subject: data.subject || null,
    type: data.type || USER_DATA_TYPES.NOTIFICATION,
    status: data.status || USER_DATA_STATUSES.DISPATCHED,
    metadata: sanitizeMetadata(data.metadata || {}),
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
  });

  return logEntry;
};

/**
 * Retrieves User-Data Logs by Message ID
 */
export const getUserDataLogsByMessageId = async (
  messageId: string,
  options: { page?: any; limit?: any } = {}
): Promise<UserDataLogRetrievalResult> => {
  if (!isValidMessageId(messageId)) {
    throw new APIError(ERROR_MESSAGES[ERROR_CODES.INVALID_MESSAGE_ID], 400, ERROR_CODES.INVALID_MESSAGE_ID);
  }

  const pageNum = Math.max(1, parseInt(options.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [records, total] = await Promise.all([
    UserDataLog.find({ messageId: messageId.trim() })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    UserDataLog.countDocuments({ messageId: messageId.trim() }),
  ]);

  return {
    records: records as any,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: skip + records.length < total,
    },
  };
};

/**
 * Retrieves the latest user-data logs for dashboard activity feed
 */
export const getRecentUserDataLogs = async (limit = 20): Promise<IUserDataLogDocument[]> => {
  return (await UserDataLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()) as any;
};
