const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const studentRoutes = require("./ROUTES/student");
const authRoutes = require("./ROUTES/auth");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection
// Use process.env.MONGO_URI for security on Vercel
// Local fallback for your Mac:
const mongoURI = process.env.MONGO_URI || 

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// API Routes
// Note: Vercel will prefix these with /api based on your vercel.json
app.use("/students", studentRoutes);
app.use("/auth", authRoutes);

// Health check route (Optional - good for testing)
app.get("/", (req, res) => {
  res.send("Backend is running perfectly!");
});

// Port configuration for local testing
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// CRITICAL FOR VERCEL:
module.exports = app;