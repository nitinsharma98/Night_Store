const Mail = require("../models/Mail");

let io;

// Set Socket.IO instance
function setMailSocket(ioInstance) {
  io = ioInstance;
}

/* ---------------------------------------------------
   SEND MAIL
--------------------------------------------------- */
async function createMail(req, res) {
  try {
    const { sender, receiver, subject, message, attachments } = req.body;

    const mail = await Mail.create({
      sender,
      receiver,
      subject,
      message,
      attachments,
    });

    // Real-time notification to receiver
    if (io) {
      io.to(receiver.toString()).emit("new_mail", {
        _id: mail._id,
        sender,
        subject,
        message,
        attachments,
        createdAt: mail.createdAt,
      });
    }

    res.json({ success: true, mail });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ---------------------------------------------------
   INBOX MAILS
--------------------------------------------------- */
async function getInbox(req, res) {
  try {
    const { userId } = req.params;

    const inbox = await Mail.find({ receiver: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "name email");

    res.json(inbox);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ---------------------------------------------------
   SENT MAILS
--------------------------------------------------- */
async function getSent(req, res) {
  try {
    const { userId } = req.params;

    const sent = await Mail.find({ sender: userId })
      .sort({ createdAt: -1 })
      .populate("receiver", "name email");

    res.json(sent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ---------------------------------------------------
   MARK MAIL AS OPENED (READ)
--------------------------------------------------- */
async function openMail(req, res) {
  try {
    const { mailId } = req.params;

    const updated = await Mail.findByIdAndUpdate(
      mailId,
      { opened: true, read: true },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ---------------------------------------------------
   ARCHIVE MAIL
--------------------------------------------------- */
async function archiveMail(req, res) {
  try {
    const { mailId } = req.params;

    const updated = await Mail.findByIdAndUpdate(
      mailId,
      { archived: true },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ---------------------------
// Export all functions at once (CommonJS)
// ---------------------------
module.exports = {
  setMailSocket,
  createMail,
  getInbox,
  getSent,
  openMail,
  archiveMail,
};
