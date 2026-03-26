const db = require("../config/db");

/* ================= USER MODEL ================= */
const User = {
  create: (data, callback) => {
    const sql = `INSERT INTO users 
    (name, department, course, duration, designation, year, email, password, role) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, Object.values(data), callback);
  },

  findByEmail: (email, callback) => {
    db.query("SELECT * FROM users WHERE email = ?", [email], callback);
  },

  findById: (id, callback) => {
    db.query("SELECT * FROM users WHERE id = ?", [id], callback);
  }
};


/* ================= ASSIGNMENT MODEL ================= */
const Assignment = {
  create: (data, callback) => {
    const sql = `INSERT INTO assignments 
    (title, subject, due_date, department, course, year, file_path, created_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, Object.values(data), callback);
  },

  getAll: (callback) => {
    db.query("SELECT * FROM assignments", callback);
  },

  getById: (id, callback) => {
    db.query("SELECT * FROM assignments WHERE id = ?", [id], callback);
  }
};


/* ================= ATTENDANCE MODEL ================= */
const Attendance = {
  mark: (data, callback) => {
    const sql = `INSERT INTO attendance 
    (student_id, attendance_date, period, status, marked_by) 
    VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, Object.values(data), callback);
  },

  getByStudent: (student_id, callback) => {
    db.query("SELECT * FROM attendance WHERE student_id = ?", [student_id], callback);
  }
};


/* ================= STUDY PLANNER MODEL ================= */
const StudyPlanner = {
  create: (data, callback) => {
    const sql = `INSERT INTO study_planner 
    (student_id, goal, study_time)
    VALUES (?, ?, ?)`;
    db.query(sql, Object.values(data), callback);
  },

  getByStudent: (student_id, callback) => {
    db.query("SELECT * FROM study_planner WHERE student_id = ?", [student_id], callback);
  }
};


/* ================= TIMETABLE MODEL ================= */
const Timetable = {
  create: (data, callback) => {
    const sql = `INSERT INTO timetable (department, course, year, day, period, subject) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [data.department, data.course, data.year, data.day, data.period, data.subject], callback);
  },

  bulkCreate: (values, callback) => {
    const sql = "INSERT INTO timetable (department, course, year, day, period, subject) VALUES ?";
    db.query(sql, [values], callback);
  },

  deleteByFilter: (department, course, year, callback) => {
    const sql = "DELETE FROM timetable WHERE department=? AND course=? AND year=?";
    db.query(sql, [department, course, year], callback);
  },

  getByFilter: (department, course, year, callback) => {
    db.query("SELECT * FROM timetable WHERE department=? AND course=? AND year=?", [department, course, year], callback);
  }
};


/* ================= REFRESH TOKEN MODEL ================= */
const RefreshToken = {
  create: (data, callback) => {
    db.query(
      "INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)",
      [data.user_id, data.token],
      callback
    );
  },

  findToken: (token, callback) => {
    db.query("SELECT * FROM refresh_tokens WHERE token = ?", [token], callback);
  }
};


/* ================= NOTIFICATION MODEL ================= */
const Notification = {
  create: (data, callback) => {
    db.query(
      "INSERT INTO notifications (title, message) VALUES (?, ?)",
      [data.title, data.message],
      callback
    );
  },

  getAll: (callback) => {
    db.query("SELECT * FROM notifications ORDER BY created_at DESC", callback);
  }
};


/* ================= EXPORT ALL ================= */
module.exports = {
  User,
  Assignment,
  Attendance,
  StudyPlanner,
  Timetable,
  RefreshToken,
  Notification
};
