import mongoose, { Document, Schema } from "mongoose";
import { IUserDataLog } from "../types";
import { USER_DATA_TYPES, USER_DATA_STATUSES } from "../constants";

export interface IUserDataLogDocument extends Omit<IUserDataLog, "_id">, Document {}

const userDataLogSchema = new Schema<IUserDataLogDocument>(
  {
    messageId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sender: {
      type: String,
      trim: true,
      default: "FreelyEmail",
    },
    recipient: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    replyTo: {
      type: String,
      trim: true,
    },
    app: {
      type: String,
      trim: true,
      default: "Unknown App",
      index: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        USER_DATA_TYPES.NOTIFICATION,
        USER_DATA_TYPES.OTP,
        USER_DATA_TYPES.LINK,
        USER_DATA_TYPES.CUSTOM,
      ],
      default: USER_DATA_TYPES.NOTIFICATION,
      index: true,
    },
    status: {
      type: String,
      enum: [
        USER_DATA_STATUSES.QUEUED,
        USER_DATA_STATUSES.DISPATCHED,
        USER_DATA_STATUSES.FAILED,
        USER_DATA_STATUSES.ACKNOWLEDGED,
      ],
      default: USER_DATA_STATUSES.DISPATCHED,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "user_data_logs",
  }
);

// Compound indexes for optimal lookup by messageId and chronology
userDataLogSchema.index({ messageId: 1, createdAt: 1 });
userDataLogSchema.index({ app: 1, createdAt: -1 });
userDataLogSchema.index({ recipient: 1, createdAt: -1 });

export const UserDataLog = mongoose.model<IUserDataLogDocument>("UserDataLog", userDataLogSchema);
export default UserDataLog;
