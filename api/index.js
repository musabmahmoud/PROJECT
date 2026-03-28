const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

/**
 * TITAN ERP | MAIN SERVER ENTRY POINT
 * Optimized for Cross-Origin (CORS) and Header Security.
 */

// --- 1. GLOBAL MIDDLEWARE ---
// Detailed CORS Fix: This tells the browser exactly which headers are allowed.
app.use(cors({
    origin: "*", // Allows Vercel, Localhost, and Mobile to connect
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "adminId", "x-admin-id"] 
}));

app.use(express.json());

// --- 2. DATABASE CONNECTION ---
// Using process.env.MONGO_URI is safer, but I kept your string for immediate testing.
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Musab:Musab2008!@cluster0.47y03jt.mongodb.net/TitanSchool?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ TITAN DATABASE: CONNECTED & ONLINE"))
    .catch(err => {
        console.error("❌ DATABASE CONNECTION ERROR:");
        console.error(err.message);
    });

// --- 3. ROUTE REGISTRATION ---
// Ensure the folder names "ROUTES" match your actual folder case (Windows is case-insensitive, but Vercel/Linux is NOT).
const studentRoutes = require('./ROUTES/student'); 
const teacherRoutes = require('./ROUTES/teachers'); 
const authRoutes = require('./ROUTES/auth');

app.use('/api/students', studentRoutes); 
app.use('/api/teachers', teacherRoutes);
app.use('/api/auth', authRoutes);

// --- 4. ROOT STATUS PAGE ---
app.get('/', (req, res) => {
    res.status(200).send(`
        <body style="background: #020617; color: #2563eb; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <div style="text-align: center; border: 2px solid #1e2937; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <h1 style="letter-spacing: 2px;">TITAN ENGINE : <span style="color: #10b981;">ONLINE</span></h1>
                <p style="color: #64748b;">API Version 1.0.5 | Database: Connected</p>
                <div style="margin-top: 20px; font-size: 12px; color: #334155;">System Time: ${new Date().toLocaleString()}</div>
            </div>
        </body>
    `);
});

// --- 5. SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 TITAN ENGINE DEPLOYED ON PORT ${PORT}`);
});