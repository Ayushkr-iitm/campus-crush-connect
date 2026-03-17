const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { updateProfile, discoverUsers, blockUser, getBlockedUsers, unblockUser, deleteMe } = require("../controllers/userController");
const { createReport } = require("../controllers/reportController");

const router = express.Router();

router.put("/me", auth, updateProfile);
router.delete("/me", auth, deleteMe);
router.get("/discover", auth, discoverUsers);
router.post("/report", auth, createReport);
router.post("/block/:userId", auth, blockUser);
router.get("/blocked", auth, getBlockedUsers);
router.post("/unblock/:userId", auth, unblockUser);

module.exports = router;

