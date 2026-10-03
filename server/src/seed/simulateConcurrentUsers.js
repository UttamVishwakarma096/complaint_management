/**
 * simulateConcurrentUsers.js
 * 
 * Comprehensive multi-user concurrent simulation for FixCare Complaint Management System.
 * Simulates 7 simultaneous user personas (Customers, Technicians, Admin) interacting
 * with the system concurrently, covering 100% of the API endpoints (33 routes).
 */

const BASE_URL = process.env.API_BASE_URL || "http://localhost:4000/api";

// ---------------------------------------------------------------------------
// 1. Deferred Promise Utility for Inter-Worker Concurrency Synchronization
// ---------------------------------------------------------------------------
class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

// Global synchronization barriers between concurrent users
const barriers = {
  complaint1Created: new Deferred(),
  complaint1Assigned: new Deferred(),
  complaint1Resolved: new Deferred(),
  complaint2Created: new Deferred(),
  complaint3Created: new Deferred(),
  complaint3Assigned: new Deferred(),
  complaint3Resolved: new Deferred(),
  complaint5Created: new Deferred(),
  complaint5Assigned: new Deferred(),
  complaint5Rejected: new Deferred(),
};

// ---------------------------------------------------------------------------
// 2. Metrics & Telemetry Collector
// ---------------------------------------------------------------------------
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  endpointStats: {}, // key: "METHOD /path" -> { count, success, fail, latencies: [] }
};

function recordMetric(method, path, status, latencyMs, isSuccess, errorDetail = null) {
  metrics.totalRequests++;
  if (isSuccess) {
    metrics.successfulRequests++;
  } else {
    metrics.failedRequests++;
  }

  // Normalize dynamic paths (e.g. /api/complaints/65f... -> /api/complaints/:id)
  let normalizedPath = path
    .replace(/\/complaints\/[a-f0-9]{24}/g, "/complaints/:id")
    .replace(/\/notifications\/[a-f0-9]{24}/g, "/notifications/:id")
    .split("?")[0]; // remove query strings

  const key = `${method} ${normalizedPath}`;
  if (!metrics.endpointStats[key]) {
    metrics.endpointStats[key] = {
      method,
      path: normalizedPath,
      total: 0,
      success: 0,
      failed: 0,
      latencies: [],
    };
  }

  const stat = metrics.endpointStats[key];
  stat.total++;
  if (isSuccess) stat.success++;
  else stat.failed++;
  stat.latencies.push(latencyMs);

  if (!isSuccess) {
    console.warn(`\x1b[31m[FAILED REQUEST]\x1b[0m ${method} ${path} -> HTTP ${status} | ${errorDetail || ""}`);
  }
}

// ---------------------------------------------------------------------------
// 3. Simulated API User Client (Maintains session cookie & token)
// ---------------------------------------------------------------------------
class SimulatedUser {
  constructor(name, role) {
    this.name = name;
    this.role = role;
    this.cookie = null;
    this.token = null;
    this.userData = null;
  }

  log(message, color = "\x1b[36m") {
    const timestamp = new Date().toISOString().substring(11, 23);
    console.log(`${color}[${timestamp}][${this.role.toUpperCase()}: ${this.name}]\x1b[0m ${message}`);
  }

  setCookieFromResponse(res) {
    const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : res.headers.get("set-cookie");
    if (!setCookie) return;
    const raw = Array.isArray(setCookie) ? setCookie.join("; ") : setCookie;
    const match = raw.match(/token=([^;]+)/);
    if (match) {
      this.token = match[1];
      this.cookie = `token=${this.token}`;
    }
  }

  async request(method, path, body = null, expectedStatus = null) {
    const url = `${BASE_URL}${path}`;
    const headers = { "Content-Type": "application/json" };
    if (this.cookie) {
      headers["Cookie"] = this.cookie;
    }

    const start = performance.now();
    let res;
    let data;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      this.setCookieFromResponse(res);
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      recordMetric(method, path, 0, duration, false, err.message);
      this.log(`Network error calling ${method} ${path}: ${err.message}`, "\x1b[31m");
      throw err;
    }

