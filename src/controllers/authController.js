const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const uploadImageToCloudinary = require("../utils/cloudinaryUpload");


// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ============================================================
   REGISTER
============================================================ */
exports.register = async (req, res) => {
  try {
    const { email, username, gender, dob, nightMail, password } = req.body;

    let existing = await User.findOne({ email });

    if (existing && existing.verified === false) {
      return res.status(400).json({
        message: "User already registered but not verified.",
        action: "verify_or_resend_otp",
      });
    }

    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const otp = generateOTP();

    const newUser = new User({
      email,
      username,
      gender,
      dob,
      nightMail,
      passwordHash: password,   // <-- PLAIN TEXT
      verificationToken: otp,
      verificationTokenExpires: Date.now() + 30 * 60 * 1000, // 30 mins
    });

    await newUser.save();

    await sendEmail(email, "Verify Your Account", `Your OTP is ${otp}`);

    res.json({ message: "Registration successful. Verify your email." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   VERIFY OTP + AUTO LOGIN
============================================================ */
exports.verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      verificationToken: otp,
      verificationTokenExpires: { $gte: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    // ---- Generate JWT after verification ----
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Email verified successfully.",
      autoLogin: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   RESEND OTP
============================================================ */
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.verified)
      return res.status(400).json({ message: "User already verified" });

    const otp = generateOTP();

    user.verificationToken = otp;
    user.verificationTokenExpires = Date.now() + 30 * 60 * 1000;

    await user.save();

    await sendEmail(email, "Your New OTP Code", `Your OTP is ${otp}`);

    res.json({ message: "OTP resent successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   LOGIN (plain password check)
============================================================ */
exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.verified)
      return res.status(403).json({
        message: "User not verified.",
        action: "verify_or_resend_otp",
      });

    // Plain password check
    if (password !== user.passwordHash)
      return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   FORGOT PASSWORD (send OTP)
============================================================ */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();

    user.verificationToken = otp;
    user.verificationTokenExpires = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save();

    await sendEmail(email, "Reset Password OTP", `Your OTP is ${otp}`);

    res.json({ message: "OTP sent for password reset" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   RESET PASSWORD (plain text)
============================================================ */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      verificationToken: otp,
      verificationTokenExpires: { $gte: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // Save password as plain text
    user.passwordHash = newPassword;

    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// =============================
// UPDATE PROFILE
// =============================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const { username, gender, dob, nightMail } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🟦 Update text fields
    if (username) user.username = username;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    if (nightMail) user.nightMail = nightMail;

    // 🟧 If avatar image sent → upload to Cloudinary
    if (req.file) {
      const imageBuffer = req.file.buffer;
      const uploadedUrl = await uploadImageToCloudinary(imageBuffer, "avatars");

      user.avatarUrl = uploadedUrl;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        gender: user.gender,
        nightMail: user.nightMail,
        dob: user.dob,
        avatarUrl: user.avatarUrl,
      },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
