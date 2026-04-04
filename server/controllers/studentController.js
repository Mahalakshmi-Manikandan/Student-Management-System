const db = require("../config/db");

// GET student's assignments (via student_assignments join table)
exports.getAssignments = (req, res) => {
  const studentId = req.user.id;
  const sql = `
    SELECT a.id, a.title, a.subject, a.due_date, a.department, a.course, a.year,
           COALESCE(sa.completed, 0) AS completed
    FROM assignments a
    JOIN student_assignments sa ON sa.assignment_id = a.id
    WHERE sa.student_id = ?
    ORDER BY a.due_date ASC
  `;
  db.query(sql, [studentId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// PATCH – mark assignment complete or incomplete
// Requires: student_assignments table to have a `completed` TINYINT(1) DEFAULT 0 column
exports.updateAssignmentStatus = (req, res) => {
  const studentId = req.user.id;
  const assignmentId = req.params.id;
  const { completed } = req.body;

  db.query(
    "UPDATE student_assignments SET completed = ? WHERE student_id = ? AND assignment_id = ?",
    [completed ? 1 : 0, studentId, assignmentId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Status updated" });
    }
  );
};

// GET attendance for bar chart (by subject via timetable join)
exports.getAttendance = (req, res) => {
  const studentId = req.user.id;

  db.query(
    "SELECT department, course, year FROM users WHERE id = ?",
    [studentId],
    (err, userResult) => {
      if (err) return res.status(500).json(err);
      if (!userResult.length) return res.json([]);

      const { department, course, year } = userResult[0];
      if (!department || !course || !year) return res.json([]);

      // Join attendance with timetable on period + day to get subject
      const sql = `
        SELECT t.subject,
               COUNT(*) AS total,
               SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present
        FROM attendance a
        JOIN timetable t
          ON t.period = a.period
         AND t.day = UPPER(DATE_FORMAT(a.attendance_date, '%a'))
         AND t.department = ?
         AND t.course = ?
         AND t.year = ?
        WHERE a.student_id = ?
        GROUP BY t.subject
        ORDER BY t.subject
      `;

      db.query(sql, [department, course, year, studentId], (err2, result) => {
        if (err2) {
          // Fallback: simple overall count
          db.query(
            "SELECT COUNT(*) AS total, SUM(status = 'present') AS present FROM attendance WHERE student_id = ?",
            [studentId],
            (err3, simple) => {
              if (err3) return res.status(500).json(err3);
              const row = simple[0];
              const pct = row.total === 0 ? 0 : Math.round((row.present / row.total) * 100);
              res.json([{ subject: "Overall", percentage: pct, present: Number(row.present) || 0, total: Number(row.total) || 0 }]);
            }
          );
          return;
        }
        const formatted = result.map((row) => ({
          subject: row.subject,
          present: Number(row.present) || 0,
          total: Number(row.total) || 0,
          percentage: row.total === 0 ? 0 : Math.round((Number(row.present) / Number(row.total)) * 100),
        }));
        res.json(formatted);
      });
    }
  );
};

// GET timetable for current student (uses their dept/course/year from profile)
exports.getTimetable = (req, res) => {
  const studentId = req.user.id;

  db.query(
    "SELECT department, course, year FROM users WHERE id = ?",
    [studentId],
    (err, userResult) => {
      if (err) return res.status(500).json(err);
      if (!userResult.length) return res.json([]);

      const { department, course, year } = userResult[0];
      if (!department || !course || !year) return res.json([]);

      db.query(
        "SELECT * FROM timetable WHERE department = ? AND course = ? AND year = ?",
        [department, course, year],
        (err2, rows) => {
          if (err2) return res.status(500).json(err2);
          res.json(rows);
        }
      );
    }
  );
};

// GET timetable Excel file URL for the logged-in student
exports.getTimetableFile = (req, res) => {
  const studentId = req.user.id;
  db.query("SELECT department, course, year FROM users WHERE id=?", [studentId], (err, userResult) => {
    if (err || !userResult.length) return res.json({ file_path: null });
    const { department, course, year } = userResult[0];
    if (!department || !course || !year) return res.json({ file_path: null });
    db.query(
      "SELECT file_path FROM timetable_uploads WHERE department=? AND course=? AND year=? ORDER BY id DESC LIMIT 1",
      [department, course, year],
      (err2, result) => {
        if (err2) return res.status(500).json(err2);
        res.json({ file_path: result.length ? result[0].file_path : null });
      }
    );
  });
};

// POST study plan
exports.addStudyPlan = (req, res) => {
  const { goal, study_time } = req.body;

  db.query(
    "INSERT INTO study_planner (student_id, goal, study_time) VALUES (?, ?, ?)",
    [req.user.id, goal, study_time],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Study Plan Added" });
    }
  );
};

// GET study plans
exports.getPlanner = (req, res) => {
  db.query(
    "SELECT * FROM study_planner WHERE student_id = ? ORDER BY id DESC",
    [req.user.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};
