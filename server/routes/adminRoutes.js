const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload"); // multer

const {
  getStudents,
  getStaff,
  dashboard,
  uploadTimetable,
  saveTimetable,
  getTimetable,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
  getDepartments,
  getCourses
} = require("../controllers/adminController");

router.get("/students", auth, role("admin"), getStudents);
router.get("/staff", auth, role("admin"), getStaff);
router.get("/dashboard", auth, role("admin"), dashboard);
router.get("/departments", auth, role("admin"), getDepartments);
router.get("/courses", auth, role("admin"), getCourses);
router.get("/users", auth, role("admin"), getUsersByRole);
router.post("/users", auth, role("admin"), createUser);
router.put("/users/:id", auth, role("admin"), updateUser);
router.delete("/users/:id", auth, role("admin"), deleteUser);
router.get("/timetable", auth, role("admin"), getTimetable);

router.post("/upload-timetable", auth, role("admin"), upload.single("file"), uploadTimetable);
router.post("/save-timetable", auth, role("admin"), saveTimetable);

module.exports = router;