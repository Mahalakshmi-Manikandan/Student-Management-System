const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  register,
  login,
  verifyEmail,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");


// ================= AUTH ROUTES =================

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Verify Email
router.get("/verify/:token", verifyEmail);

// Refresh Access Token
router.post("/refresh-token", refreshToken);

// Logout
router.post("/logout", logout);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.post("/reset-password/:token", resetPassword);

// Get current user
router.get("/me", auth, getMe);

module.exports = router;