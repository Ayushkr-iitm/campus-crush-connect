const { z } = require("zod");
const Report = require("../models/Report");

const reportSchema = z.object({
  reportedUserId: z.string().min(1),
  reason: z.string().min(5)
});

exports.createReport = async (req, res, next) => {
  try {
    const { reportedUserId, reason } = reportSchema.parse(req.body);

    if (reportedUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot report yourself" });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUserId,
      reason
    });

    res.status(201).json({ success: true, report });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: err.errors });
    }
    next(err);
  }
};

