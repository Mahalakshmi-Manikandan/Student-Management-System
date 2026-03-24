// const router = require("express").Router();

// const auth = require("../middleware/authMiddleware");
// const role = require("../middleware/roleMiddleware");

// const {
//   getAssignments,
//   getAttendance,
//   addStudyPlan
// } = require("../controllers/studentController");

// router.get("/assignments", auth, role("student"), getAssignments);
// router.get("/attendance", auth, role("student"), getAttendance);
// router.post("/planner", auth, role("student"), addStudyPlan);

// module.exports = router;


const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
getAssignments,
getAttendance,
addStudyPlan,
getPlanner
} = require("../controllers/studentController");

router.get("/assignments", auth, role("student"), getAssignments);
router.get("/attendance", auth, role("student"), getAttendance);
router.post("/planner", auth, role("student"), addStudyPlan);
router.get("/planner", auth, role("student"), getPlanner);

module.exports = router;