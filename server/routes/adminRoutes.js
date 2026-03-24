const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getStudents,
  getStaff,
  dashboard,
  uploadTimetable,
  saveTimetable
} = require("../controllers/adminController");

router.get("/students", auth, role("admin"), getStudents);
router.get("/staff", auth, role("admin"), getStaff);
router.get("/dashboard", auth, role("admin"), dashboard);
router.post("/upload-timetable", auth, role("admin"), uploadTimetable);
router.post("/save-timetable", auth, role("admin"), saveTimetable);

module.exports = router;