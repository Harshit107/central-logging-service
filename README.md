# Central Logging Service

A centralized, standalone logging microservice designed for the FreelyEmail ecosystem and distributed microservices.

## 🚀 Architecture Overview

This service is dedicated exclusively to receiving, validating, indexing, and retrieving three categories of logs across namespaced MongoDB collections:

1. **Schema A (`error_logs`)**: Application crashes, exceptions, error codes, stack traces, and correlation IDs.
2. **Schema B (`info_logs`)**: Lifecycle events, operational metrics, audits, and structured key-value metadata.
3. **Schema C (`user_data_logs`)**: User-related transaction data (emails, notifications, OTPs, verification links) indexed by **Message ID**.

---

## 🔒 Inter-Service Authentication

All ingestion and query endpoints are protected by shared-key authentication:
- **Header:** `x-logging-key: <LOGGING_SERVICE_API_KEY>`
- Unauthorized requests return HTTP `401 Unauthorized` or `403 Forbidden`.

---

## 📡 API Endpoints

### Base URL: `/api/v1`

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------:|
| `GET` | `/health` | Service health status & uptime | No |
| `POST` | `/logs/error` | Ingest structured application error | Yes (`x-logging-key`) |
| `POST` | `/logs/info` | Ingest operational event/info log | Yes (`x-logging-key`) |
| `POST` | `/logs/user-data` | Ingest user-data log with Message ID guarantee | Yes (`x-logging-key`) |
| `GET` | `/logs/user-data/:messageId` | Retrieve all matching logs by Message ID | Yes (`x-logging-key`) |

---

## 💻 Local Setup & Execution

1. **Install dependencies:**
   ```bash
   cd central-logging-service
   npm install
   ```

2. **Configure environment:**
   Create `.env` using `.env.example`:
   ```bash
   PORT=5001
   MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/freelyEmail
   LOGGING_SERVICE_API_KEY=your-secure-logging-key
   ```

3. **Start the service:**
   ```bash
   # Development (with auto-reload):
   npm run dev

   # Production:
   npm start
   ```
