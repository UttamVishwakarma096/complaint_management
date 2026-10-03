const userModel = require("../models/user");
const bcrypt = require("bcrypt");

const createTechnician = async (req, res) => {
  try {
    const { name, email, phone, password, specialization, experience } =
      req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const technician = await userModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "technician",
      specialization,
      experience,
    });

    res.status(201).json({
      message: "Technician created successfully",
      technicianId: technician._id,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = { createTechnician };
