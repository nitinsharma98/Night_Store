const bcrypt = require("bcrypt");
const User = require("../models/User");
const TempVerification = require("../models/TempVerification");
const { generateOtp, hashOtp, verifyOtp } = require("../utils/otp");
const { sendEmail } = require("../utils/mailer");
const { generateToken } = require("../utils/jwt");

//
// ======================================================
//                ** REGISTER WITH EMAIL **
// ======================================================
//

// STEP 1 — SEND OTP (Register Email)
exports.registerEmailStart = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ error: "Email required" });

    // Generate OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    let record = await TempVerification.findOne({ email });

    if (!record) {
      record = new TempVerification({
        email,
        otpHash,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
    } else {
      record.otpHash = otpHash;
      record.expiresAt = Date.now() + 5 * 60 * 1000;
    }

    await record.save();

    // await sendEmail(email, "Your Signup OTP", `Your OTP is ${otp}`);
    console.log(`OTP for ${email}:`, otp);

    return res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};


// STEP 2 — VERIFY OTP & CREATE USER
exports.registerEmailVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP required" });

    const record = await TempVerification.findOne({ email });

    if (!record)
      return res.status(400).json({ error: "No OTP request found" });

    if (Date.now() > record.expiresAt)
      return res.status(400).json({ error: "OTP expired" });

    const match = await verifyOtp(otp, record.otpHash);
    if (!match) return res.status(400).json({ error: "Invalid OTP" });

    // User creation
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
      await user.save();
    }

    await TempVerification.deleteOne({ email });

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      verified: true,
      user,
      token,
      message: "Email verified. Complete your profile.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};


//
// ======================================================
//                ** COMPLETE PROFILE SETUP **
// ======================================================
//

exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const { username, password, fullName, avatarUrl, gender, dob, nightMail } =
      req.body;

    const required = {
      username,
      password,
      fullName,
      gender,
      dob,
      nightMail,
    };

    for (const key in required) {
      if (!required[key])
        return res.status(400).json({ error: `${key} is required` });
    }

    if (req.user.isCompleted) {
      return res.json({
        success: false,
        message: "Profile already completed",
      });
    }

    // Username Unique
    const userNameCheck = await User.findOne({ username });
    if (userNameCheck && userNameCheck._id.toString() !== userId) {
      return res.status(400).json({ error: "Username taken" });
    }

    // NightMail Unique
    const mailCheck = await User.findOne({ nightMail });
    if (mailCheck && mailCheck._id.toString() !== userId) {
      return res.status(400).json({ error: "NightMail taken" });
    }

    const hash = await bcrypt.hash(password, 12);

    const updateData = {
      username,
      fullName,
      nightMail,
      avatarUrl: avatarUrl || req.user.avatarUrl,
      gender,
      dob,
      passwordHash: hash,
      isCompleted: true,
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    return res.json({
      success: true,
      message: "Profile completed",
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};


//
// ======================================================
//               ** LOGIN WITH PASSWORD **
// ======================================================
//

exports.loginPassword = async (req, res) => {
  try {
    const { emailOrNightMail, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrNightMail }, { nightMail: emailOrNightMail }],
    });

    if (!user) return res.status(400).json({ error: "User not found" });

    if (!user.isCompleted)
      return res.json({ setupRequired: true, message: "Complete profile first" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });

    return res.json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};


//
// ======================================================
//                ** LOGIN WITH OTP **
// ======================================================
//

