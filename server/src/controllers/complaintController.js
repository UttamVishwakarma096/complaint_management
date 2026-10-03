const complaintModel = require("../models/complaint");
const userModel = require("../models/user");

const complaintAssign = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const customerId = req.user.id;

    const complaint = await complaintModel.create({
      title,
      description,
      category,
      priority,
      customer: customerId,
    });

    res.status(200).json({
      message: "Complaint Registered",
      complaintId: complaint._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const technicianAssigned = async (req, res) => {
  try {
    const { complaintId, technicianId } = req.body;

    const complaint = await complaintModel.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    const technician = await userModel.findById(technicianId);

    if (!technician || technician.role !== "technician") {
      return res.status(404).json({
        message: "Technician not found",
      });
    }

    complaint.assignedTo = technician._id;
    complaint.status = "Assigned";

    await complaint.save();

    res.status(200).json({
      message: "Technician assigned successfully",
      complaint,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getComplaints = async (req, res) => {
  try {
    const customerId = req.user.id;

    const complaints = await complaintModel.find({ customer: customerId });

    res.status(201).json({
      message: "Complaints fetched Successfully",
      complaints,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaintId = req.params.id;

    const complaint = await complaintModel.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        message: "complaint not exist",
      });
    }

    res.status(201).json({ complaint });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const adminGetComplaints = async (req, res) => {
  try {
    const complaints = await complaintModel
      .find()
      .populate("customer", "name email")
      .populate("assignedTo", "name email specialization")
      .sort({ createdAt: -1 });

    res.status(201).json({
      message: "Complaints fetched Successfully",
      complaints,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const adminGetTechnicians = async (req, res) => {
  try {
    const technicians = await userModel
      .find(
        { role: "technician" },
        {
          name: 1,
          email: 1,
          phone: 1,
          specialization: 1,
          experience: 1,
          status: 1,
        },
      )
      .sort({ createdAt: -1 });

    res.status(201).json({
      message: "All technicians fetched Successfully",
      technicians,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const adminGetCustomers = async (req, res) => {
  try {
    const customers = await userModel
      .find(
        { role: "customer" },
        { name: 1, email: 1, phone: 1, status: 1, createdAt: 1 },
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ customers });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  complaintAssign,
  technicianAssigned,
  getComplaintById,
  getComplaints,
  adminGetComplaints,
  adminGetTechnicians,
  adminGetCustomers,
};
