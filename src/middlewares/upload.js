const multer = require("multer");

const storage = multer.memoryStorage(); // <— IMPORTANT (gives file.buffer)

module.exports = multer({ storage });
