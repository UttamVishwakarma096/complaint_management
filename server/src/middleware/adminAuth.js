const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only.Not Admin",
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Server error", error: err.message });
  }
};

module.exports = adminAuth;
