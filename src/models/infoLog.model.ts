import mongoose, { Document, Schema } from "mongoose";
import { IInfoLog } from "../types";
import { LOG_LEVELS } from "../constants";

export interface IInfoLogDocument extends Omit<IInfoLog, "_id">, Document {}

const infoLogSchema = new Schema<IInfoLogDocument>(
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
      enum: [LOG_LEVELS.INFO, LOG_LEVELS.DEBUG, LOG_LEVELS.WARN],
      default: LOG_LEVELS.INFO,
      index: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
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
    collection: "info_logs",
  }
);

infoLogSchema.index({ createdAt: -1 });
infoLogSchema.index({ serviceName: 1, eventName: 1, createdAt: -1 });
infoLogSchema.index({ correlationId: 1, createdAt: -1 });

export const InfoLog = mongoose.model<IInfoLogDocument>("InfoLog", infoLogSchema);
export default InfoLog;
