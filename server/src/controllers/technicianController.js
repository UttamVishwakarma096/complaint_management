const complaintModel = require("../models/complaint");
const userModel = require("../models/user");

async function technicianStatus(req, res) {
  try {
    const { complaintId, stage } = req.body;

    const complaint = await complaintModel.findById(complaintId);

    if (!complaint) {
      return res.status(401).json({ message: "Complaint not Exist" });
    }

    complaint.status = stage;

    await complaint.save();

    res.status(200).json({
      message: "Complaint Status Updated",
      complaint,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

const technicianGetComplaints = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const complaints = await complaintModel.find({ assignedTo: technicianId });

    res.status(200).json({ complaints });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const technicianProfile = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const profile = await userModel.findById(technicianId, {
      password: 0,
      updatedAt: 0,
    });

    res.status(200).json({ profile });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  technicianStatus,
  technicianGetComplaints,
  technicianProfile,
};
