import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

// Connect MongoDB
import connectDB from "./config/db";
connectDB();

import logRoutes from "./routes/log.routes";
import { errorHandler } from "./middlewares/error";
import {
  ROUTES,
  DEFAULT_CONFIG,
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "./constants";

export const app: Application = express();

// Standard Security & CORS
app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-logging-key", "x-api-key"],
  })
);


// Rate Limiting (protecting ingestion & retrieval from DoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // high capacity for microservice telemetry
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      data: null,
      message: ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
      error: {
        errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
      },
    });
  },
});

app.use(ROUTES.LOGS.BASE, limiter);

// Parsing request body with 2mb limit for logs/stacktraces
app.use(express.json({ limit: "2mb" }));

// Mount Ingestion & Retrieval Routes
app.use(ROUTES.LOGS.BASE, logRoutes);

// Unauthenticated Health Check Endpoint
app.get(ROUTES.HEALTH, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      service: DEFAULT_CONFIG.SERVICE_NAME,
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    message: SUCCESS_MESSAGES.HEALTH,
    error: null,
  });
});

// Server Maintainer Wake-up & Health Check Routes
app.get(["/startserver", "/startServer", "/checkserver", "/checkServer"], (req: Request, res: Response) => {
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.json({
      status: "online",
      server: "Central Logging API",
      message: "Hey Developer! Central Logging Service is working fine, Go ahead!",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }
  res.send("<h1>Hey Developer! Central Logging Service is working fine, Go aHead!</h1>");
});

// Handle 404 Route Not Found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    error: {
      errorCode: ERROR_CODES.ROUTE_NOT_FOUND,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
