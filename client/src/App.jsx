import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  PlusIcon,
  TrashIcon,
  ClockIcon,
  CalendarIcon,
  BellIcon,
  XIcon,
} from "lucide-react";

const socket = io("http://localhost:5000");

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EventScheduler() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date(),
    time: "",
    description: "",
    reminder: 5,
  });
  const [reminder, setReminder] = useState({ id: null, message: "" });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          console.error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    socket.on("reminder", (message) => {
      setReminder({ id: Date.now(), message });
      alert(message);
    });

    return () => {
      socket.off("reminder");
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: name === "date" ? new Date(value) : value,
    }));
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    if (newEvent.reminder < 5 || newEvent.reminder > 60) {
      alert("Reminder must be between 5 and 60 minutes.");
      return;
    }

    const eventToSubmit = {
      ...newEvent,
      date: newEvent.date.toISOString(),
    };

    const response = await fetch("http://localhost:5000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventToSubmit),
    });

    if (response.ok) {
      setEvents((prevEvents) => [...prevEvents, eventToSubmit]);
      setNewEvent({
        title: "",
        date: new Date(),
        time: "",
        description: "",
        reminder: 5,
      });
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/events/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents(events.filter((event) => event._id !== id));
      } else {
        console.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const hasEvent = (date) => {
    return events.some(
      (event) => new Date(event.date).toDateString() === date.toDateString()
    );
  };

  const filteredEvents = events.filter(
    (event) =>
      new Date(event.date).toDateString() === selectedDate.toDateString()
  );

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const firstDayOfMonth = days[0].getDay();

    return (
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center font-bold py-2">
            {day}
          </div>
        ))}
        {Array(firstDayOfMonth)
          .fill(null)
          .map((_, index) => (
            <div key={`empty-${index}`} className="p-2"></div>
          ))}
        {days.map((day) => (
          <div
            key={day.toString()}
            className={`p-2 text-center cursor-pointer hover:bg-indigo-100 ${
              day.toDateString() === selectedDate.toDateString()
                ? "bg-indigo-200"
                : ""
            }`}
            onClick={() => setSelectedDate(day)}
          >
            {day.getDate()}
            {hasEvent(day) && (
              <div className="w-2 h-2 bg-indigo-600 rounded-full mx-auto mt-1"></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const dismissReminder = () => {
    setReminder({ id: null, message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-10">
          Event Scheduling System
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1
                      )
                    )
                  }
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md"
                >
                  Prev
                </button>
                <h2 className="text-xl font-semibold">
                  {currentMonth.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      )
                    )
                  }
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md"
                >
                  Next
                </button>
              </div>
              {renderCalendar()}
            </div>
          </div>

          <div>
            <form
              onSubmit={handleEventSubmit}
              className="bg-white p-6 rounded-xl shadow-lg mb-8"
            >
              <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
                Add New Event
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Event Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Enter event title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Event Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newEvent.date.toISOString().split("T")[0]}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Event Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={newEvent.time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Event Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Enter event description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reminder"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Reminder (minutes before)
                  </label>
                  <input
                    type="number"
                    id="reminder"
                    name="reminder"
                    value={newEvent.reminder}
                    onChange={handleInputChange}
                    min="5"
                    max="60"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a reminder time between 5 and 60 minutes.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out flex items-center justify-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Event
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-8">
            Events for {selectedDate.toDateString()}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out"
              >
                <h3 className="text-xl font-semibold text-indigo-600 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="flex items-center text-gray-500 mb-2">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  <span>
                    {new Date(event.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center text-gray-500 mb-4">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  <span>
                    {new Date(`1970-01-01T${event.time}:00`).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}
                  </span>
                </div>
                <div className="flex items-center text-gray-500 mb-4">
                  <BellIcon className="w-5 h-5 mr-2" />
                  <span>{event.reminder} minutes before</span>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event._id)}
                  className="mt-2 flex items-center text-red-500 hover:text-red-700 transition duration-150 ease-in-out"
                >
                  <TrashIcon className="w-5 h-5 mr-1" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {reminder.message && (
          <div className="fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-lg shadow-lg max-w-sm flex items-start">
            <p className="font-semibold flex-grow">{reminder.message}</p>
            <button
              onClick={dismissReminder}
              className="ml-2 text-white hover:text-indigo-200 transition duration-150 ease-in-out"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
