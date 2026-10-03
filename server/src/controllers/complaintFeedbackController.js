const complaintModel = require("../models/complaint");
const { createNotification } = require("../utils/notificationHelper");

/**
 * Submit customer feedback and rating for a resolved or closed complaint.
 */
const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating is required and must be an integer between 1 and 5.",
      });
    }

    const complaint = await complaintModel.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Only the customer who raised it (or admin) can submit feedback
    if (userRole !== "admin" && complaint.customer.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to submit feedback for this complaint.",
      });
    }

    if (!["Resolved", "Closed"].includes(complaint.status)) {
      return res.status(400).json({
        message: "Feedback can only be submitted for Resolved or Closed complaints.",
      });
    }

    complaint.feedback = {
      rating: Number(rating),
      comment: comment ? comment.trim() : "",
      submittedAt: new Date(),
    };

    await complaint.save();

    // Notify assigned technician if present
    if (complaint.assignedTo) {
      await createNotification({
        recipient: complaint.assignedTo,
        sender: userId,
        complaint: complaint._id,
        title: "Feedback Received",
        message: `Customer rated your service ${rating}/5 for complaint: "${complaint.title}".`,
        type: "feedback",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully.",
      feedback: complaint.feedback,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Fetch feedback for a complaint.
 */
const getComplaintFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await complaintModel
      .findById(id)
      .select("title status feedback customer assignedTo")
      .populate("customer", "name email")
      .populate("assignedTo", "name email specialization");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!complaint.feedback || !complaint.feedback.rating) {
      return res.status(404).json({ message: "No feedback submitted yet." });
    }

    res.status(200).json({
      success: true,
      complaintId: complaint._id,
      title: complaint.title,
      feedback: complaint.feedback,
      technician: complaint.assignedTo,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getComplaintFeedback,
};
