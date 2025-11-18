const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = new User({ name, email, password });
    console.log(user);
    await user.save();
    res.json({ success: true, user });
  } catch (e) {
    res.json({ success: false, message: e });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.json({ success: false, message: "Invalid login" });

  res.json({ success: true, user });
});

// Update Theme Color
router.post("/theme", async (req, res) => {
  const { email, color } = req.body;

  const updated = await User.findOneAndUpdate(
    { email },
    { themeColor: color },
    { new: true }
  );

  res.json({ success: true, user: updated });
});

module.exports = router;