    const duration = Math.round(performance.now() - start);
    let isSuccess;
    if (expectedStatus) {
      isSuccess = Array.isArray(expectedStatus) ? expectedStatus.includes(res.status) : res.status === expectedStatus;
    } else {
      isSuccess = res.status >= 200 && res.status < 300;
    }

    recordMetric(method, path, res.status, duration, isSuccess, isSuccess ? null : JSON.stringify(data));
    return { status: res.status, data, duration };
  }
}

// ---------------------------------------------------------------------------
// 4. Concurrent User Worker Definitions
// ---------------------------------------------------------------------------

/**
 * Worker 1: Customer Alice (Complete complaint journey: create -> inspect -> comment -> resolve -> feedback -> close)
 */
async function runCustomerAlice(runId) {
  const alice = new SimulatedUser("Alice", "customer");
  const email = `alice_${runId}@fixcaretest.com`;
  const password = "AlicePassword@123";

  alice.log("Starting Customer Alice workflow...");

  // 1. POST /signup
  const signupRes = await alice.request("POST", "/signup", {
    name: "Alice Johnson",
    email,
    password,
    phone: "9811122233",
  }, 201);
  alice.userData = signupRes.data.user;
  alice.log(`Signed up successfully as ID: ${alice.userData.id}`);

  // 2. PUT /user/profile
  await alice.request("PUT", "/user/profile", {
    name: "Alice J. Johnson",
    phone: "9811122244",
  }, 200);
  alice.log("Updated user profile");

  // 3. GET /user/profile
  const profRes = await alice.request("GET", "/user/profile", null, 200);
  alice.log(`Fetched current profile: ${profRes.data.profile.name}`);

  // 4. POST /complaint
  const compRes = await alice.request("POST", "/complaint", {
    title: "AC Leaking Water In Living Room",
    description: "The split AC unit is dripping water down the interior wall during operation.",
    category: "AC Repair",
    priority: "High",
  }, 200);
  const complaint1Id = compRes.data.complaintId;
  alice.log(`Filed Complaint #1 [ID: ${complaint1Id}]`);
  barriers.complaint1Created.resolve(complaint1Id);

  // 5. GET /complaints
  const listRes = await alice.request("GET", "/complaints", null, 201);
  alice.log(`Retrieved ${listRes.data.complaints.length} customer complaints`);

  // 6. GET /complaints/:id
  await alice.request("GET", `/complaints/${complaint1Id}`, null, 201);
  alice.log(`Verified Complaint #1 exists`);

  // 7. POST /complaints/:id/comments
  await alice.request("POST", `/complaints/${complaint1Id}/comments`, {
    message: "Urgent: Water is starting to seep into floorboards, please assign technician ASAP.",
  }, 201);
  alice.log("Posted urgent customer comment to timeline");

  // 8. GET /complaints/:id/timeline
  const tlRes = await alice.request("GET", `/complaints/${complaint1Id}/timeline`, null, 200);
  alice.log(`Fetched timeline (${tlRes.data.comments.length} comments recorded)`);

  // 9. Wait for technician resolution
  alice.log("Waiting for assigned technician to complete resolution...");
  await barriers.complaint1Resolved.promise;

  // 10. POST /complaints/:id/feedback
  await alice.request("POST", `/complaints/${complaint1Id}/feedback`, {
    rating: 5,
    comment: "Technician Raj arrived on time, was extremely polite, and completely fixed the leak!",
  }, 200);
  alice.log("Submitted 5-star customer feedback and review");

  // 11. GET /complaints/:id/feedback
  const fbRes = await alice.request("GET", `/complaints/${complaint1Id}/feedback`, null, 200);
  alice.log(`Verified feedback saved. Rating: ${fbRes.data.feedback.rating}/5`);

  // 12. PATCH /complaints/:id/close
  await alice.request("PATCH", `/complaints/${complaint1Id}/close`, {}, 200);
  alice.log("Closed complaint successfully");

  // 13. GET /notifications
  const notifRes = await alice.request("GET", "/notifications", null, 200);
  alice.log(`Received ${notifRes.data.notifications.length} notification(s)`);

  // 14. PATCH /notifications/:id/read
  if (notifRes.data.notifications.length > 0) {
    const notifId = notifRes.data.notifications[0]._id;
    await alice.request("PATCH", `/notifications/${notifId}/read`, {}, 200);
    alice.log(`Marked notification ${notifId} as read`);
  }

  alice.log("\x1b[32mCompleted Alice customer flow flawlessly!\x1b[0m");
  return { success: true, user: alice.name };
}

