const mongoose = require("mongoose");

const crushSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "matched"], default: "pending" }
  },
  { timestamps: true }
);

crushSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

module.exports = mongoose.model("Crush", crushSchema);

