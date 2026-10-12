const express = require("express");
const router = express.Router();
const logController = require("../controllers/log.controller");
const { requireLoggingApiKey } = require("../middlewares/auth");
const { ROUTES } = require("../constants");

// Protect all log ingestion endpoints with inter-service authentication
router.post(ROUTES.LOGS.ERROR, requireLoggingApiKey, logController.postErrorLog);
router.post(ROUTES.LOGS.INFO, requireLoggingApiKey, logController.postInfoLog);
router.post(ROUTES.LOGS.USER_DATA, requireLoggingApiKey, logController.postUserDataLog);

// Protect log retrieval endpoint with authentication
router.get(ROUTES.LOGS.USER_DATA_BY_ID, requireLoggingApiKey, logController.getUserDataLogs);

module.exports = router;
