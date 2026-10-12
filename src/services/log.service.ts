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
  UpdateUserDataLogDTO,
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

  const rawId = messageId.trim();
  const cleanId = rawId.replace(/^<|>$/g, '');
  const withBrackets = `<${cleanId}>`;

  const pageNum = Math.max(1, parseInt(options.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  // Bracket-agnostic search matches both raw, clean, and wrapped forms
  const searchFilter = { messageId: { $in: [rawId, cleanId, withBrackets] } };

  const [records, total] = await Promise.all([
    UserDataLog.find(searchFilter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    UserDataLog.countDocuments(searchFilter),
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

/**
 * Updates User-Data Log(s) by Message ID
 */
export const updateUserDataLogsByMessageId = async (
  messageId: string,
  updateData: UpdateUserDataLogDTO
): Promise<{ matchedCount: number; modifiedCount: number; records: any[] }> => {
  if (!isValidMessageId(messageId)) {
    throw new APIError(
      ERROR_MESSAGES[ERROR_CODES.INVALID_MESSAGE_ID],
      400,
      ERROR_CODES.INVALID_MESSAGE_ID
    );
  }

  const updateFields: Record<string, any> = {};

  if (updateData.status) {
    const validStatuses = Object.values(USER_DATA_STATUSES);
    const normalizedStatus = updateData.status.toLowerCase().trim() as any;
    if (!validStatuses.includes(normalizedStatus)) {
      throw new APIError(
        `Invalid status '${updateData.status}'. Allowed statuses: ${validStatuses.join(", ")}`,
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
    updateFields.status = normalizedStatus;
  }

  if (updateData.recipient) {
    updateFields.recipient = updateData.recipient.toLowerCase().trim();
  }

  if (updateData.subject) {
    updateFields.subject = updateData.subject.trim();
  }

  if (updateData.type) {
    const validTypes = Object.values(USER_DATA_TYPES);
    const normalizedType = updateData.type.toLowerCase().trim() as any;
    if (validTypes.includes(normalizedType)) {
      updateFields.type = normalizedType;
    }
  }

  if (updateData.app) {
    updateFields.app = updateData.app.trim();
  }

  if (updateData.metadata && typeof updateData.metadata === "object") {
    // Sanitize metadata
    const cleanMeta = sanitizeMetadata(updateData.metadata);
    for (const [k, v] of Object.entries(cleanMeta)) {
      updateFields[`metadata.${k}`] = v;
    }
  }

  if (Object.keys(updateFields).length === 0) {
    throw new APIError(
      "No valid update parameters provided (provide status, metadata, recipient, subject, or app)",
      400,
      ERROR_CODES.MISSING_REQUIRED_FIELDS
    );
  }

  const rawId = messageId.trim();
  const cleanId = rawId.replace(/^<|>$/g, '');
  const withBrackets = `<${cleanId}>`;
  const searchFilter = { messageId: { $in: [rawId, cleanId, withBrackets] } };

  const result = await UserDataLog.updateMany(
    searchFilter,
    { $set: updateFields }
  );

  if (result.matchedCount === 0) {
    throw new APIError(
      `No user-data logs found with messageId: ${messageId}`,
      404,
      ERROR_CODES.NO_RECORDS_FOUND
    );
  }

  const updatedRecords = await UserDataLog.find(searchFilter)
    .sort({ createdAt: -1 })
    .lean();


  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    records: updatedRecords as any,
  };
};
