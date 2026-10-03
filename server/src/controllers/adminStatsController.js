const complaintModel = require("../models/complaint");
const userModel = require("../models/user");

/**
 * Returns comprehensive aggregate stats for the Admin Dashboard.
 */
const getAdminOverviewStats = async (req, res) => {
  try {
    const [
      totalComplaints,
      complaintsByStatus,
      complaintsByPriority,
      complaintsByCategory,
      totalCustomers,
      totalTechnicians,
      activeTechnicians,
    ] = await Promise.all([
      complaintModel.countDocuments(),
      complaintModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      complaintModel.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      complaintModel.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
      userModel.countDocuments({ role: "customer" }),
      userModel.countDocuments({ role: "technician" }),
      userModel.countDocuments({ role: "technician", status: "active" }),
    ]);

    // Format status map
    const statusCounts = {
      pending: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      failed: 0,
      cancelled: 0,
    };

    complaintsByStatus.forEach((item) => {
      const key = item._id ? item._id.replace(/\s+/g, "") : "unknown";
      const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
      if (statusCounts[normalizedKey] !== undefined) {
        statusCounts[normalizedKey] = item.count;
      }
    });

    // Average customer satisfaction rating
    const ratingAggregate = await complaintModel.aggregate([
      { $match: { "feedback.rating": { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: "$feedback.rating" }, count: { $sum: 1 } } },
    ]);

    const averageRating =
      ratingAggregate.length > 0
        ? Number(ratingAggregate[0].avgRating.toFixed(2))
        : 0;
    const totalRatedComplaints =
      ratingAggregate.length > 0 ? ratingAggregate[0].count : 0;

    res.status(200).json({
      success: true,
      data: {
        totalComplaints,
        statusCounts,
        priorityCounts: complaintsByPriority.map((p) => ({
          priority: p._id,
          count: p.count,
        })),
        categoryCounts: complaintsByCategory.map((c) => ({
          category: c._id,
          count: c.count,
        })),
        users: {
          totalCustomers,
          totalTechnicians,
          activeTechnicians,
        },
        ratings: {
          averageRating,
          totalRatedComplaints,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin statistics",
      error: error.message,
    });
  }
};

module.exports = { getAdminOverviewStats };
