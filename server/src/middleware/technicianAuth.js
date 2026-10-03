const jwt = require("jsonwebtoken");

const technicianAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "technician") {
      return res.status(403).json({
        message: "Access denied. Technician only.",
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Server error", error: err.message });
  }
};

module.exports = technicianAuth;
