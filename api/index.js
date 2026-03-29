const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Allows the use of secret variables from a .env file

const app = express();

/**
 * TITAN ERP | MAIN SERVER ENTRY POINT (api/index.js)
 * This file initializes the connection to MongoDB and sets up Global Middleware.
 */

// --- 1. GLOBAL MIDDLEWARE ---
// CORS allows your frontend (like Vercel or Localhost) to talk to this backend.
app.use(cors());
// express.json() allows the server to read the data sent in "POST" requests.
app.use(express.json());

// --- 2. DATABASE CONNECTION ---
// Direct connection to your "TitanSchool" cluster in MongoDB Atlas.
const MONGO_URI = 'mongodb+srv://Musab:Musab2008!@cluster0.47y03jt.mongodb.net/TitanSchool?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ TITAN DATABASE: CONNECTED & ONLINE"))
    .catch(err => console.error("❌ DATABASE ERROR:", err));

// --- 3. ROUTE REGISTRATION ---
// We import the logic from the ROUTES folder.
const studentRoutes = require('./ROUTES/student'); 
const teacherRoutes = require('./ROUTES/teachers'); 
const authRoutes = require('./ROUTES/auth');
const tablesRoutes = require('./ROUTES/tables');

// We map the logic to specific URLs.
// Example: Any request to "/api/auth" will be handled by auth.js
app.use('/api/students', studentRoutes); 
app.use('/api/teachers', teacherRoutes);
// app.use('/api/auth', authRoutes);//
app.use('/api/tables', tablesRoutes);

// --- 4. SYSTEM HEALTH CHECK ---
// If you visit the root URL of your backend, you see this luxury status page.
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
// 5 LOGIN //
// --- 5 LOGIN ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt for:", email); // This will show in your terminal

    const OWNER_EMAIL = "ayat"; 
    const OWNER_PASS = "01124756018"; 

    if (email === OWNER_EMAIL && password === OWNER_PASS) {
        console.log("✅ Owner Login Success!");
        res.status(200).json({ 
            message: "Welcome Owner", 
            user: { id: "OWNER_01" } 
        });
    } else {
        console.log("❌ Login Denied");
        res.status(401).json({ message: "Access Denied: Owner Only" });
    }
});
// --- 6. SERVER INITIALIZATION ---
// The app will run on Port 5000 (Local) or the Port assigned by Vercel/Heroku.
const PORT = process.env.PORT || 5001; 
app.listen(PORT, () => {
    console.log(`🚀 TITAN ENGINE DEPLOYED ON PORT ${PORT}`);
});