const jwt = require("jsonwebtoken");

const generateToken = (employee) => {
  const payload = {
    id: employee._id.toString(), // always string
    email: employee.email || employee.phone || null,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d", // fixed 7 days
  });
};

module.exports = { generateToken };