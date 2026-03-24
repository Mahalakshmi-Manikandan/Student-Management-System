const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const upload = require("../middleware/upload");

const {
  createAssignment,
  uploadTimetable
} = require("../controllers/staffController");

router.post("/assignment", auth, role("staff"), upload.single("file"), createAssignment);

router.post("/timetable", auth, role("staff"), uploadTimetable);

module.exports = router;