const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const upload = require("../middleware/upload");

const {
  createAssignment,
  uploadTimetable,
  markAttendance,
  getStudents,
  getStudentDepartments,
  getStudentCourses,
  getAssignments,
  getTimetable,
  getTimetableFile,
} = require("../controllers/staffController");

router.post("/assignment", auth, role("staff"), createAssignment);

router.post("/timetable", auth, role("staff"), uploadTimetable);

router.post("/attendance", auth, role("staff"), markAttendance);

router.get("/students", auth, role("staff"), getStudents);

router.get("/departments", auth, role("staff"), getStudentDepartments);

router.get("/courses", auth, role("staff"), getStudentCourses);

router.get("/assignments", auth, role("staff"), getAssignments);
router.get("/timetable", auth, role("staff"), getTimetable);
router.get("/timetable-file", auth, role("staff"), getTimetableFile);

module.exports = router;