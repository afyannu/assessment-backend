const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",   // or User model
  },
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String
  },
  color: {
    type: String
  },
  dateTime: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);