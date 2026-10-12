import mongoose, { Document, Schema } from "mongoose";
import { IErrorLog } from "../types";
import { LOG_LEVELS } from "../constants";

export interface IErrorLogDocument extends Omit<IErrorLog, "_id">, Document {}

const errorLogSchema = new Schema<IErrorLogDocument>(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
      index: true,
      default: "unknown-service",
    },
    environment: {
      type: String,
      trim: true,
      default: "production",
      index: true,
    },
    level: {
      type: String,
      enum: [LOG_LEVELS.ERROR, LOG_LEVELS.FATAL],
      default: LOG_LEVELS.ERROR,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    errorCode: {
      type: String,
      trim: true,
      index: true,
    },
    stackTrace: {
      type: String,
      trim: true,
    },
    correlationId: {
      type: String,
      trim: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "error_logs",
  }
);

errorLogSchema.index({ createdAt: -1 });
errorLogSchema.index({ serviceName: 1, createdAt: -1 });
errorLogSchema.index({ correlationId: 1, createdAt: -1 });

export const ErrorLog = mongoose.model<IErrorLogDocument>("ErrorLog", errorLogSchema);
export default ErrorLog;
