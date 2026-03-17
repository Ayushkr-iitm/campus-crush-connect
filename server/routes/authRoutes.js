const express = require("express");
const { register, login, getMe, verifyOtp, resendOtp, changePassword } = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/change-password", auth, changePassword);
router.get("/me", auth, getMe);

module.exports = router;

