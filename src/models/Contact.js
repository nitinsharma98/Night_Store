const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // whose contacts list?
    },

    name: { type: String, required: true },
    phone: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
