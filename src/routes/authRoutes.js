const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

// Register
router.post("/register", auth.register);

// Verify OTP
router.post("/verify", auth.verifyUser);

// Resend OTP
router.post("/resend-otp", auth.resendOTP);

// Login
router.post("/login", auth.login);

// Forgot password
router.post("/forgot-password", auth.forgotPassword);

// Reset password
router.post("/reset-password", auth.resetPassword);

const upload = require("../middleware/upload");
router.put("/update-profile", auth, upload.single("avatar"), updateProfile);


module.exports = router;


// delete account ,pass hash , 