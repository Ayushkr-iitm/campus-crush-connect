const Match = require("../models/Match");

exports.getMatches = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }]
    })
      .populate("user1", "name branch year bio profilePhoto")
      .populate("user2", "name branch year bio profilePhoto")
      .sort({ createdAt: -1 });

    const formatted = matches.map((m) => {
      const other = m.user1._id.toString() === userId.toString() ? m.user2 : m.user1;
      return {
        id: m._id,
        matchedAt: m.createdAt,
        user: {
          id: other._id,
          name: other.name,
          branch: other.branch,
          year: other.year,
          bio: other.bio,
          profilePhoto: other.profilePhoto
        }
      };
    });

    res.json({ success: true, matches: formatted });
  } catch (err) {
    next(err);
  }
};

