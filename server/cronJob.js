const cron = require("node-cron");
const socketIo = require("socket.io");
const Event = require("./eventModel.js");

const io = socketIo(); // You can pass your server instance if needed

// Function to schedule reminders
const scheduleReminder = (event) => {
  event.reminderSettings.forEach((reminderTime) => {
    // Calculate reminder time before the event
    const reminderDate = new Date(event.date);
    const reminderTimeMs = reminderTime * 60 * 1000; // Convert minutes to milliseconds
    reminderDate.setMinutes(reminderDate.getMinutes() - reminderTime);

    // Schedule the reminder using node-cron
    cron.schedule(new Date(reminderDate), () => {
      sendReminder(event, reminderTime);
    });
  });
};

// Send reminder notification via WebSocket
const sendReminder = (event, reminderTime) => {
  const reminderMessage = `Reminder: Your event "${event.title}" is coming up in ${reminderTime} minutes!`;

  // Emit the reminder via WebSocket
  io.emit("reminder", reminderMessage);
};

module.exports = { scheduleReminder };
