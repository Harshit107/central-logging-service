import { Request, Response } from "express";
import * as logService from "../services/log.service";
import catchAsync from "../utils/catchAsync";
import { SUCCESS_MESSAGES } from "../constants";

/**
 * Ingest Error Log
 * POST /api/v1/logs/error
 */
export const postErrorLog = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const result = await logService.recordErrorLog(req.body);

  res.status(201).json({
    success: true,
    data: {
      id: result._id,
      serviceName: result.serviceName,
      level: result.level,
      timestamp: result.timestamp,
    },
    message: SUCCESS_MESSAGES.ERROR_LOG_SAVED,
    error: null,
  });
});

/**
 * Ingest Informational Log
 * POST /api/v1/logs/info
 */
export const postInfoLog = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const result = await logService.recordInfoLog(req.body);

  res.status(201).json({
    success: true,
    data: {
      id: result._id,
      serviceName: result.serviceName,
      eventName: result.eventName,
      timestamp: result.timestamp,
    },
    message: SUCCESS_MESSAGES.INFO_LOG_SAVED,
    error: null,
  });
});

/**
 * Ingest User-Data Log
 * POST /api/v1/logs/user-data
 */
export const postUserDataLog = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const result = await logService.recordUserDataLog(req.body);

  res.status(201).json({
    success: true,
    data: {
      id: result._id,
      messageId: result.messageId,
      app: result.app,
      type: result.type,
      status: result.status,
      timestamp: result.timestamp,
    },
    message: SUCCESS_MESSAGES.USER_DATA_LOG_SAVED,
    error: null,
  });
});

/**
 * Retrieve User-Data Logs by Message ID
 * GET /api/v1/logs/user-data/:messageId
 */
export const getUserDataLogs = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const rawMessageId = req.params.messageId;
  const messageId = Array.isArray(rawMessageId) ? rawMessageId[0] : rawMessageId;
  const { page, limit } = req.query;

  const result = await logService.getUserDataLogsByMessageId(messageId, { page, limit });

  res.status(200).json({
    success: true,
    data: {
      messageId,
      records: result.records,
      count: result.records.length,
      pagination: result.pagination,
    },
    message: SUCCESS_MESSAGES.RECORDS_RETRIEVED,
    error: null,
  });
});

/**
 * Retrieve Recent User-Data Logs
 * GET /api/v1/logs/user-data
 */
export const getRecentUserDataLogs = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 15));
  const records = await logService.getRecentUserDataLogs(limit);

  res.status(200).json({
    success: true,
    data: {
      records,
      count: records.length,
    },
    message: "Recent logs retrieved successfully",
    error: null,
  });
});

/**
 * Update User-Data Log(s) by Message ID
 * PATCH/PUT /api/v1/logs/user-data/:messageId
 */
export const updateUserDataLog = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const rawMessageId = req.params.messageId;
  const messageId = Array.isArray(rawMessageId) ? rawMessageId[0] : rawMessageId;

  const result = await logService.updateUserDataLogsByMessageId(messageId, req.body);

  res.status(200).json({
    success: true,
    data: {
      messageId,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      records: result.records,
    },
    message: SUCCESS_MESSAGES.USER_DATA_LOG_UPDATED,
    error: null,
  });
});

