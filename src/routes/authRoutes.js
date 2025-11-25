const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");

const authController = require("../controllers/authController");

router.post("/register/email/start", authController.registerEmailStart);
router.post("/register/email/verify", authController.registerEmailVerify);
router.post("/profile/setup" , isAuthenticated , authController.completeProfile);

// ---------------- LOGIN (PASSWORD) -------------------- //
router.post("/login/password", authController.loginPassword);

// ---------------- LOGIN (OTP) ------------------------- //
router.post("/login/otp/start", authController.loginOtpStart);
router.post("/login/otp/verify", authController.loginOtpVerify);

// ---------------- FORGOT PASSWORD --------------------- //
router.post("/forgot/start", authController.forgotPasswordStart);
router.post("/forgot/verify", authController.forgotPasswordVerify);

// ---------------- CHANGE PASSWORD --------------------- //
router.post("/change-password", isAuthenticated, authController.changePassword);

// ---------------- UPDATE PROFILE ---------------------- //
router.post("/update-profile", isAuthenticated, authController.updateProfile);

module.exports =  router;
