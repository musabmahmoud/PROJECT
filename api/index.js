const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 2. DATABASE ---
const MONGO_URI = 'mongodb+srv://Musab:Musab2008!@cluster0.47y03jt.mongodb.net/TitanSchool?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ TITAN DB: ONLINE"))
    .catch(err => console.error("❌ DB ERROR:", err));

// --- 3. HARD-CODED OWNER LOGIN ---
// This replaces the need for an external 'auth.js' file entirely
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Your private credentials
    const OWNER_EMAIL = "ayat"; 
    const OWNER_PASS = "01124756018"; 

    if (email === OWNER_EMAIL && password === OWNER_PASS) {
        console.log(`✨ Welcome back, ${email}`);
        return res.status(200).json({ 
            success: true,
            user: { id: "OWNER_01", role: "admin" } 
        });
    }
    
    console.log(`⚠️ Blocked unauthorized login attempt: ${email}`);
    res.status(401).json({ success: false, message: "Invalid Owner Credentials" });
});

// --- 4. FUNCTIONAL ROUTES ---
// These handle your Students, Teachers, and the Schedule Grid
app.use('/api/students', require('./ROUTES/student')); 
app.use('/api/teachers', require('./ROUTES/teachers'));
app.use('/api/tables', require('./ROUTES/tables'));

// --- 5. HEALTH CHECK ---
app.get('/', (req, res) => {
    res.send('<h1 style="font-family:sans-serif; color:#2563eb; text-align:center; margin-top:20%;">TITAN ENGINE V1.1 : STABLE</h1>');
});

// --- 6. START ---
const PORT = process.env.PORT || 5001; 
app.listen(PORT, () => {
    console.log(`🚀 Engine firing on Port ${PORT}`);
});