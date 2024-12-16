
# Event Scheduling and Reminders System

This is an Event Scheduling and Reminder System built using the MERN stack (MongoDB, Express, React, Node.js). It allows users to schedule events, view them on a calendar, and receive reminders through real-time WebSocket notifications.

## Table of Contents
1. [Technologies Used](#technologies-used)
2. [Folder Structure](#folder-structure)
3. [Setup Instructions](#setup-instructions)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Running the Application](#running-the-application)
4. [API Endpoints](#api-endpoints)
5. [Features](#features)
6. [Contributing](#contributing)
7. [License](#license)
8. [Notes](#notes)

## Technologies Used

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Real-Time Communication**: Socket.io
- **Task Scheduling**: node-cron

## Folder Structure

```
/event-scheduler
├── /client             # React frontend
├── /server             # Node.js backend (Express, MongoDB)
└── README.md           # Project documentation
```

### Client: `/client`

This folder contains the React frontend application.

- Real-time reminder notifications via WebSocket.
- Event creation with title, description, date, time, and reminder time.
- View list of upcoming events with formatted date and time.
- Event deletion functionality.

### Server: `/server`

This folder contains the Node.js backend.

- CRUD functionality for event management (Create, Read, Update, Delete).
- WebSocket integration for real-time reminder notifications.
- Cron job scheduling for sending event reminders.

---

## Setup Instructions

### Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (either locally or use MongoDB Atlas)
- **npm** or **yarn** for package management

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/event-scheduler.git
   ```

2. Navigate to the `client` folder and install the dependencies:
   ```bash
   cd event-scheduler/client
   npm install
   ```

3. Navigate to the `server` folder and install the dependencies:
   ```bash
   cd event-scheduler/server
   npm install
   ```

4. Make sure to update the database connection URL in the backend (`server/db.js` file) to your MongoDB instance.

---

## Running the Application

### 1. Start the Backend (Server)

In the `server` folder, start the backend server:
```bash
cd server
npm start
```
This will run the server on `http://localhost:5000` by default.

### 2. Start the Frontend (Client)

In the `client` folder, start the frontend:
```bash
cd client
npm start
```
This will open the React app in your default web browser, usually at `http://localhost:5173/`.

---

## API Endpoints

The backend exposes the following API endpoints:

- **GET `/events`**: Fetch all events
- **POST `/events`**: Add a new event
  - Request Body:
    ```json
    {
      "title": "Event Title",
      "date": "2024-12-16T10:00:00",
      "time": "10:00",
      "description": "Event Description",
      "reminder": 5
    }
    ```
- **DELETE `/events/:id`**: Delete an event by ID

---

## Features

- **Real-Time Reminders**: Users receive real-time notifications before an event occurs via WebSocket.
- **Event Scheduling**: Users can create, view, and delete events. Each event includes a title, date, time, description, and reminder time.
- **Cron Job for Reminders**: The backend uses **node-cron** to schedule reminders before events, and sends reminder notifications at the scheduled time.

---

## Contributing

If you want to contribute to this project, feel free to fork it and submit pull requests. Please follow the steps below:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

---

## Notes

- Ensure that MongoDB is up and running either locally or via MongoDB Atlas, and update the MongoDB connection string in the server if necessary.
- The backend is set to run on port `5000` and the frontend on port `3000`. You can change the ports or environment variables as needed.
- WebSocket functionality provides real-time event reminders, and the application uses cron jobs to trigger reminders at the specified times.

