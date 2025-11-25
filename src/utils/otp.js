const crypto = require("crypto");
const bcrypt = require("bcrypt");

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOtp(otp) {
  return await bcrypt.hash(otp, 10);
}

async function verifyOtp(otp, hash) {
  return await bcrypt.compare(otp, hash);
}

module.exports = { generateOtp, hashOtp, verifyOtp };