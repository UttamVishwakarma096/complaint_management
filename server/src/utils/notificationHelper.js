const Notification = require("../models/notification");

/**
 * Safely creates a notification in the database without disrupting the main request flow.
 * @param {Object} options
 * @param {string|ObjectId} options.recipient
 * @param {string|ObjectId} [options.sender]
 * @param {string|ObjectId} [options.complaint]
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} [options.type]
 */
const createNotification = async ({
  recipient,
  sender = null,
  complaint = null,
  title,
  message,
  type = "general",
}) => {
  try {
    if (!recipient) return;
    await Notification.create({
      recipient,
      sender,
      complaint,
      title,
      message,
      type,
    });
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};

module.exports = { createNotification };
