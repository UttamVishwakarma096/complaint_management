const complaintModel = require("../models/complaint");
const { createNotification } = require("../utils/notificationHelper");

/**
 * Customer cancels their complaint before it enters "In Progress".
 */
const cancelComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const complaint = await complaintModel.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (userRole !== "admin" && complaint.customer.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to cancel this complaint.",
      });
    }

    if (["In Progress", "Resolved", "Closed", "Cancelled"].includes(complaint.status)) {
      return res.status(400).json({
        message: `Cannot cancel complaint that is already in '${complaint.status}' status.`,
      });
    }

    complaint.status = "Cancelled";
    complaint.cancellationReason = reason || "Cancelled by customer";
    await complaint.save();

    if (complaint.assignedTo) {
      await createNotification({
        recipient: complaint.assignedTo,
        sender: userId,
        complaint: complaint._id,
        title: "Complaint Cancelled",
        message: `Complaint "${complaint.title}" has been cancelled.`,
        type: "status_update",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint cancelled successfully.",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Customer reopens a resolved or closed complaint.
 */
const reopenComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const complaint = await complaintModel.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (userRole !== "admin" && complaint.customer.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to reopen this complaint.",
      });
    }

    if (!["Resolved", "Closed"].includes(complaint.status)) {
      return res.status(400).json({
        message: "Only Resolved or Closed complaints can be reopened.",
      });
    }

    complaint.status = "Pending";
    complaint.reopenReason = reason || "Reopened by customer";
    await complaint.save();

    if (complaint.assignedTo) {
      await createNotification({
        recipient: complaint.assignedTo,
        sender: userId,
        complaint: complaint._id,
        title: "Complaint Reopened",
        message: `Complaint "${complaint.title}" has been reopened: "${complaint.reopenReason}".`,
        type: "status_update",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint reopened successfully.",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Customer or Admin marks a resolved complaint as closed.
 */
const closeComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const complaint = await complaintModel.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (userRole !== "admin" && complaint.customer.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to close this complaint.",
      });
    }

    if (complaint.status !== "Resolved") {
      return res.status(400).json({
        message: "Only Resolved complaints can be closed.",
      });
    }

    complaint.status = "Closed";
    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint closed successfully.",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  cancelComplaint,
  reopenComplaint,
  closeComplaint,
};
