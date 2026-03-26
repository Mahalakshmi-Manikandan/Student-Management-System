const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../utils/email");


// ================= REGISTER =================

exports.register = async (req, res) => {
  try {
    const {
      name,
      department,
      course,
      duration,
      designation,
      year,
      email,
      password,
      role
    } = req.body;

    //  Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users 
      (name, department, course, duration, designation, year, email, password, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        name,
        department || null,
        course || null,
        duration || null,
        designation || null,
        year || null,
        email,
        hashedPassword,
        role
      ],
      (err, result) => {
        if (err) {
          console.error("DB ERROR:", err);

          // Duplicate email handling
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already exists" });
          }

          return res.status(500).json({ message: "Database error" });
        }

        return res.json({
          message: "User Registered Successfully"
        });
      }
    );

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {

    if (err) return res.status(500).json(err);
    if (result.length === 0)
      return res.status(400).json({ message: "User not found" });

    const user = result[0];

    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Wrong password" });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    db.query(
      "INSERT INTO refresh_tokens (user_id, token) VALUES (?,?)",
      [user.id, refreshToken]
    );

    res.json({ accessToken, refreshToken, role: user.role });
  });
};


// ================= VERIFY EMAIL =================
exports.verifyEmail = (req, res) => {
  const { token } = req.params;

  db.query(
    "UPDATE users SET is_verified=TRUE, verification_token=NULL WHERE verification_token=?",
    [token],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0)
        return res.status(400).json({ message: "Invalid token" });

      res.json({ message: "Email verified successfully" });
    }
  );
};


// ================= REFRESH TOKEN =================
exports.refreshToken = (req, res) => {
  const { token } = req.body;

  if (!token)
    return res.status(401).json({ message: "Refresh token required" });

  jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    // Fetch role from DB so the new access token has role included
    db.query("SELECT role FROM users WHERE id=?", [user.id], (dbErr, result) => {
      if (dbErr || result.length === 0)
        return res.status(403).json({ message: "User not found" });

      const newAccessToken = jwt.sign(
        { id: user.id, role: result[0].role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ accessToken: newAccessToken });
    });
  });
};


// ================= LOGOUT =================
exports.logout = (req, res) => {
  const { token } = req.body;

  db.query(
    "DELETE FROM refresh_tokens WHERE token=?",
    [token],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Logged out successfully" });
    }
  );
};


// ================= FORGOT PASSWORD =================
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  const resetToken = uuidv4();
  const expiry = Date.now() + 3600000; // 1 hour

  db.query(
    "UPDATE users SET reset_token=?, reset_token_expiry=? WHERE email=?",
    [resetToken, expiry, email],
    async (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0)
        return res.status(400).json({ message: "Email not found" });

      const resetLink = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

      await sendEmail(
        email,
        "Reset Password",
        `<h3>Click below to reset your password:</h3>
         <a href="${resetLink}">${resetLink}</a>`
      );

      res.json({ message: "Password reset link sent to email" });
    }
  );
};


// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "SELECT * FROM users WHERE reset_token=? AND reset_token_expiry>?",
    [token, Date.now()],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0)
        return res.status(400).json({ message: "Token expired or invalid" });

      db.query(
        "UPDATE users SET password=?, reset_token=NULL, reset_token_expiry=NULL WHERE reset_token=?",
        [hashedPassword, token],
        (err2) => {
          if (err2) return res.status(500).json(err2);
          res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
};

exports.getMe = (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const sql =
    "SELECT id, name, email, role, department, designation, course, year, duration FROM users WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result[0]);
  });
};