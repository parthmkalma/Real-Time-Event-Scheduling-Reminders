import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const socket = io("http://localhost:5000"); 

function App() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date(),
    time: "",
    description: "",
    reminder: 5, // Default reminder time in minutes
  });
  const [reminder, setReminder] = useState("");

  // Fetch all events on component load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data); // Update state with fetched events
        } else {
          console.error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []); // Empty dependency array ensures it runs once on load

  // Real-time WebSocket connection to receive reminders
  useEffect(() => {
    socket.on("reminder", (message) => {
      setReminder(message);
      alert(message); // Show browser alert for the reminder
    });

    return () => {
      socket.off("reminder");
    };
  }, []);

  // Handle form input changes for new event
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: name === "date" ? new Date(value) : value,
    }));
  };

  // Submit new event to the backend
  const handleEventSubmit = async (e) => {
    e.preventDefault();

    // Ensure reminder is between 5 and 60 minutes
    if (newEvent.reminder < 5 || newEvent.reminder > 60) {
      alert("Reminder must be between 5 and 60 minutes.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        const savedEvent = await response.json();
        setEvents([...events, savedEvent]); // Add new event to the list
        setNewEvent({
          title: "",
          date: new Date(),
          time: "",
          description: "",
          reminder: 5,
        });
      } else {
        console.error("Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  // Handle deleting events
  // Updated frontend code with ID for event deletion

  const handleDeleteEvent = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/events/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents(events.filter((event) => event._id !== id)); // Use _id for MongoDB or id if your DB uses that
      } else {
        console.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="App font-sans bg-gray-50 min-h-screen p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Event Scheduling System
        </h1>

        {/* Event Form */}
        <form
          onSubmit={handleEventSubmit}
          className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg"
        >
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={handleInputChange}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="time"
            name="time"
            value={newEvent.time}
            onChange={handleInputChange}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="description"
            placeholder="Event Description"
            value={newEvent.description}
            onChange={handleInputChange}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mb-6">
            <p className="text-lg mb-2">Select Event Date</p>
            <Calendar
              onChange={(date) => setNewEvent({ ...newEvent, date })}
              value={newEvent.date}
            />
          </div>
          <div className="mb-6">
            <label className="block font-medium mb-2">
              Reminder (minutes before)
            </label>
            <input
              type="number"
              name="reminder"
              value={newEvent.reminder}
              onChange={handleInputChange}
              min="5"
              max="60"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              Enter a reminder time between 5 and 60 minutes.
            </p>
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Event
          </button>
        </form>

        {/* Upcoming Events */}
        <h2 className="text-2xl font-semibold text-center text-blue-600 mt-8">
          Upcoming Events
        </h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id} // or event.id, depending on how your backend responds
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition duration-200"
            >
              <h3 className="text-xl font-semibold text-blue-600">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="mt-2 text-gray-500">
                {new Date(event.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-500">
                {new Date(`1970-01-01T${event.time}:00`).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }
                )}
              </p>

              <button
                onClick={() => handleDeleteEvent(event._id)} // Use _id for MongoDB or id
                className="mt-2 text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Reminder Notifications */}
        {reminder && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
            {reminder}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
