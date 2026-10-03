const bcrypt = require("bcrypt");
const userModel = require("../models/user");

/**
 * Get profile of currently logged-in user (Customer, Technician, or Admin).
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId, { password: 0 });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ success: true, profile: user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update profile details for currently logged-in user.
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, specialization, experience } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();
    if (specialization !== undefined) updates.specialization = specialization;
    if (experience !== undefined) updates.experience = Number(experience);

    const user = await userModel.findByIdAndUpdate(userId, updates, {
      new: true,
      select: "-password",
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Change user password securely.
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long.",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password does not match." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
};
