const { User, Timetable } = require("../models");
const db = require("../config/db"); // Keep for custom dashboard queries
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
  
  Timetable.getByFilter(department, course, year, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// ✅ UPLOAD EXCEL
exports.uploadTimetable = (req, res) => {
  try {
    const { department, course, year } = req.body;

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const values = [];
    data.forEach(row => {
      const day = row.Day;
      if (!day) return;
      for (let i = 1; i <= 8; i++) {
        const subject = row[`P${i}`];
        if (subject && subject.trim() !== "") {
          values.push([department, course, year, day, i, subject]);
        }
      }
    });

    Timetable.deleteByFilter(department, course, year, (err) => {
      if (err) {
        console.error("Error deleting existing timetable:", err);
        return res.status(500).json({ message: "Database error during timetable deletion. Ensure 'course' column exists in 'timetable' table.", error: err.sqlMessage || err.message });
      }
      if (values.length > 0) {
        Timetable.bulkCreate(values, (err) => {
          if (err) {
            console.error("Error during bulkCreate for timetable:", err);
            return res.status(500).json({ message: "Database error during timetable upload. Ensure 'course' column exists in 'timetable' table.", error: err.sqlMessage || err.message });
          }
          res.json({ message: "Uploaded Successfully" });
        });
      } else {
        res.json({ message: "No data found in Excel" });
      }
    }); // Closing parenthesis for the Timetable.deleteByFilter callback and call
  } catch (err) {
    console.error("Server error during timetable upload:", err);
    res.status(500).json({ message: "Server error during timetable upload.", error: err.message });
  }
};

//  MANUAL SAVE
exports.saveTimetable = (req, res) => {
  try {
    const { department, course, year, timetable } = req.body;

    Timetable.deleteByFilter(department, course, year, (err) => {
      if (err) {
        console.error("Error deleting existing timetable:", err);
        return res.status(500).json({ message: "Database error during timetable deletion. Ensure 'course' column exists in 'timetable' table.", error: err.sqlMessage || err.message });
      }
      const values = timetable.map(t => [
        department,
        course,
        year,
        t.day,
        t.period,
        t.subject
      ]);

      if (values.length > 0) {
        Timetable.bulkCreate(values, (err) => {
          if (err) {
            console.error("Error during bulkCreate for timetable:", err);
            return res.status(500).json({ message: "Database error during timetable save. Ensure 'course' column exists in 'timetable' table.", error: err.sqlMessage || err.message });
          }
          res.json({ message: "Saved Successfully" });
        });
      } else {
        res.status(400).json({ message: "Timetable is empty" });
      }
    });
  } catch (err) {
    console.error("Server error during timetable save:", err);
    res.status(500).json({ message: "Server error during timetable save.", error: err.message });
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

// DELETE USER
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User deleted" });
  });
};