/**
 * Worker 2: Customer Bob (Cancellation, password change & re-authentication)
 */
async function runCustomerBob(runId) {
  const bob = new SimulatedUser("Bob", "customer");
  const email = `bob_${runId}@fixcaretest.com`;
  const initialPassword = "BobPassword@123";
  const newPassword = "BobNewSecurePass@999";

  bob.log("Starting Customer Bob workflow...");

  // 1. POST /signup
  const signupRes = await bob.request("POST", "/signup", {
    name: "Bob Builder",
    email,
    password: initialPassword,
    phone: "9822233344",
  }, 201);
  bob.userData = signupRes.data.user;
  bob.log(`Signed up successfully as ID: ${bob.userData.id}`);

  // 2. POST /complaint
  const compRes = await bob.request("POST", "/complaint", {
    title: "Washing Machine Vibrating Excessively",
    description: "During spin cycle, unit makes loud noise and shakes violently.",
    category: "Washing Machine Repair",
    priority: "Medium",
  }, 200);
  const complaint2Id = compRes.data.complaintId;
  bob.log(`Filed Complaint #2 [ID: ${complaint2Id}]`);
  barriers.complaint2Created.resolve(complaint2Id);

  // 3. GET /complaints/:id
  await bob.request("GET", `/complaints/${complaint2Id}`, null, 201);

  // 4. PATCH /complaints/:id/cancel
  await bob.request("PATCH", `/complaints/${complaint2Id}/cancel`, {
    reason: "Discovered transportation shipping bolts were not removed. Problem resolved.",
  }, 200);
  bob.log("Cancelled Complaint #2 with reason");

  // 5. PATCH /user/change-password
  await bob.request("PATCH", "/user/change-password", {
    currentPassword: initialPassword,
    newPassword,
  }, 200);
  bob.log("Changed user password successfully");

  // 6. POST /login (Re-authenticate with new password)
  const loginRes = await bob.request("POST", "/login", {
    email,
    password: newPassword,
  }, 200);
  bob.log(`Re-logged in with new password. User: ${loginRes.data.user.name}`);

  // 7. GET /notifications?unread=true
  await bob.request("GET", "/notifications?unread=true", null, 200);

  // 8. PATCH /notifications/read-all
  await bob.request("PATCH", "/notifications/read-all", {}, 200);
  bob.log("Marked all notifications as read");

  bob.log("\x1b[32mCompleted Bob customer flow flawlessly!\x1b[0m");
  return { success: true, user: bob.name };
}

/**
 * Worker 3: Customer Charlie (Complaint lifecycle -> Technician resolves -> Reopen complaint)
 */
async function runCustomerCharlie(runId) {
  const charlie = new SimulatedUser("Charlie", "customer");
  const email = `charlie_${runId}@fixcaretest.com`;
  const password = "CharliePass@123";

  charlie.log("Starting Customer Charlie workflow...");

  // 1. POST /signup
  await charlie.request("POST", "/signup", {
    name: "Charlie Davis",
    email,
    password,
    phone: "9833344455",
  }, 201);
  charlie.log("Signed up successfully");

  // 2. POST /complaint
  const compRes = await charlie.request("POST", "/complaint", {
    title: "Refrigerator Freezer Not Freezing Ice",
    description: "The top freezer compartment remains at room temperature while bottom fridge is cool.",
    category: "Refrigerator Repair",
    priority: "High",
  }, 200);
  const complaint3Id = compRes.data.complaintId;
  charlie.log(`Filed Complaint #3 [ID: ${complaint3Id}]`);
  barriers.complaint3Created.resolve(complaint3Id);

  // 3. Wait for Technician to resolve
  charlie.log("Waiting for complaint to be assigned and resolved by technician...");
  await barriers.complaint3Resolved.promise;

  // 4. PATCH /complaints/:id/reopen
  await charlie.request("PATCH", `/complaints/${complaint3Id}/reopen`, {
    reason: "Freezer stopped cooling again after technician left. Frost build-up recurring.",
  }, 200);
  charlie.log("Reopened resolved complaint with specific reason");

  // 5. POST /complaints/:id/comments
  await charlie.request("POST", `/complaints/${complaint3Id}/comments`, {
    message: "Reopened ticket. Please have the technician return with replacement sensor.",
  }, 201);
  charlie.log("Added comment documenting reopen details");

  // 6. GET /complaints/:id/timeline
  await charlie.request("GET", `/complaints/${complaint3Id}/timeline`, null, 200);
  charlie.log("Fetched timeline verifying reopen status change");

  charlie.log("\x1b[32mCompleted Charlie customer flow flawlessly!\x1b[0m");
  return { success: true, user: charlie.name };
}

