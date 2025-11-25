// server.js
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// DB
const connectDB = require("./src/config/db");

// Routes
const authRoutes = require("./src/routes/authRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const mailRoutes = require("./src/routes/mailRoutes");   // <-- ADDED
const contactRoutes = require("./src/routes/contactRoutes");

// Controllers that need socket injection
const { setSocketIoInstance} = require("./src/controllers/notificationController");

const { setMailSocket } = require("./src/controllers/mailController"); // <-- ADDED

// ############################
// EXPRESS APP
// ############################

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// DB connect
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/mail", mailRoutes); // <-- ADDED
app.use("/api/contacts", contactRoutes);


// Health route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// ############################
// SOCKET.IO SETUP
// ############################

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// give socket instance to controllers
setSocketIoInstance(io); // notifications
setMailSocket(io);       // <-- ADDED mail socket

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    console.log("User joined room:", userId);
    socket.join(userId); // user joins their own room
  }

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ############################
// SERVER LISTENING
// ############################

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log("Server running on port " + PORT));























// // server.js
// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");
// require("dotenv").config();

// // DB
// const connectDB = require("./src/config/db");

// // Routes
// const authRoutes = require("./src/routes/authRoutes");
// const notificationRoutes = require("./src/routes/notificationRoutes");

// // Controllers that will need socket injection
// const {
//   setSocketIoInstance,
// } = require("./src/controllers/notificationController");

// // ############################
// // EXPRESS APP
// // ############################

// const app = express();
// app.use(cors({ origin: "*" }));
// app.use(express.json());

// // DB connect
// connectDB();

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/notifications", notificationRoutes);

// // Health route
// app.get("/", (req, res) => {
//   res.send("Backend is working!");
// });

// // ############################
// // SOCKET.IO SETUP
// // ############################

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: "*" },
// });

// // give socket instance to controllers
// setSocketIoInstance(io);

// io.on("connection", (socket) => {
//   console.log("Socket connected:", socket.id);

//   const userId = socket.handshake.query.userId;

//   if (userId) {
//     console.log("User joined room:", userId);
//     socket.join(userId); // user joins their own room
//   }

//   socket.on("disconnect", () => {
//     console.log("Socket disconnected:", socket.id);
//   });
// });

// // ############################
// // SERVER LISTENING
// // ############################

// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => console.log("Server running on port " + PORT));