import mongoose from "mongoose";

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

export default mongoose.model("Contact", contactSchema);
