const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

module.exports.sendEmail = async (to, subject, message) => {
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text: message,
  });
};


module.exports = { sendEmail };