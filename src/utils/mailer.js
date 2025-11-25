const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // or use custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} text - email plain text body
 */
async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    // console.log("Email sent to:", to);
  } catch (err) {
    console.error("Email send error:", err);
    throw err;
  }
}

module.exports = { sendEmail };