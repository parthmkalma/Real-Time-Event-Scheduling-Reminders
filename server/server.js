// server.js
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const cronJob = require("./cronJob");
const Event = require("./eventModel");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect("mongodb://localhost:27017/eventScheduler")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Handle WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Send event updates to the client
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// REST API Routes

// Get all events
app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).send("Error retrieving events.");
  }
});

// Add new event
app.post("/events", async (req, res) => {
  try {
    const { title, date, time, description, reminder } = req.body;

    // Save the event to the database
    const newEvent = await Event.create({
      title,
      date,
      time,
      description,
      reminder,
    });

    // Schedule reminders for the event
    cronJob.scheduleReminder(newEvent,io);

    // Respond to the client
    return res
      .status(201)
      .json({ message: "Event created successfully!", event: newEvent });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred", error });
  }
});

// Delete event by ID
app.delete("/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
