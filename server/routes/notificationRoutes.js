const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  getNotifications,
  createNotification
} = require("../controllers/notificationController");

router.get("/", auth, getNotifications);
router.post("/", auth, createNotification);

module.exports = router;