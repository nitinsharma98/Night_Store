import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: ["info", "alert", "message", "system"],
      default: "info",
    },

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
