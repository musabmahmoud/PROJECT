const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 2. DATABASE CONNECTION ---
// Using your specific connection string provided
const MONGO_URI = 'mongodb+srv://Musab:Musab2008!@cluster0.47y03jt.mongodb.net/TitanSchool?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ TITAN DATABASE: CONNECTED & ONLINE"))
    .catch(err => console.error("❌ DATABASE ERROR:", err));

const API = "/api/students";
const studentRoutes = require('./ROUTES/student'); // Removed the 's'
const teacherRoutes = require('./ROUTES/teachers'); // Check if this is singular too!
const authRoutes = require('./ROUTES/auth');
const tableRoutes = require('./ROUTES/tables'); // Add this
// Use the routes
app.use('/api/students', studentRoutes); // Keep this plural for the Frontend URL
app.use('/api/teachers', teacherRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes); // Add this

// --- 5. SYSTEM HEALTH CHECK ---
app.get('/', (req, res) => {
    res.status(200).send(`
        <body style="background: #020617; color: #2563eb; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div style="text-align: center; border: 2px solid #1e2937; padding: 40px; border-radius: 20px;">
                <h1>TITAN ENGINE : ONLINE</h1>
                <p style="color: #64748b;">API Version 1.0.4 | Database Status: Connected</p>
            </div>
        </body>
    `);
});

// --- 6. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 TITAN ENGINE DEPLOYED ON PORT ${PORT}`);
});