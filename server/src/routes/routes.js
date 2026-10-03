const express = require("express");

// Middleware
const userAuth = require("../middleware/userAuth");
const technicianAuth = require("../middleware/technicianAuth");
const adminAuth = require("../middleware/adminAuth");

// Controllers
const { signup, login } = require("../controllers/login");
const {
  complaintAssign,
  technicianAssigned,
  getComplaintById,
  getComplaints,
  adminGetComplaints,
  adminGetTechnicians,
  adminGetCustomers,
} = require("../controllers/complaintController");
const { createTechnician } = require("../controllers/createTechnician");
const {
  technicianStatus,
  technicianGetComplaints,
  technicianProfile,
} = require("../controllers/technicianController");
const { getAdminOverviewStats } = require("../controllers/adminStatsController");
const {
  submitFeedback,
  getComplaintFeedback,
} = require("../controllers/complaintFeedbackController");
const {
  cancelComplaint,
  reopenComplaint,
  closeComplaint,
} = require("../controllers/complaintLifecycleController");
const {
  acceptComplaint,
  rejectComplaint,
  resolveComplaint,
  updateAvailability,
} = require("../controllers/technicianWorkflowController");
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
} = require("../controllers/userProfileController");
const {
  addComment,
  getTimeline,
} = require("../controllers/complaintTimelineController");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

// ==========================================
// 1. Authentication & Common Profile Routes
// ==========================================
router.post("/signup", signup);
router.post("/login", login);
router.post("/technician/login", login);
router.post("/admin/login", login);

router.get("/user/profile", userAuth, getUserProfile);
router.put("/user/profile", userAuth, updateUserProfile);
router.patch("/user/change-password", userAuth, changePassword);

// ==========================================
// 2. Complaint Core, Lifecycle & Feedback Routes
// ==========================================
router.post("/complaint", userAuth, complaintAssign);
router.get("/complaints", userAuth, getComplaints);
router.get("/complaints/:id", userAuth, getComplaintById);

// Lifecycle transitions
router.patch("/complaints/:id/cancel", userAuth, cancelComplaint);
router.patch("/complaints/:id/reopen", userAuth, reopenComplaint);
router.patch("/complaints/:id/close", userAuth, closeComplaint);

// Feedback & Ratings
router.post("/complaints/:id/feedback", userAuth, submitFeedback);
router.get("/complaints/:id/feedback", userAuth, getComplaintFeedback);

// Comments & Timeline
router.post("/complaints/:id/comments", userAuth, addComment);
router.get("/complaints/:id/timeline", userAuth, getTimeline);

// ==========================================
// 3. Technician Workflow Routes
// ==========================================
router.get("/technician/complaints", technicianAuth, technicianGetComplaints);
router.get("/technician/profile", technicianAuth, technicianProfile);
router.patch("/technician/status", technicianAuth, technicianStatus);
router.patch("/technician/availability", technicianAuth, updateAvailability);
router.patch("/technician/complaints/:id/accept", technicianAuth, acceptComplaint);
router.patch("/technician/complaints/:id/reject", technicianAuth, rejectComplaint);
router.post("/technician/complaints/:id/resolve", technicianAuth, resolveComplaint);

// ==========================================
// 4. Admin Management & Analytics Routes
// ==========================================
router.get("/admin/stats/overview", adminAuth, getAdminOverviewStats);
router.get("/admin/complaints", adminAuth, adminGetComplaints);
router.get("/admin/technicians", adminAuth, adminGetTechnicians);
router.get("/admin/customers", adminAuth, adminGetCustomers);
router.post("/admin/technician-signup", adminAuth, createTechnician);
router.patch("/admin/technician-assigned", adminAuth, technicianAssigned);

// ==========================================
// 5. Notification Routes
// ==========================================
router.get("/notifications", userAuth, getNotifications);
router.patch("/notifications/read-all", userAuth, markAllAsRead);
router.patch("/notifications/:id/read", userAuth, markAsRead);

module.exports = router;