/**
 * Worker 4: Customer Diana (Concurrent query bursts & complaint registration)
 */
async function runCustomerDiana(runId) {
  const diana = new SimulatedUser("Diana", "customer");
  const email = `diana_${runId}@fixcaretest.com`;
  const password = "DianaPass@123";

  diana.log("Starting Customer Diana workflow...");

  // 1. POST /signup
  await diana.request("POST", "/signup", {
    name: "Diana Prince",
    email,
    password,
    phone: "9844455566",
  }, 201);

  // 2. POST /complaint
  const compRes = await diana.request("POST", "/complaint", {
    title: "Microwave Sparking Inside Chamber",
    description: "Sparks visible near waveguide cover when heating beverages.",
    category: "Microwave Repair",
    priority: "High",
  }, 200);
  const complaint5Id = compRes.data.complaintId;
  diana.log(`Filed Complaint #5 [ID: ${complaint5Id}]`);
  barriers.complaint5Created.resolve(complaint5Id);

  // 3. Concurrent read bursts
  diana.log("Executing concurrent read bursts...");
  await Promise.all([
    diana.request("GET", "/complaints", null, 201),
    diana.request("GET", `/complaints/${complaint5Id}`, null, 201),
    diana.request("GET", "/user/profile", null, 200),
    diana.request("GET", "/notifications", null, 200),
  ]);
  diana.log("Burst queries succeeded concurrently");

  // Wait for complaint5 to be rejected by technician Amit
  await barriers.complaint5Rejected.promise;
  diana.log("Detected Complaint #5 was reviewed and reassigned");

  diana.log("\x1b[32mCompleted Diana customer flow flawlessly!\x1b[0m");
  return { success: true, user: diana.name };
}

/**
 * Worker 5: Admin Dave (Admin controls, user creation, dispatch, overview statistics)
 */
