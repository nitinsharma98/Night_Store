import mongoose from "mongoose";

const mailSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: { type: String, required: true },
    message: { type: String, required: true },

    read: { type: Boolean, default: false },

    attachments: [
      {
        url: String,
        public_id: String, // from Cloudinary
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Mail", mailSchema);
