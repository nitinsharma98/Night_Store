const mongoose = require("mongoose");

const tempVerificationSchema = new mongoose.Schema({
  email: { type: String, index: true },
  otpHash: String,
  expiresAt: { type: Date, index: { expires: 0 } }
});

module.exports = mongoose.model("TempVerification", tempVerificationSchema);