const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const { sendOtpEmail } = require("../utils/mailer");
const cloudinary = require("../config/cloudinary");

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  branch: z.string().min(1),
  year: z.string().min(1),
  gender: z.enum(["male", "female", "other"]),
  bio: z.string().optional(),
  interests: z.array(z.string()).optional(),
  likes: z.string().optional(),
  dislikes: z.string().optional(),
  profilePhoto: z.string().optional(),
  coverPhoto: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const RGIPT_DOMAIN = "@rgipt.ac.in";

const sendOtpWithFallback = async (email, otp) => {
  try {
    await sendOtpEmail(email, otp);
    return { delivered: true, message: "OTP sent to your email. Verify to activate your account." };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("OTP email send failed:", err.message);
    const allowFallback = process.env.ALLOW_OTP_RESPONSE_FALLBACK === "true";
    if (allowFallback) {
      return {
        delivered: false,
        otp,
        message: "Email delivery failed. Use the OTP shown on screen, then configure SMTP provider."
      };
    }
    throw new Error("Unable to send OTP right now. Please try again in a minute.");
  }
};

exports.register = async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const { email, password } = parsed;

    if (!email.endsWith(RGIPT_DOMAIN)) {
      return res.status(400).json({ success: false, message: "Only RGIPT email addresses are allowed." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      // If user didn't complete OTP verification, allow "register again" by replacing their unverified signup.
      if (existing.isEmailVerified) {
        return res.status(400).json({ success: false, message: "Email already registered" });
      }

      // Update the existing unverified user with latest fields, reset OTP and expiry, and resend.
      const salt = await bcrypt.genSalt(10);
      existing.password = await bcrypt.hash(password, salt);
      existing.name = parsed.name;
      existing.branch = parsed.branch;
      existing.year = parsed.year;
      existing.gender = parsed.gender;
      existing.bio = parsed.bio || "";
      existing.interests = parsed.interests || [];
      existing.likes = parsed.likes || "";
      existing.dislikes = parsed.dislikes || "";

      if (parsed.profilePhoto && parsed.profilePhoto.startsWith("data:")) {
        const uploadRes = await cloudinary.uploader.upload(parsed.profilePhoto, {
          folder: "campus-crush/profile"
        });
        existing.profilePhoto = uploadRes.secure_url;
      }
      if (parsed.coverPhoto && parsed.coverPhoto.startsWith("data:")) {
        const uploadRes = await cloudinary.uploader.upload(parsed.coverPhoto, {
          folder: "campus-crush/cover"
        });
        existing.coverPhoto = uploadRes.secure_url;
      }

      const otp = String(crypto.randomInt(100000, 999999));
      existing.emailOtpHash = crypto.createHash("sha256").update(otp).digest("hex");
      existing.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await existing.save();

      const otpResult = await sendOtpWithFallback(email, otp);
      return res.status(201).json({
        success: true,
        needsVerification: true,
        message: otpResult.delivered ? "OTP resent to your email. Verify to activate your account." : otpResult.message,
        email: existing.email,
        ...(otpResult.otp ? { otp: otpResult.otp, otpDeliveryFailed: true } : {})
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const userPayload = {
      ...parsed,
      password: hashed
    };

    // If frontend sent base64 images during registration, upload them to Cloudinary first
    if (userPayload.profilePhoto && userPayload.profilePhoto.startsWith("data:")) {
      const uploadRes = await cloudinary.uploader.upload(userPayload.profilePhoto, {
        folder: "campus-crush/profile"
      });
      userPayload.profilePhoto = uploadRes.secure_url;
    }

    if (userPayload.coverPhoto && userPayload.coverPhoto.startsWith("data:")) {
      const uploadRes = await cloudinary.uploader.upload(userPayload.coverPhoto, {
        folder: "campus-crush/cover"
      });
      userPayload.coverPhoto = uploadRes.secure_url;
    }

    const otp = String(crypto.randomInt(100000, 999999));
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.create({
      ...userPayload,
      isEmailVerified: false,
      emailOtpHash: otpHash,
      emailOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    const otpResult = await sendOtpWithFallback(email, otp);

    res.status(201).json({
      success: true,
      needsVerification: true,
      message: otpResult.message,
      email: user.email,
      ...(otpResult.otp ? { otp: otpResult.otp, otpDeliveryFailed: true } : {})
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: err.errors });
    }
    if (err.message === "Unable to send OTP right now. Please try again in a minute.") {
      return res.status(502).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      otp: z.string().regex(/^\d{6}$/)
    });
    const { email, otp } = schema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isEmailVerified) {
      const token = generateToken(user._id);
      return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
    }
    if (!user.emailOtpExpiresAt || user.emailOtpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new OTP." });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (otpHash !== user.emailOtpHash) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.isEmailVerified = true;
    user.emailOtpHash = "";
    user.emailOtpExpiresAt = null;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        gender: user.gender,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        coverPhoto: user.coverPhoto,
        interests: user.interests,
        likes: user.likes,
        dislikes: user.dislikes
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: err.errors });
    }
    next(err);
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email() });
    const { email } = schema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: "Email already verified" });

    const otp = String(crypto.randomInt(100000, 999999));
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    user.emailOtpHash = otpHash;
    user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const otpResult = await sendOtpWithFallback(email, otp);
    res.json({
      success: true,
      message: otpResult.delivered ? "OTP resent" : otpResult.message,
      ...(otpResult.otp ? { otp: otpResult.otp, otpDeliveryFailed: true } : {})
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: err.errors });
    }
    if (err.message === "Unable to send OTP right now. Please try again in a minute.") {
      return res.status(502).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const { email, password } = parsed;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: "Account is banned" });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({ success: false, message: "Email not verified. Please verify OTP first." });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        gender: user.gender,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        coverPhoto: user.coverPhoto,
        interests: user.interests,
        likes: user.likes,
        dislikes: user.dislikes
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: err.errors });
    }
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const schema = z.object({
      currentPassword: z.string().min(6),
      newPassword: z.string().min(6)
    });
    const { currentPassword, newPassword } = schema.parse(req.body);

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: err.errors });
    }
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        gender: user.gender,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        coverPhoto: user.coverPhoto,
        interests: user.interests,
        likes: user.likes,
        dislikes: user.dislikes
      }
    });
  } catch (err) {
    next(err);
  }
};