async function runAdminDave(runId) {
  const admin = new SimulatedUser("Dave", "admin");

  admin.log("Starting Admin workflow...");

  // 1. POST /admin/login
  await admin.request("POST", "/admin/login", {
    email: "admin@fixcare.com",
    password: "fixcareAdmin096",
  }, 200);
  admin.log("Admin logged in successfully");

  // 2. GET /admin/stats/overview
  const statsRes = await admin.request("GET", "/admin/stats/overview", null, 200);
  admin.log(`Fetched initial system overview: ${statsRes.data.data.totalComplaints} total complaints`);

  // 3. GET /admin/complaints
  const allComplaintsRes = await admin.request("GET", "/admin/complaints", null, 201);
  admin.log(`Admin retrieved all complaints (${allComplaintsRes.data.complaints.length} records)`);

  // 4. GET /admin/technicians
  const allTechsRes = await admin.request("GET", "/admin/technicians", null, 201);
  admin.log(`Admin retrieved all technicians (${allTechsRes.data.technicians.length} active/inactive)`);

  // Find IDs of Raj Kumar and Amit Sharma
  const rajTech = allTechsRes.data.technicians.find(t => t.email === "raj.kumar@fixcare.com");
  const amitTech = allTechsRes.data.technicians.find(t => t.email === "amit.sharma@fixcare.com");
  if (!rajTech || !amitTech) {
    throw new Error("Could not find seed technicians Raj and Amit");
  }

  // 5. GET /admin/customers
  const allCustRes = await admin.request("GET", "/admin/customers", null, 200);
  admin.log(`Admin retrieved all customers (${allCustRes.data.customers.length} registered)`);

  // 6. POST /admin/technician-signup
  const newTechEmail = `tech_auto_${runId}@fixcare.com`;
  const createTechRes = await admin.request("POST", "/admin/technician-signup", {
    name: "Automated Tech",
    email: newTechEmail,
    phone: "9900011223",
    password: "AutoTechPass@123",
    specialization: "Smart Home & Electrical",
    experience: 4,
  }, 201);
  admin.log(`Created new technician [ID: ${createTechRes.data.technicianId}]`);

  // 7. Assign Complaint #1 to Technician Raj
  const comp1Id = await barriers.complaint1Created.promise;
  await admin.request("PATCH", "/admin/technician-assigned", {
    complaintId: comp1Id,
    technicianId: rajTech._id,
  }, 200);
  admin.log(`Assigned Complaint #1 to Raj Kumar`);
  barriers.complaint1Assigned.resolve({ complaintId: comp1Id, techId: rajTech._id });

  // 8. Assign Complaint #3 to Technician Raj
  const comp3Id = await barriers.complaint3Created.promise;
  await admin.request("PATCH", "/admin/technician-assigned", {
    complaintId: comp3Id,
    technicianId: rajTech._id,
  }, 200);
  admin.log(`Assigned Complaint #3 to Raj Kumar`);
  barriers.complaint3Assigned.resolve({ complaintId: comp3Id, techId: rajTech._id });

  // 9. Assign Complaint #5 to Technician Amit (for rejection scenario)
  const comp5Id = await barriers.complaint5Created.promise;
  await admin.request("PATCH", "/admin/technician-assigned", {
    complaintId: comp5Id,
    technicianId: amitTech._id,
  }, 200);
  admin.log(`Assigned Complaint #5 to Amit Sharma`);
  barriers.complaint5Assigned.resolve({ complaintId: comp5Id, techId: amitTech._id });

  // 10. GET /admin/stats/overview (post-assignment stats verification)
  await admin.request("GET", "/admin/stats/overview", null, 200);
  admin.log("Verified refreshed statistics overview");

  admin.log("\x1b[32mCompleted Admin Dave flow flawlessly!\x1b[0m");
  return { success: true, user: admin.name };
}

/**
 * Worker 6: Technician Raj (Availability, queue handling, accept, timeline note, status update, resolve)
 */
async function runTechnicianRaj() {
  const raj = new SimulatedUser("Raj Kumar", "technician");

  raj.log("Starting Technician Raj workflow...");

  // 1. POST /technician/login
  await raj.request("POST", "/technician/login", {
    email: "raj.kumar@fixcare.com",
    password: "Raj@12345",
  }, 200);
  raj.log("Technician Raj logged in successfully");

  // 2. GET /technician/profile
  const profRes = await raj.request("GET", "/technician/profile", null, 200);
  raj.log(`Technician profile loaded: Specialization: ${profRes.data.profile.specialization}`);

  // 3. PATCH /technician/availability
  await raj.request("PATCH", "/technician/availability", {
    status: "active",
  }, 200);
  raj.log("Toggled availability to 'active'");

  // Wait for Complaint 1 to be assigned by Admin
  await barriers.complaint1Assigned.promise;
  const comp1Id = await barriers.complaint1Created.promise;

  // 4. GET /technician/complaints
  const queueRes = await raj.request("GET", "/technician/complaints", null, 200);
  raj.log(`Assigned complaints queue: ${queueRes.data.complaints.length} tickets`);

  // 5. PATCH /technician/complaints/:id/accept
  await raj.request("PATCH", `/technician/complaints/${comp1Id}/accept`, {}, 200);
  raj.log(`Accepted Complaint #1 -> Status is now 'In Progress'`);

  // 6. POST /complaints/:id/comments (Staff internal note)
  await raj.request("POST", `/complaints/${comp1Id}/comments`, {
    message: "Diagnosed clogged drainage pipe and faulty condenser valve. Replacement in progress.",
    isInternal: true,
  }, 201);
  raj.log("Added internal diagnostic note to Complaint #1");

  // 7. PATCH /technician/status (Direct stage update)
  await raj.request("PATCH", "/technician/status", {
    complaintId: comp1Id,
    stage: "In Progress",
  }, 200);
  raj.log("Confirmed stage via direct status update route");

  // 8. POST /technician/complaints/:id/resolve
  await raj.request("POST", `/technician/complaints/${comp1Id}/resolve`, {
    summary: "Cleared condensate blockage and replaced damaged seal.",
    partsReplaced: "Drainage Gasket Ring",
    timeSpentHours: 1.5,
  }, 200);
  raj.log(`Resolved Complaint #1 with parts & labor log`);
  barriers.complaint1Resolved.resolve();

  // Now handle Complaint 3
  await barriers.complaint3Assigned.promise;
  const comp3Id = await barriers.complaint3Created.promise;

  // Accept and resolve Complaint 3
  await raj.request("PATCH", `/technician/complaints/${comp3Id}/accept`, {}, 200);
  await raj.request("POST", `/technician/complaints/${comp3Id}/resolve`, {
    summary: "Reset evaporator defrost cycle.",
    partsReplaced: "None",
    timeSpentHours: 1.0,
  }, 200);
  raj.log(`Resolved Complaint #3 -> Ready for customer review`);
  barriers.complaint3Resolved.resolve();

  raj.log("\x1b[32mCompleted Technician Raj flow flawlessly!\x1b[0m");
  return { success: true, user: raj.name };
}

