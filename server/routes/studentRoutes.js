const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getAssignments,
  updateAssignmentStatus,
  getAttendance,
  getTimetable,
  getTimetableFile,
  addStudyPlan,
  getPlanner,
} = require("../controllers/studentController");

router.get("/assignments", auth, role("student"), getAssignments);
router.patch("/assignments/:id/status", auth, role("student"), updateAssignmentStatus);
router.get("/attendance", auth, role("student"), getAttendance);
router.get("/timetable", auth, role("student"), getTimetable);
router.get("/timetable-file", auth, role("student"), getTimetableFile);
router.post("/planner", auth, role("student"), addStudyPlan);
router.get("/planner", auth, role("student"), getPlanner);

module.exports = router;
