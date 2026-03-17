const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { sendCrush } = require("../controllers/crushController");

const router = express.Router();

router.post("/", auth, sendCrush);

module.exports = router;

