const db = require("../config/db");
const xlsx = require("xlsx");
const bcrypt = require("bcryptjs");

// ✅ GET STUDENTS WITH FILTER
exports.getStudents = (req, res) => {
  const { department, course } = req.query;

  let query = "SELECT * FROM users WHERE role='student'";
  const params = [];

  if (department) {
    query += " AND department=?";
    params.push(department);
  }

  if (course) {
    query += " AND course=?";
    params.push(course);
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// ✅ GET STAFF WITH FILTER
exports.getStaff = (req, res) => {
  const { department } = req.query;

  let query = "SELECT * FROM users WHERE role='staff'";
  const params = [];

  if (department) {
    query += " AND department=?";
    params.push(department);
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// ✅ DASHBOARD (FIXED ADMIN COUNT)
exports.dashboard = (req, res) => {
  db.query("SELECT COUNT(*) AS students FROM users WHERE role='student'", (e1, s) => {
    db.query("SELECT COUNT(*) AS staff FROM users WHERE role='staff'", (e2, st) => {
      db.query("SELECT COUNT(*) AS admins FROM users WHERE role='admin'", (e3, a) => {

        res.json({
          students: s[0].students,
          staff: st[0].staff,
          admins: a[0].admins
        });

      });
    });
  });
};

// ✅ GET TIMETABLE
exports.getTimetable = (req, res) => {
  const { department, course, year } = req.query;

  db.query(
    "SELECT * FROM timetable WHERE department=? AND course=? AND year=?",
    [department, course, year],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// ✅ UPLOAD EXCEL
exports.uploadTimetable = (req, res) => {
  try {
    const { department, year } = req.body;

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const values = data.map(row => [
      department,
      course,
      year,
      row.Day,
      row.Period,
      row.Subject
    ]);

    db.query(
      "DELETE FROM timetable WHERE department=? AND course=? AND year=?",
      [department, course, year],
      (err) => {
        if (err) return res.status(500).json(err);
        db.query(
          "INSERT INTO timetable (department, course, year, day, period, subject) VALUES ?",
          [values],
          (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Uploaded" });
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ MANUAL SAVE
exports.saveTimetable = (req, res) => {
  try {
    const { department, year, timetable } = req.body;

    db.query(
      "DELETE FROM timetable WHERE department=? AND course=? AND year=?",
      [department, course, year],
      (err) => {
        if (err) return res.status(500).json(err);
        const values = timetable.map(t => [
          department,
          course,
          year,
          t.day,
          t.period,
          t.subject
        ]);
        db.query(
          "INSERT INTO timetable (department, course, year, day, period, subject) VALUES ?",
          [values],
          (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Saved" });
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET USERS BY ROLE
exports.getUsersByRole = (req, res) => {
  const role = req.query.role;

  db.query("SELECT * FROM users WHERE role = ?", [role], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// CREATE USER (ADMIN)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password, department, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, department, role],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            return res.status(400).json({ message: "Email already exists" });
          return res.status(500).json(err);
        }
        res.json({ message: "User created" });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE USER
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, department } = req.body;

  db.query(
    "UPDATE users SET name=?, email=?, department=? WHERE id=?",
    [name, email, department, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "User updated" });
    }
  );
};

// ✅ GET DISTINCT DEPARTMENTS
exports.getDepartments = (req, res) => {
  const sql = "SELECT DISTINCT department FROM users WHERE department IS NOT NULL AND department != '' ORDER BY department";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results.map(row => row.department));
  });
};

// ✅ GET DISTINCT COURSES
exports.getCourses = (req, res) => {
  const sql = "SELECT DISTINCT course FROM users WHERE course IS NOT NULL AND course != '' ORDER BY course";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results.map(row => row.course));
  });
};

// ✅ GET DISTINCT DEPARTMENTS (From Users Table)
exports.getDepartments = (req, res) => {
  const sql = "SELECT DISTINCT department FROM users WHERE department IS NOT NULL AND department != '' ORDER BY department";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results.map(row => row.department));
  });
};

// ✅ GET DISTINCT COURSES (From Users Table)
exports.getCourses = (req, res) => {
  const sql = "SELECT DISTINCT course FROM users WHERE course IS NOT NULL AND course != '' ORDER BY course";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results.map(row => row.course));
  });
};

// DELETE USER
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User deleted" });
  });
};