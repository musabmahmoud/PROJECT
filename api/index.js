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

// --- 3. ROUTE IMPORTS ---
// Check your folder name: If it's lowercase 'routes', change 'ROUTES' to 'routes'
const studentRoutes = require('./ROUTES/students');
const teacherRoutes = require('./ROUTES/teachers');
const authRoutes = require('./ROUTES/auth'); 

// --- 4. LINKING ROUTES ---
app.use('/api/students', studentRoutes); // Matches index.html fetch
app.use('/api/teachers', teacherRoutes);
app.use('/api/auth', authRoutes);         // Fixes "Cannot POST /api/auth/login"

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