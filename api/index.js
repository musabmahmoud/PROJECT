const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const studentRoutes = require("./ROUTES/student"); 
const authRoutes = require("./ROUTES/auth");       

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI missing");
} else {
  mongoose.connect(mongoURI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));
}

// Routes
// When using the /api folder, Vercel maps requests to the folder name.
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);

// This handles the request to https://your-url.com/api
app.get("/api", (req, res) => {
  res.status(200).send("Backend is running perfectly!");
});

// Fallback for the root of the function
app.get("/", (req, res) => {
  res.status(200).send("API Index reached");
});

module.exports = app;