/**
 * Worker 7: Technician Amit (Availability toggle, inspection, rejection & re-queueing)
 */
async function runTechnicianAmit() {
  const amit = new SimulatedUser("Amit Sharma", "technician");

  amit.log("Starting Technician Amit workflow...");

  // 1. POST /technician/login
  await amit.request("POST", "/technician/login", {
    email: "amit.sharma@fixcare.com",
    password: "Amit@12345",
  }, 200);
  amit.log("Technician Amit logged in successfully");

  // 2. PATCH /technician/availability
  await amit.request("PATCH", "/technician/availability", {
    status: "active",
  }, 200);
  amit.log("Availability set to active");

  // Wait for Complaint 5 to be assigned
  await barriers.complaint5Assigned.promise;
  const comp5Id = await barriers.complaint5Created.promise;

  // 3. GET /technician/complaints
  await amit.request("GET", "/technician/complaints", null, 200);

  // 4. POST /complaints/:id/comments (Public communication while assigned)
  await amit.request("POST", `/complaints/${comp5Id}/comments`, {
    message: "Apologies for the delay, customer support will dispatch the local area technician shortly.",
    isInternal: false,
  }, 201);
  amit.log("Added status comment for customer on Complaint #5");

  // 5. PATCH /technician/complaints/:id/reject
  await amit.request("PATCH", `/technician/complaints/${comp5Id}/reject`, {
    reason: "Assigned territory is beyond current dispatch boundary today.",
  }, 200);
  amit.log(`Rejected Complaint #5 with reason -> Re-queued to Pending`);
  barriers.complaint5Rejected.resolve();

  amit.log("\x1b[32mCompleted Technician Amit flow flawlessly!\x1b[0m");
  return { success: true, user: amit.name };
}

// ---------------------------------------------------------------------------
// 5. High-Concurrency Burst Test
// ---------------------------------------------------------------------------
async function runConcurrencyBurstTest() {
  console.log("\n\x1b[35m=== RUNNING HIGH-CONCURRENCY PARALLEL BURST TEST (20 SIMULTANEOUS REQUESTS) ===\x1b[0m");
  
  // Create an admin client for burst querying
  const burstClient = new SimulatedUser("BurstClient", "admin");
  await burstClient.request("POST", "/admin/login", {
    email: "admin@fixcare.com",
    password: "fixcareAdmin096",
  }, 200);

  const burstPromises = [];
  const startBurst = performance.now();

  for (let i = 0; i < 20; i++) {
    const reqType = i % 4;
    if (reqType === 0) {
      burstPromises.push(burstClient.request("GET", "/admin/stats/overview", null, 200));
    } else if (reqType === 1) {
      burstPromises.push(burstClient.request("GET", "/admin/complaints", null, 201));
    } else if (reqType === 2) {
      burstPromises.push(burstClient.request("GET", "/admin/technicians", null, 201));
    } else {
      burstPromises.push(burstClient.request("GET", "/admin/customers", null, 200));
    }
  }

  const results = await Promise.all(burstPromises);
  const totalBurstDuration = Math.round(performance.now() - startBurst);
  console.log(`\x1b[32mSuccessfully dispatched and received 20 parallel requests in ${totalBurstDuration}ms!\x1b[0m`);
}

