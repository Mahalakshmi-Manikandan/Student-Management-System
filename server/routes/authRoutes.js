const router = require("express").Router();

const {
  register,
  login,
  verifyEmail,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
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


module.exports = router;