require("dotenv").config();

module.exports = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  frontendVerifyUrl: process.env.FRONTEND_VERIFY_URL,
  verificationTokenExpireMinutes: parseInt(process.env.VERIFICATION_TOKEN_EXPIRE_MINUTES || "1440", 10)
};
