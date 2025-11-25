const express = require("express");
const router = express.Router();

const {
  createMail,
  getInbox,
  getSent,
  openMail,
  archiveMail
} = require("../controllers/mailController");


// JWT middleware
const  isAuthenticated  = require("../middlewares/isAuthenticated");

// Send mail
router.post("/send", isAuthenticated, createMail);

// Inbox
router.get("/inbox/:userId", isAuthenticated, getInbox);

// Sent mails
router.get("/sent/:userId", isAuthenticated, getSent);

// Mark a mail as opened (read)
router.put("/open/:mailId", isAuthenticated, openMail);

// Archive mail
router.put("/archive/:mailId", isAuthenticated, archiveMail);

module.exports = router;
