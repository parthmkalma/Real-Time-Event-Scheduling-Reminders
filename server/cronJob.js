const cron = require("node-cron");
const Event = require("./eventModel");

// Function to schedule a single reminder
const scheduleReminder = (event, io) => {
  // Combine `date` and `time` to get the full event datetime
  const [hours, minutes] = event.time.split(":").map(Number); // Extract hours and minutes
  const eventDateTime = new Date(event.date); // Base date
  eventDateTime.setHours(hours, minutes, 0, 0); // Set the time

  // Calculate the reminder datetime
  const reminderTime = event.reminder; // Single reminder in minutes
  const reminderDateTime = new Date(eventDateTime);
  reminderDateTime.setMinutes(reminderDateTime.getMinutes() - reminderTime);

  // Skip past reminders
  if (reminderDateTime < new Date()) {
    console.log(
      `Skipping reminder for event "${event.title}" scheduled in the past.`
    );
    return;
  }

  // Convert `reminderDateTime` to a cron pattern
  const cronPattern = `${reminderDateTime.getMinutes()} ${reminderDateTime.getHours()} ${reminderDateTime.getDate()} ${
    reminderDateTime.getMonth() + 1
  } *`;

  // Schedule the reminder using node-cron
  cron.schedule(cronPattern, () => {
    sendReminder(event, reminderTime, io);
  });

  console.log(
    `Scheduled reminder for "${
      event.title
    }" at ${reminderDateTime.toLocaleString()}`
  );
};

// Send reminder notification via WebSocket
const sendReminder = (event, reminderTime, io) => {
  console.log(`Reminder sent for "${event.title}"`);
  const reminderMessage = `Reminder: Your event "${event.title}" is coming up in ${reminderTime} minutes!`;
  console.log(reminderMessage);
  io.emit("reminder", reminderMessage);
};

module.exports = { scheduleReminder };
