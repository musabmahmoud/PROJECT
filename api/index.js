const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const studentRoutes = require("./ROUTES/student"); 
const authRoutes = require("./ROUTES/auth");       
const Student = require("./MODELS/student"); // Import Model for the migration check

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI missing");
} else {
  mongoose.connect(mongoURI)
    .then(async () => {
      console.log('✅ MongoDB Connected');
      
      // --- THE "BIG PROBLEM" FIX (MIGRATION) ---
      // This runs once on startup to fix old students without owners
      try {
        const result = await Student.updateMany(
          { owner: { $exists: false } }, 
          { $set: { owner: "Admin" } } 
        );
        if(result.modifiedCount > 0) {
          console.log(`🛠 Fixed ${result.modifiedCount} ownerless students.`);
        }
      } catch (err) {
        console.error("❌ Migration Error:", err);
      }
      // -----------------------------------------
    })
    .catch(err => console.error('❌ MongoDB Error:', err));
}

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);

// Health Checks
app.get("/api", (req, res) => {
  res.status(200).send("Backend is running perfectly!");
});

app.get("/", (req, res) => {
  res.status(200).send("API Index reached");
});

module.exports = app;