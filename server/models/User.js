const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    branch: { type: String, required: true },
    year: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    bio: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    interests: { type: [String], default: [] },
    likes: { type: String, default: "" },
    dislikes: { type: String, default: "" },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    skippedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
    isEmailVerified: { type: Boolean, default: false },
    emailOtpHash: { type: String, default: "" },
    emailOtpExpiresAt: { type: Date, default: null },
    isBanned: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("User", userSchema);

