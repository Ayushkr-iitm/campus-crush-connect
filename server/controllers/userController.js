const { z } = require("zod");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const Crush = require("../models/Crush");
const Match = require("../models/Match");

const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
  year: z.string().min(1).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  bio: z.string().optional(),
  interests: z.array(z.string()).optional(),
  likes: z.string().optional(),
  dislikes: z.string().optional(),
  profilePhoto: z.string().optional(),
  coverPhoto: z.string().optional()
});

exports.updateProfile = async (req, res, next) => {
  try {
    const parsed = profileUpdateSchema.parse(req.body);
    const user = req.user;

    if (parsed.profilePhoto && parsed.profilePhoto.startsWith("data:")) {
      const uploadRes = await cloudinary.uploader.upload(parsed.profilePhoto, {
        folder: "campus-crush/profile"
      });
      parsed.profilePhoto = uploadRes.secure_url;
    }

    if (parsed.coverPhoto && parsed.coverPhoto.startsWith("data:")) {
      const uploadRes = await cloudinary.uploader.upload(parsed.coverPhoto, {
        folder: "campus-crush/cover"
      });
      parsed.coverPhoto = uploadRes.secure_url;
    }

    Object.assign(user, parsed);
    await user.save();

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
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: err.errors });
    }
    next(err);
  }
};

exports.discoverUsers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const gender = req.query.gender;

    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }]
    });
    const matchedIds = matches.flatMap((m) => [m.user1.toString(), m.user2.toString()]);

    // Only exclude people *you* already swiped right on (outgoing crush).
    // If someone crushed you but you haven't, they must stay in your deck so you can match.
    const outgoingCrushes = await Crush.find({ senderId: userId });
    const outgoingReceiverIds = outgoingCrushes.map((c) => c.receiverId.toString());

    const blockedIds = (req.user.blockedUsers || []).map((id) => id.toString());
    const skippedUsers = req.user.skippedUsers || [];
    const skippedIds = skippedUsers.map((id) => id.toString());

    const excluded = new Set([
      userId.toString(),
      ...matchedIds,
      ...outgoingReceiverIds,
      ...blockedIds,
      ...skippedIds
    ]);

    const query = {
      _id: { $nin: Array.from(excluded) },
      isBanned: false
    };

    if (gender && ["male", "female", "other"].includes(String(gender))) {
      query.gender = String(gender);
    }

    const users = await User.find(query).select("name branch year gender bio profilePhoto interests likes dislikes");

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

exports.skipUser = async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

    const exists = await User.exists({ _id: targetId });
    if (!exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!req.user.skippedUsers) {
      req.user.skippedUsers = [];
    }
    const already = req.user.skippedUsers.some((id) => id.toString() === targetId);
    if (!already) {
      req.user.skippedUsers.push(targetId);
      await req.user.save();
    }

    res.json({ success: true, message: "Skipped" });
  } catch (err) {
    next(err);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot block yourself" });
    }
    if (!req.user.blockedUsers.includes(targetId)) {
      req.user.blockedUsers.push(targetId);
      await req.user.save();
    }
    res.json({ success: true, message: "User blocked" });
  } catch (err) {
    next(err);
  }
};

exports.getBlockedUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("blockedUsers", "name email profilePhoto branch year");
    res.json({ success: true, blockedUsers: user.blockedUsers || [] });
  } catch (err) {
    next(err);
  }
};

exports.unblockUser = async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    req.user.blockedUsers = (req.user.blockedUsers || []).filter((id) => id.toString() !== targetId);
    await req.user.save();
    res.json({ success: true, message: "User unblocked" });
  } catch (err) {
    next(err);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    next(err);
  }
};

