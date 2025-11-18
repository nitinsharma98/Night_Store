const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/userRoutes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// DB connect
connectDB();

// routes
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Server running on port " + PORT));

