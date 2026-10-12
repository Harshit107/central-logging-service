import express, { Router } from "express";
import * as logController from "../controllers/log.controller";
import { requireLoggingApiKey } from "../middlewares/auth";
import { ROUTES } from "../constants";

const router: Router = express.Router();

// Protect all log ingestion endpoints with inter-service authentication
router.post(ROUTES.LOGS.ERROR, requireLoggingApiKey, logController.postErrorLog);
router.post(ROUTES.LOGS.INFO, requireLoggingApiKey, logController.postInfoLog);
router.post(ROUTES.LOGS.USER_DATA, requireLoggingApiKey, logController.postUserDataLog);

// Protect log retrieval endpoints with authentication
router.get(ROUTES.LOGS.USER_DATA, requireLoggingApiKey, logController.getRecentUserDataLogs);
router.get(ROUTES.LOGS.USER_DATA_BY_ID, requireLoggingApiKey, logController.getUserDataLogs);

// Protect log update endpoints with authentication
router.patch(ROUTES.LOGS.USER_DATA_BY_ID, requireLoggingApiKey, logController.updateUserDataLog);
router.put(ROUTES.LOGS.USER_DATA_BY_ID, requireLoggingApiKey, logController.updateUserDataLog);

export default router;
