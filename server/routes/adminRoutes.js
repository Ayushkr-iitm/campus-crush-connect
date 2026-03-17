const express = require("express");
const { auth, requireAdmin } = require("../middleware/authMiddleware");
const { getReports, resolveReport, banUser, deleteProfile } = require("../controllers/adminController");

const router = express.Router();

router.use(auth, requireAdmin);

router.get("/reports", getReports);
router.post("/reports/:reportId/resolve", resolveReport);
router.post("/users/:userId/ban", banUser);
router.delete("/users/:userId", deleteProfile);

module.exports = router;

