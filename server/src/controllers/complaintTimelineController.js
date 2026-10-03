const Comment = require("../models/comment");
const complaintModel = require("../models/complaint");
const { createNotification } = require("../utils/notificationHelper");

/**
 * Add a comment or message to a complaint.
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isInternal } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message content is required." });
    }

    const complaint = await complaintModel.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    // Authorization check
    const isCustomer = complaint.customer.toString() === userId;
    const isAssignedTech =
      complaint.assignedTo && complaint.assignedTo.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isCustomer && !isAssignedTech && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to comment on this complaint.",
      });
    }

    // Only staff can post internal notes
    const internalFlag = Boolean(isInternal) && (isAdmin || userRole === "technician");

    const comment = await Comment.create({
      complaint: complaint._id,
      author: userId,
      message: message.trim(),
      isInternal: internalFlag,
    });

    const populatedComment = await comment.populate("author", "name email role");

    // Notifications (only if not an internal note)
    if (!internalFlag) {
      if (isCustomer && complaint.assignedTo) {
        await createNotification({
          recipient: complaint.assignedTo,
          sender: userId,
          complaint: complaint._id,
          title: "New Customer Comment",
          message: `Customer added a comment on "${complaint.title}".`,
          type: "comment",
        });
      } else if (!isCustomer) {
        await createNotification({
          recipient: complaint.customer,
          sender: userId,
          complaint: complaint._id,
          title: "Update on Your Complaint",
          message: `Staff added a comment on "${complaint.title}".`,
          type: "comment",
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get comments / timeline for a complaint.
 */
const getTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const complaint = await complaintModel.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    const isCustomer = complaint.customer.toString() === userId;
    const isAssignedTech =
      complaint.assignedTo && complaint.assignedTo.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isCustomer && !isAssignedTech && !isAdmin) {
      return res.status(403).json({
        message: "You are not authorized to view this timeline.",
      });
    }

    // If customer, hide internal notes
    const filter = { complaint: id };
    if (userRole === "customer") {
      filter.isInternal = false;
    }

    const comments = await Comment.find(filter)
      .populate("author", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      complaintId: id,
      comments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addComment,
  getTimeline,
};
