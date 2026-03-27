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
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ CRITICAL: MONGO_URI is not defined!");
} else {
  mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

// API Routes
// vercel.json sends /api/auth/signup -> server.js sees /auth/signup
app.use("/students", studentRoutes);
app.use("/auth", authRoutes);

// Health check route - This handles the base "/api" call
app.get("/", (req, res) => {
  res.status(200).send("Backend is running perfectly!");
});

// Catch-all for undefined routes to prevent standard 404 HTML pages
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found on this server` });
});

// Port configuration for local testing only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;