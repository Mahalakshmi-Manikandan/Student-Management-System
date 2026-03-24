const db = require("../config/db");

exports.getNotifications = (req, res) => {
  db.query(
    "SELECT * FROM notifications ORDER BY created_at DESC",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

exports.createNotification = (req, res) => {
  const { title, message } = req.body;

  db.query(
    "INSERT INTO notifications (title,message) VALUES (?,?)",
    [title, message],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Notification created" });
    }
  );
};