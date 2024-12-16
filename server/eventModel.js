const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  reminder: { type: Number, default: 5 }, // Single reminder in minutes
  // Reminders in minutes
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
