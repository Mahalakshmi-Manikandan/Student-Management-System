// const db = require("../config/db");

// exports.getAssignments = (req, res) => {
//   db.query("SELECT * FROM assignments", (err, result) => {
//     if (err) return res.status(500).json(err);
//     res.json(result);
//   });
// };

// exports.getAttendance = (req, res) => {
//   db.query(
//     "SELECT * FROM attendance WHERE student_id=?",
//     [req.user.id],
//     (err, result) => {
//       if (err) return res.status(500).json(err);
//       res.json(result);
//     }
//   );
// };

// exports.addStudyPlan = (req, res) => {
//   const { goal, study_time } = req.body;

//   db.query(
//     "INSERT INTO study_planner (student_id, goal, study_time) VALUES (?, ?, ?)",
//     [req.user.id, goal, study_time],
//     (err) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: "Study Plan Added" });
//     }
//   );
// };
// exports.getAttendance = (req, res) => {
//   db.query(
//     "SELECT * FROM attendance WHERE student_id=?",
//     [req.user.id],
//     (err, result) => {
//       const updated = result.map((row) => ({
//         ...row,
//         percentage:
//           row.total_classes === 0
//             ? 0
//             : ((row.attended_classes / row.total_classes) * 100).toFixed(2)
//       }));

//       res.json(updated);
//     }
//   );
// };



const db = require("../config/db");

exports.getAssignments = (req, res) => {

db.query(
"SELECT * FROM assignments",
(err,result)=>{
if(err) return res.status(500).json(err);
res.json(result);
});

};


exports.getAttendance = (req, res) => {

db.query(
"SELECT * FROM attendance WHERE student_id=?",
[req.user.id],
(err,result)=>{

const updated = result.map(row=>({

...row,

percentage:
row.total_classes === 0
? 0
: ((row.attended_classes / row.total_classes) * 100).toFixed(2)

}));

res.json(updated);

});

};


exports.addStudyPlan = (req, res) => {

const {goal,study_time} = req.body;

db.query(
"INSERT INTO study_planner (student_id,goal,study_time) VALUES (?,?,?)",
[req.user.id,goal,study_time],
(err)=>{
if(err) return res.status(500).json(err);
res.json({message:"Study Plan Added"});
});

};


exports.getPlanner = (req,res)=>{

db.query(
"SELECT * FROM study_planner WHERE student_id=?",
[req.user.id],
(err,result)=>{
if(err) return res.status(500).json(err);
res.json(result);
});

};