const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Essential for security

const app = express();

// --- 1. CORE MIDDLEWARE ---
app.use(cors());
app.use(express.json()); // Only need this once

// --- 2. DATABASE CONNECTION ---// 
const MONGO_URI = 'mongodb+srv://Musab:Musab2008!@cluster0.47y03jt.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ TITAN DATABASE: CONNECTED"))
    .catch(err => console.error("❌ DATABASE ERROR:", err));

// --- 3. ROUTE IMPORTS ---
// We let the /ROUTES/ files handle the heavy lifting
const studentRoutes = require('./ROUTES/student');
const teacherRoutes = require('./ROUTES/teachers');

// --- 4. LINKING ROUTES ---
// We use '/api/students' (plural) to match your frontend fetch calls
app.use('/api/ROUTES/student', studentRoutes);
app.use('/api/teachers', teacherRoutes);

// --- 5. SYSTEM HEALTH CHECK ---
app.get('/', (req, res) => res.send("Titan Engine Status: ONLINE"));

// --- 6. START SERVER ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`
    🚀 TITAN ENGINE ONLINE
    📡 PORT: ${PORT}
    🛠️  READY FOR INPUT
    `);
});