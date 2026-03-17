const Message = require("../models/Message");
const Match = require("../models/Match");

exports.getMessagesForMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.user._id;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: "Match not found" });
    }

    if (match.user1.toString() !== userId.toString() && match.user2.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not part of this match" });
    }

    const messages = await Message.find({ matchId }).sort({ createdAt: 1 });

    res.json({
      success: true,
      messages: messages.map((m) => ({
        id: m._id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        message: m.message,
        timestamp: m.createdAt
      }))
    });
  } catch (err) {
    next(err);
  }
};

