const {cluster1} = require("../../databases/atlas");
const mongoose = require("mongoose");

const tempVerificationSchema = new mongoose.Schema({
  phone: { type: String, index: true },
  otpHash: String,
  expiresAt: { type: Date, index: { expires: 0 } }
});

const TempVerification = cluster1.model("TempVerification", tempVerificationSchema);

module.exports = TempVerification;