// ---------------------------------------------------------------------------
// 6. Main Orchestrator & Report Generator
// ---------------------------------------------------------------------------
async function main() {
  const overallStart = performance.now();
  const runId = Date.now().toString().slice(-6);

  console.log("\x1b[1m\x1b[34m===============================================================================");
  console.log("       FIXCARE CONCURRENT MULTI-USER SIMULATION & FULL API TEST SUITE          ");
  console.log("===============================================================================\x1b[0m");
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log(`Active Personas: 7 Concurrent Users (4 Customers, 2 Technicians, 1 Admin)`);
  console.log(`Simulation Run ID: ${runId}`);
  console.log("-------------------------------------------------------------------------------\n");

  try {
    // Launch all 7 simulated user personas in parallel
    const [alice, bob, charlie, diana, dave, raj, amit] = await Promise.all([
      runCustomerAlice(runId),
      runCustomerBob(runId),
      runCustomerCharlie(runId),
      runCustomerDiana(runId),
      runAdminDave(runId),
      runTechnicianRaj(),
      runTechnicianAmit(),
    ]);

    // Run parallel load burst
    await runConcurrencyBurstTest();

    const overallDuration = Math.round(performance.now() - overallStart);

    // Generate Final Report
    console.log("\n\x1b[1m\x1b[32m===============================================================================");
    console.log("                        CONCURRENCY SIMULATION REPORT                          ");
    console.log("===============================================================================\x1b[0m");

    console.log(`Total Elapsed Time     : ${overallDuration} ms`);
    console.log(`Total API Calls Made   : ${metrics.totalRequests}`);
    console.log(`Successful Calls (2xx) : \x1b[32m${metrics.successfulRequests}\x1b[0m`);
    console.log(`Failed Calls           : ${metrics.failedRequests === 0 ? "\x1b[32m0\x1b[0m" : `\x1b[31m${metrics.failedRequests}\x1b[0m`}`);
    console.log(`Success Rate           : \x1b[32m${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%\x1b[0m\n`);

    console.log("\x1b[1mEndpoint Coverage Matrix:\x1b[0m");
    console.log("---------------------------------------------------------------------------------------------------");
    console.log(
      "Method  ".padEnd(8) +
      "Endpoint Path".padEnd(46) +
      "Hits".padEnd(8) +
      "Success".padEnd(10) +
      "Fail".padEnd(8) +
      "Avg Latency"
    );
    console.log("---------------------------------------------------------------------------------------------------");

    const allKeys = Object.keys(metrics.endpointStats).sort();
    for (const key of allKeys) {
      const item = metrics.endpointStats[key];
      const avgLat = Math.round(item.latencies.reduce((a, b) => a + b, 0) / item.latencies.length);
      const failColor = item.failed > 0 ? "\x1b[31m" : "\x1b[32m";
      console.log(
        item.method.padEnd(8) +
        item.path.padEnd(46) +
        String(item.total).padEnd(8) +
        `\x1b[32m${String(item.success).padEnd(10)}\x1b[0m` +
        `${failColor}${String(item.failed).padEnd(8)}\x1b[0m` +
        `${avgLat} ms`
      );
    }
    console.log("---------------------------------------------------------------------------------------------------");
    console.log(`Total Distinct API Endpoints Exercised: \x1b[32m${allKeys.length}\x1b[0m / 33`);

    if (metrics.failedRequests === 0) {
      console.log("\n\x1b[1m\x1b[42m\x1b[30m ALL CONCURRENT FLOWS AND API ENDPOINTS EXECUTED WITH 100% SUCCESS! \x1b[0m\n");
    } else {
      console.log(`\n\x1b[1m\x1b[41m\x1b[37m ATTENTION: ${metrics.failedRequests} REQUEST(S) FAILED DURING TEST \x1b[0m\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error("\x1b[31mSimulation encountered an unhandled exception:\x1b[0m", error);
    process.exit(1);
  }
}

main();