// STEP 1 — Send OTP for Login
exports.loginOtpStart = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "No account with this email" });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    let record = await TempVerification.findOne({ email });

    if (!record) {
      record = new TempVerification({
        email,
        otpHash,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
    } else {
      record.otpHash = otpHash;
      record.expiresAt = Date.now() + 5 * 60 * 1000;
    }

    await record.save();

    console.log(`Login OTP for ${email}:`, otp);

    return res.json({
      success: true,
      message: "OTP sent",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};


// STEP 2 — Verify OTP Login
exports.loginOtpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await TempVerification.findOne({ email });

    if (!record) return res.status(400).json({ error: "No OTP request" });
    if (Date.now() > record.expiresAt)
      return res.status(400).json({ error: "OTP expired" });

    const match = await verifyOtp(otp, record.otpHash);
    if (!match) return res.status(400).json({ error: "Invalid OTP" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    await TempVerification.deleteOne({ email });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });

    return res.json({
      success: true,
      user,
      token,
      message: "Login successful",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};


//
// ======================================================
//                ** FORGOT PASSWORD **
// ======================================================
//

// STEP 1 — Send OTP
exports.forgotPasswordStart = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "User not found" });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    let record = await TempVerification.findOne({ email });

    if (!record) {
      record = new TempVerification({
        email,
        otpHash,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
    } else {
      record.otpHash = otpHash;
      record.expiresAt = Date.now() + 5 * 60 * 1000;
    }

    await record.save();
    console.log(`Forgot Password OTP for ${email}:`, otp);

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};


// STEP 2 — Verify OTP & Reset Password
exports.forgotPasswordVerify = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await TempVerification.findOne({ email });

    if (!record) return res.status(400).json({ error: "No OTP request" });
    if (Date.now() > record.expiresAt)
      return res.status(400).json({ error: "OTP expired" });

    const match = await verifyOtp(otp, record.otpHash);
    if (!match) return res.status(400).json({ error: "Invalid OTP" });

    const hash = await bcrypt.hash(newPassword, 12);

    await User.findOneAndUpdate({ email }, { passwordHash: hash });

    await TempVerification.deleteOne({ email });

    return res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};


//
// ======================================================
//           ** CHANGE PASSWORD (OLD PASSWORD) **
// ======================================================
//

exports.changePassword = async (req, res) => {
  try {
    const user = req.user;

    const { oldPassword, newPassword } = req.body;

    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Wrong old password" });

    const hash = await bcrypt.hash(newPassword, 12);

    user.passwordHash = hash;
    await user.save();

    return res.json({
      success: true,
      message: "Password updated",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};


//
// ======================================================
//                   ** UPDATE PROFILE **
// ======================================================
//

exports.updateProfile = async (req, res) => {
  try {
    if (!req.user.isCompleted)
      return res.status(400).json({ error: "Complete profile first" });

    const update = req.body;

    // Prevent username / nightMail change
    delete update.username;
    delete update.nightMail;

    const updated = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
    });

    return res.json({ success: true, user: updated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};






































// const bcrypt = require("bcrypt");
// const User = require("../models/User");
// const TempVerification = require("../models/tempVerification");
// const { generateOtp, hashOtp, verifyOtp } = require("../utils/otp");
// const { sendEmail } = require("../utils/mailer");
// const { generateToken } = require("../utils/jwt");

// //
// // ----------------- REGISTRATION -----------------
// //

// // 📧 Email Step 1 → Send OTP
// exports.registerEmailStart = async (req, res) =>{
//     try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ error: "Email required" });

//     const otp = generateOtp();
//     const otpHash = await hashOtp(otp);

//     let record = await TempVerification.findOne({ email });
//     if (!record) {
//       record = new TempVerification({
//         email,
//         otpHash,
//         expiresAt: Date.now() + 5 * 60 * 1000,
//       });
//     } else {
//       record.otpHash = otpHash;
//       record.expiresAt = Date.now() + 5 * 60 * 1000;
//     }
//     await record.save();

//     // await sendEmail(email, "Your Signup OTP", `Your OTP is ${otp}. It will expire in 5 minutes.`);
//     console.log(`OTP for email ${email}: ${otp}`);
//     res.json({ success: true, message: "OTP sent" });
//   } catch (err) {
//     console.error("registerEmailStart error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// }



// // 📧 Email Step 2 → Verify OTP + Create Employee
// exports.registerEmailVerify = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

//     const record = await TempVerification.findOne({ email });
//     if (!record) return res.status(400).json({ error: "No OTP request found" });
//     if (Date.now() > record.expiresAt) return res.status(400).json({ error: "OTP expired" });

//     const match = await verifyOtp(otp, record.otpHash);
//     if (!match) return res.status(400).json({ error: "Invalid OTP" });

//     let user = await User.findOne({ email });
//     if (!user) {
//       user = new User({ email });
//       await user.save();
//     } else {
//       // await user.save();
//       res.json({
//       success: false,
//       message: "Email already used",
//     });
//     }

//     await TempVerification.deleteOne({ email });

//     user.lastLogin = Date.now();
//     await user.save();

//     const token = generateToken(user);

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.json({
//       success: true,
//       verified: true,
//       token,
//       user,
//       message: "Email verified successfully. You can now complete your profile.",
//     });
//   } catch (err) {
//     console.error("registerEmailVerify error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };




// // -------------------- COMPLETE PROFILE --------------------
// exports.completeProfileSetup = async (req, res) => {
//   try {
//     const userId = req.user._id.toString();

//     const {
//       username,
//       password,
//       fullName,
//       avatarUrl,
//       gender,
//       dob,
//       nightMail,
//     } = req.body;

//     // -------- REQUIRED FIELDS ----------
//     const required = { username, password, fullName, gender, dob, nightMail };
//     for (const key in required) {
//       if (!required[key]) {
//         return res.status(400).json({ error: `${key} is required` });
//       }
//     }

//     // -------- CHECK IF PROFILE ALREADY COMPLETED ----------
//     if (req.user.isCompleted) {
//       return res.status(200).json({
//         message: "Profile already completed. Cannot update again.",
//       });
//     }

//     // -------- CHECK USERNAME UNIQUE ----------
//     const existingUsername = await User.findOne({ username });
//     if (existingUsername && existingUsername._id.toString() !== userId) {
//       return res.status(400).json({ error: "Username already taken" });
//     }

//     // -------- CHECK NIGHTMAIL UNIQUE ----------
//     const existingNightMail = await User.findOne({ nightMail });
//     if (existingNightMail && existingNightMail._id.toString() !== userId) {
//       return res.status(400).json({ error: "NightMail already taken" });
//     }

//     // -------- HASH PASSWORD ----------
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // -------- PREPARE UPDATE DATA ----------
//     const updateData = {
//       username,
//       nightMail,
//       passwordHash: hashedPassword,

//       avatarUrl: avatarUrl || req.user.avatarUrl,
//       gender,
//       dob,

//       isCompleted: true,
//     };

//     // -------- UPDATE USER ----------
//     const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Profile completed successfully",
//       user: updatedUser,
//     });

//   } catch (err) {
//     console.error("completeProfileSetup error:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };

