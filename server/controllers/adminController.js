const db = require("../config/db");

exports.getStudents = (req, res) => {
  db.query("SELECT * FROM users WHERE role='student'", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.getStaff = (req, res) => {
  db.query("SELECT * FROM users WHERE role='staff'", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};
exports.dashboard = (req, res) => {
  db.query("SELECT COUNT(*) AS totalStudents FROM users WHERE role='student'",
    (err, students) => {

      db.query("SELECT COUNT(*) AS totalStaff FROM users WHERE role='staff'",
        (err2, staff) => {

          db.query("SELECT COUNT(*) AS totalAssignments FROM assignments",
            (err3, assignments) => {

              res.json({
                students: students[0].totalStudents,
                staff: staff[0].totalStaff,
                assignments: assignments[0].totalAssignments
              });
            });
        });
    });
};

exports.uploadTimetable = async (req, res) => {
  try {
    const { department, year } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read Excel file from buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(sheet);

    /*
      Expected Excel Format:
      Day | Period | Subject
      MON | 0      | ANN
    */

    const values = data.map(row => [
      department,
      year,
      row.Day,
      row.Period,
      row.Subject
    ]);

    // Optional: Clear old timetable for same dept/year
    await db.query(
      "DELETE FROM timetable WHERE department=? AND year=?",
      [department, year]
    );

    // Insert new timetable
    const query = `
      INSERT INTO timetable (department, year, day, period, subject)
      VALUES ?
    `;

    await db.query(query, [values]);

    res.json({ message: "Timetable uploaded successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

exports.saveTimetable = async (req, res) => {
  try {
    const { department, year, timetable } = req.body;

    if (!department || !year) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Delete old timetable
    await db.query(
      "DELETE FROM timetable WHERE department=? AND year=?",
      [department, year]
    );

    const values = timetable.map(t => [
      department,
      year,
      t.day,
      t.period,
      t.subject
    ]);

    const query = `
      INSERT INTO timetable (department, year, day, period, subject)
      VALUES ?
    `;

    await db.query(query, [values]);

    res.json({ message: "Timetable saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving timetable" });
  }
};