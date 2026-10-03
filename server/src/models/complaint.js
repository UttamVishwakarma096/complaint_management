const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "In Progress",
        "Resolved",
        "Closed",
        "Failed",
        "Cancelled",
      ],
      default: "Pending",
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
      submittedAt: {
        type: Date,
      },
    },

    resolutionDetails: {
      summary: {
        type: String,
        trim: true,
      },
      partsReplaced: {
        type: String,
        trim: true,
      },
      timeSpentHours: {
        type: Number,
      },
      resolvedAt: {
        type: Date,
      },
    },

    cancellationReason: {
      type: String,
      trim: true,
    },

    reopenReason: {
      type: String,
      trim: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },
  },

  { timestamps: true },
);

module.exports = mongoose.model("Complaint", complaintSchema);
