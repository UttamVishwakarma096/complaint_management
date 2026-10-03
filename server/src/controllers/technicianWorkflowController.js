const complaintModel = require("../models/complaint");
const userModel = require("../models/user");
const { createNotification } = require("../utils/notificationHelper");

/**
 * Technician accepts an assigned complaint.
 */
const acceptComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.user.id;

    const complaint = await complaintModel.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    if (!complaint.assignedTo || complaint.assignedTo.toString() !== technicianId) {
      return res.status(403).json({
        message: "You are not assigned to this complaint.",
      });
    }

    complaint.status = "In Progress";
    await complaint.save();

    await createNotification({
      recipient: complaint.customer,
      sender: technicianId,
      complaint: complaint._id,
      title: "Work In Progress",
      message: `Technician has accepted your complaint "${complaint.title}" and started working on it.`,
      type: "status_update",
    });

    res.status(200).json({
      success: true,
      message: "Complaint accepted and status set to 'In Progress'.",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Technician rejects an assigned complaint with a reason.
 */
const rejectComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const technicianId = req.user.id;

    const complaint = await complaintModel.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    if (!complaint.assignedTo || complaint.assignedTo.toString() !== technicianId) {
      return res.status(403).json({
        message: "You are not assigned to this complaint.",
      });
    }

    complaint.status = "Pending";
    complaint.assignedTo = null;
    complaint.rejectionReason = reason || "Declined by technician";
    await complaint.save();

    await createNotification({
      recipient: complaint.customer,
      sender: technicianId,
      complaint: complaint._id,
      title: "Complaint Reassigned",
      message: `Your complaint "${complaint.title}" is queued for reassignment.`,
      type: "status_update",
    });

    res.status(200).json({
      success: true,
      message: "Complaint rejected and returned to pending queue.",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Technician marks a complaint as Resolved with resolution details.
 */
const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { summary, partsReplaced, timeSpentHours } = req.body;
    const technicianId = req.user.id;

    const complaint = await complaintModel.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    if (!complaint.assignedTo || complaint.assignedTo.toString() !== technicianId) {
      return res.status(403).json({
        message: "You are not assigned to this complaint.",
      });
    }

    complaint.status = "Resolved";
    complaint.resolutionDetails = {
      summary: summary ? summary.trim() : "Resolved by technician",
      partsReplaced: partsReplaced ? partsReplaced.trim() : "",
      timeSpentHours: timeSpentHours ? Number(timeSpentHours) : undefined,
      resolvedAt: new Date(),
    };

    await complaint.save();

    await createNotification({
      recipient: complaint.customer,
      sender: technicianId,
      complaint: complaint._id,
      title: "Complaint Resolved",
      message: `Your complaint "${complaint.title}" has been marked as Resolved. Please review and provide feedback.`,
      type: "status_update",
    });

    res.status(200).json({
      success: true,
      message: "Complaint resolved successfully.",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Technician toggles availability status ("active" vs "inactive").
 */
const updateAvailability = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either 'active' or 'inactive'.",
      });
    }

    const technician = await userModel.findByIdAndUpdate(
      technicianId,
      { status },
      { new: true, select: "-password" }
    );

    res.status(200).json({
      success: true,
      message: `Availability updated to '${status}'.`,
      technician,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  acceptComplaint,
  rejectComplaint,
  resolveComplaint,
  updateAvailability,
};
