const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 1. INITIALIZE APP FIRST (Crucial Fix)
const app = express();

// 2. MIDDLEWARE (Now 'app' exists, so this won't crash)
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(express.json());

// 3. DATABASE CONNECTION
const MONGO_URI = 'mongodb+srv://Musab:Musab2008!@cluster0.47y03jt.mongodb.net/TitanSchool?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ TITAN DATABASE: ONLINE"))
    .catch(err => console.error("❌ DATABASE ERROR:", err));

// 4. ROUTES
// Make sure these files exist in your ROUTES folder!
app.use('/api/students', require('./ROUTES/student'));
app.use('/api/teachers', require('./ROUTES/teachers'));
app.use('/api/auth', require('./ROUTES/auth'));
app.use('/api/tables', require('./ROUTES/tables'));

// 5. HEALTH CHECK
app.get('/', (req, res) => {
    res.send(`
        <body style="background: #020617; color: #3b82f6; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div style="text-align: center; border: 2px solid #1e293b; padding: 40px; border-radius: 20px;">
                <h1>TITAN ENGINE : ONLINE</h1>
                <p style="color: #64748b;">API is listening for Vercel requests</p>
            </div>
        </body>
    `);
});

// 6. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 TITAN ENGINE DEPLOYED ON PORT ${PORT}`);
});