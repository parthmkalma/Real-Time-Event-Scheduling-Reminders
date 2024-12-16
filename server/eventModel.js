const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  reminderSettings: { type: [Number], default: [5, 60] }, // Reminders in minutes
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
