const mongoose = require("mongoose");

const mailSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    subject: { type: String, required: true },
    message: { type: String, required: true },

    attachments: [
      {
        url: String,        // file/image/pdf URL
        type: String,       // pdf, image, doc, etc.
        name: String,       // filename
        size: Number        // optional: size in bytes
      }
    ],

    opened: { type: Boolean, default: false },  // opened when inbox user reads it
    read: { type: Boolean, default: false },    // sender/receiver perspective
    archived: { type: Boolean, default: false },  // archived mails


  },
  { timestamps: true }
);

module.exports = mongoose.model("Mail", mailSchema);
