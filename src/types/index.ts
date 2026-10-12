export type LogLevel = 'error' | 'fatal' | 'info' | 'debug' | 'warn';

export type UserDataType = 'notification' | 'otp' | 'link' | 'custom';

export type UserDataStatus =
  | 'queued'
  | 'dispatched'
  | 'delivered'
  | 'acknowledged'
  | 'opened'
  | 'failed'
  | 'bounced';

export interface IErrorLog {
  _id?: string;
  serviceName: string;
  environment: string;
  level: 'error' | 'fatal';
  message: string;
  errorCode?: string | null;
  stackTrace?: string | null;
  correlationId?: string | null;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IInfoLog {
  _id?: string;
  serviceName: string;
  environment: string;
  level: 'info' | 'debug' | 'warn';
  eventName: string;
  message: string;
  correlationId?: string | null;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDataLog {
  _id?: string;
  messageId: string;
  sender?: string;
  recipient?: string;
  replyTo?: string;
  app: string;
  subject?: string;
  type: UserDataType;
  status: UserDataStatus;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateErrorLogDTO {
  serviceName?: string;
  environment?: string;
  level?: 'error' | 'fatal';
  message: string;
  errorCode?: string;
  stackTrace?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
  timestamp?: string | Date;
}

export interface CreateInfoLogDTO {
  serviceName?: string;
  environment?: string;
  level?: 'info' | 'debug' | 'warn';
  eventName: string;
  message: string;
  correlationId?: string;
  metadata?: Record<string, any>;
  timestamp?: string | Date;
}

export interface CreateUserDataLogDTO {
  messageId?: string;
  sender?: string;
  recipient?: string;
  to?: string;
  replyTo?: string;
  app?: string;
  appName?: string;
  subject?: string;
  type?: UserDataType;
  status?: UserDataStatus;
  metadata?: Record<string, any>;
  timestamp?: string | Date;
}

export interface UpdateUserDataLogDTO {
  status?: UserDataStatus;
  metadata?: Record<string, any>;
  recipient?: string;
  subject?: string;
  type?: UserDataType;
  app?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface UserDataLogRetrievalResult {
  records: IUserDataLog[];
  pagination: PaginationMeta;
}

export interface APIResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  error: {
    errorCode: string;
    message: string;
    details?: any;
  } | null;
}
