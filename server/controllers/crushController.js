const { z } = require("zod");
const Crush = require("../models/Crush");
const Match = require("../models/Match");

const crushSchema = z.object({
  receiverId: z.string().min(1)
});

exports.sendCrush = async (req, res, next) => {
  try {
    const { receiverId } = crushSchema.parse(req.body);
    const senderId = req.user._id;

    if (receiverId === senderId.toString()) {
      return res.status(400).json({ success: false, message: "Cannot crush on yourself" });
    }

    let crush = await Crush.findOne({ senderId, receiverId });
    if (!crush) {
      crush = await Crush.create({ senderId, receiverId, status: "pending" });
    }

    const reverseCrush = await Crush.findOne({ senderId: receiverId, receiverId: senderId });

    let matched = false;
    let matchDoc = null;

    if (reverseCrush) {
      await Crush.updateMany(
        {
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]
        },
        { status: "matched" }
      );

      const [id1, id2] = [senderId.toString(), receiverId.toString()].sort();
      matchDoc = await Match.findOneAndUpdate(
        { user1: id1, user2: id2 },
        { user1: id1, user2: id2 },
        { upsert: true, new: true }
      );
      matched = true;
    }

    res.status(201).json({
      success: true,
      crush,
      ...(matched && { matched: true, match: matchDoc })
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: err.errors });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Crush already exists" });
    }
    next(err);
  }
};

