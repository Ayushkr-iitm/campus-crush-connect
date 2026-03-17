const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { getMessagesForMatch } = require("../controllers/messageController");

const router = express.Router();

router.get("/:matchId", auth, getMessagesForMatch);

module.exports = router;

