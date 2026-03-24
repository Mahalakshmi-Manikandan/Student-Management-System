const db = require("../config/db");
const XLSX = require("xlsx");

// exports.createAssignment = (req, res) => {
//   const { title, subject, due_date, department, year } = req.body;

//   db.query(
//     `INSERT INTO assignments 
//     (title, subject, due_date, department, year, created_by)
//     VALUES (?, ?, ?, ?, ?, ?)`,
//     [title, subject, due_date, department, year, req.user.id],
//     (err) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: "Assignment Created" });
//     }
//   );
// };

exports.createAssignment = (req, res) => {
  const { title, subject, due_date } = req.body;

  db.query(
    "INSERT INTO assignments (title,subject,due_date,file_path,created_by) VALUES (?,?,?,?,?)",
    [title, subject, due_date, req.file?.path, req.user.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Assignment uploaded with file" });
    }
  );
};

exports.uploadTimetable = (req, res) => {
  const { department, year, week } = req.body;

  db.query(
    "INSERT INTO timetables (department, year, week) VALUES (?, ?, ?)",
    [department, year, JSON.stringify(week)],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Timetable Uploaded" });
    }
  );
};

exports.uploadExcelTimetable = (req, res) => {
  const workbook = XLSX.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  db.query(
    "INSERT INTO timetables (department, year, week) VALUES (?,?,?)",
    [req.body.department, req.body.year, JSON.stringify(data)],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Excel timetable uploaded" });
    }
  );
};