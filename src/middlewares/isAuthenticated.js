const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Check cookie
    if (req.cookies?.token) {
      token = req.cookies.token.trim();
    }

    // 2️⃣ Check Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1].trim();
    }

    // 3️⃣ If no token → block
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Fetch user
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // 6️⃣ Store user in reques
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};