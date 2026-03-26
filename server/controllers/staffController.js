const db = require("../config/db");
const XLSX = require("xlsx");

exports.createAssignment = (req, res) => {
  const { title, subject, due_date, department, course, year } = req.body;
  const created_by = req.user.id;

  // Basic validation
  if (!title || !subject || !due_date || !department || !year) {
    return res
      .status(400)
      .json({ message: "Missing required fields for assignment" });
  }

  // Get a connection from the pool to use for the transaction
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting DB connection:", err);
      return res.status(500).json({ message: "Database connection error" });
    }

    connection.beginTransaction(err => {
      if (err) {
        console.error("Transaction Begin Error:", err);
        connection.release();
        return res.status(500).json({ message: "Database transaction error" });
      }

      // 1. Find students
      let findStudentsSql = "SELECT id FROM users WHERE role='student' AND department = ? AND year = ?";
      const findParams = [department, year];
      if (course) {
        findStudentsSql += " AND course = ?";
        findParams.push(course);
      }

      connection.query(findStudentsSql, findParams, (err, students) => {
        if (err) {
          return connection.rollback(() => {
            console.error("Find Students Error:", err);
            connection.release();
            res.status(500).json({ message: "Error finding students" });
          });
        }

        if (students.length === 0) {
          return connection.rollback(() => {
            connection.release();
            res.status(404).json({ message: "No students found for the selected criteria." });
          });
        }

        // 2. Insert assignment
        const insertAssignmentSql = `INSERT INTO assignments (title, subject, due_date, department, course, year, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connection.query(insertAssignmentSql, [title, subject, due_date, department, course || null, year, created_by], (err, assignmentResult) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Insert Assignment Error:", err);
              connection.release();
              res.status(500).json({ message: "Error creating assignment" });
            });
          }
          
          const assignmentId = assignmentResult.insertId;

          // 3. Link students to assignment
          const studentAssignmentValues = students.map(student => [student.id, assignmentId]);
          const linkStudentsSql = `INSERT INTO student_assignments (student_id, assignment_id) VALUES ?`;

          connection.query(linkStudentsSql, [studentAssignmentValues], (err, linkResult) => {
            if (err) {
              return connection.rollback(() => {
                console.error("Link Students Error:", err);
                connection.release();
                res.status(500).json({ message: "Error assigning to students" });
              });
            }

            connection.commit(err => {
              if (err) {
                return connection.rollback(() => {
                  console.error("Commit Error:", err);
                  connection.release();
                  res.status(500).json({ message: "Failed to commit transaction" });
                });
              }
              connection.release();
              res.json({ message: "Assignment created and assigned successfully" });
            });
          });
        });
      });
    });
  });
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

exports.markAttendance = (req, res) => {
  const { attendance_date, records } = req.body;
  const staffId = req.user.id;

  if (!attendance_date || !records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: "Invalid attendance data" });
  }

  // This assumes your attendance table has a UNIQUE constraint on (student_id, date, period).
  const query = `
    INSERT INTO attendance (student_id, attendance_date, period, status, marked_by) 
    VALUES ? 
    ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)
  `;

  const values = records.map((record) => [
    record.student_id,
    attendance_date,
    record.period,
    record.status,
    staffId,
  ]);

  db.query(query, [values], (error, results) => {
    if (error) {
      console.error("Attendance Save Error:", error);
      return res.status(500).json({ message: "Failed to save attendance" });
    }
    res.json({ message: "Attendance saved successfully" });
  });
};

exports.getStudents = (req, res) => {
  const { department, course } = req.query;

  if (!department) {
    return res.status(400).json({ message: "Department is required" });
  }

  let query =
    "SELECT id, name, email, department, course, year FROM users WHERE role='student' AND department = ?";
  const params = [department];

  if (course) {
    query += " AND course LIKE ?";
    params.push(`%${course}%`);
  }

  query += " ORDER BY name";

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(result);
  });
};

exports.getStudentDepartments = (req, res) => {
  const sql = "SELECT DISTINCT department FROM users WHERE role = 'student' AND department IS NOT NULL AND department != '' ORDER BY department";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results.map(row => row.department));
  });
};

exports.getStudentCourses = (req, res) => {
  const sql = "SELECT DISTINCT course FROM users WHERE role = 'student' AND course IS NOT NULL AND course != '' ORDER BY course";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results.map(row => row.course));
  });
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