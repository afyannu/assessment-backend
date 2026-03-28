const express = require("express");
const router = express.Router();
const Activity = require("../models/activity");
const auth = require("../middleware/auth"); // your JWT middleware
const authMiddleware = require("../middleware/auth"); // your JWT middleware


// Example: GET /api/users/profile/activity
router.get("/", authMiddleware, async (req, res) => {
  try {
    // You can fetch real activity from DB if you have a model
    const activities = [
      { title: "Logged in", dateTime: new Date(), color: "info" },
      { title: "Updated profile", dateTime: new Date(), color: "success" },
    ];

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add activity
router.post("/", auth, async (req, res) => {
  try {
    const activity = new Activity({
      userId: req.user.id,
      title: req.body.title,
      icon: req.body.icon,
      color: req.body.color,
      dateTime: req.body.dateTime
    });

    await activity.save();
    res.json(activity);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;