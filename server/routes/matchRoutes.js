const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { getMatches } = require("../controllers/matchController");

const router = express.Router();

router.get("/", auth, getMatches);

module.exports = router;

