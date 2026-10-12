import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "http://localhost:5001";
const API_KEY = process.env.LOGGING_SERVICE_API_KEY || "50b65cea-691b-406e-9d28-0718b86abe98";

async function request(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data: any = await response.json().catch(() => null);
  return { status: response.status, data };
}

async function runTests() {
  console.log("=== CENTRAL LOGGING SERVICE (TYPESCRIPT) TEST SUITE ===");

  // 1. Health check
  console.log("\n[1] Testing GET /api/v1/health (unauthenticated)...");
  const health = await request("/api/v1/health");
  console.log(`Status: ${health.status}`, health.data?.message);
  if (health.status !== 200 || !health.data?.success) {
    throw new Error("Health check failed!");
  }

  // 2. Auth check (rejection without key)
  console.log("\n[2] Testing Authentication rejection (missing x-logging-key)...");
  const unauth = await request("/api/v1/logs/error", {
    method: "POST",
    body: { message: "Test error" },
  });
  console.log(`Status: ${unauth.status}`, unauth.data?.error?.message);
  if (unauth.status !== 401) {
    throw new Error(`Expected 401 Unauthorized, got ${unauth.status}`);
  }

  // 3. Post Error Log
  console.log("\n[3] Testing POST /api/v1/logs/error with valid x-logging-key...");
  const errorLog = await request("/api/v1/logs/error", {
    method: "POST",
    headers: { "x-logging-key": API_KEY },
    body: {
      serviceName: "FreelyEmail-API",
      environment: "production",
      level: "error",
      message: "TypeScript test: SMTP connection timeout",
      errorCode: "SMTP_TIMEOUT",
      stackTrace: "Error: connect ETIMEDOUT\n  at TCPConnectWrap.afterConnect",
      correlationId: "corr_ts_001",
      metadata: { port: 587, host: "smtp-relay.brevo.com" },
    },
  });
  console.log(`Status: ${errorLog.status}`, errorLog.data?.message, "ID:", errorLog.data?.data?.id);
  if (errorLog.status !== 201) throw new Error("Failed to post error log");

  // 4. Post Info Log
  console.log("\n[4] Testing POST /api/v1/logs/info with valid x-logging-key...");
  const infoLog = await request("/api/v1/logs/info", {
    method: "POST",
    headers: { "x-logging-key": API_KEY },
    body: {
      serviceName: "FreelyEmail-API",
      environment: "production",
      level: "info",
      eventName: "TRANSACTIONAL_EMAIL_SENT",
      message: "Email dispatched via Brevo REST API",
      correlationId: "corr_ts_001",
      metadata: { template: "otpVerification", app: "MobileApp" },
    },
  });
  console.log(`Status: ${infoLog.status}`, infoLog.data?.message, "ID:", infoLog.data?.data?.id);
  if (infoLog.status !== 201) throw new Error("Failed to post info log");

  // 5. Post User-Data Log with custom Message ID
  const testMessageId = `msg_ts_${Date.now()}`;
  console.log(`\n[5] Testing POST /api/v1/logs/user-data with custom Message ID (${testMessageId})...`);
  const userData1 = await request("/api/v1/logs/user-data", {
    method: "POST",
    headers: { "x-logging-key": API_KEY },
    body: {
      messageId: testMessageId,
      sender: "auth@freelyemail.com",
      recipient: "dev@example.com",
      app: "MobileApp",
      subject: "Security Verification Code",
      type: "otp",
      status: "dispatched",
      metadata: { codeHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
    },
  });
  console.log(`Status: ${userData1.status}`, userData1.data?.message, "Message ID:", userData1.data?.data?.messageId);
  if (userData1.data?.data?.messageId !== testMessageId) {
    throw new Error("Message ID was not preserved!");
  }

  // 6. Post second record with SAME Message ID (audit trail / status update)
  console.log(`\n[6] Testing second record with SAME Message ID (audit trail update)...`);
  const userData2 = await request("/api/v1/logs/user-data", {
    method: "POST",
    headers: { "x-logging-key": API_KEY },
    body: {
      messageId: testMessageId,
      sender: "auth@freelyemail.com",
      recipient: "dev@example.com",
      app: "MobileApp",
      subject: "Security Verification Code",
      type: "otp",
      status: "acknowledged",
      metadata: { userAgent: "Mozilla/5.0", ip: "192.168.1.1" },
    },
  });
  console.log(`Status: ${userData2.status}`, userData2.data?.message);

  // 7. Post User-Data Log WITHOUT Message ID (auto-generation test)
  console.log("\n[7] Testing POST /api/v1/logs/user-data WITHOUT Message ID (auto-generation)...");
  const userDataAuto = await request("/api/v1/logs/user-data", {
    method: "POST",
    headers: { "x-logging-key": API_KEY },
    body: {
      sender: "notifications@freelyemail.com",
      recipient: "tester@example.com",
      app: "WebPortal",
      subject: "Welcome to FreelyEmail!",
      type: "notification",
    },
  });
  console.log(`Status: ${userDataAuto.status}`, "Generated Message ID:", userDataAuto.data?.data?.messageId);
  if (!userDataAuto.data?.data?.messageId?.startsWith("msg_")) {
    throw new Error("Collision-resistant Message ID was not generated!");
  }

  // 8. Retrieve by Message ID
  console.log(`\n[8] Testing GET /api/v1/logs/user-data/${testMessageId}...`);
  const retrieval = await request(`/api/v1/logs/user-data/${testMessageId}`, {
    headers: { "x-logging-key": API_KEY },
  });
  console.log(`Status: ${retrieval.status}`, `Retrieved ${retrieval.data?.data?.count} record(s)`);
  if (retrieval.data?.data?.count !== 2) {
    throw new Error(`Expected 2 matching records, found ${retrieval.data?.data?.count}`);
  }

  console.log("\n=== ALL CENTRAL LOGGING SERVICE (TYPESCRIPT) TESTS PASSED! ===");
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
