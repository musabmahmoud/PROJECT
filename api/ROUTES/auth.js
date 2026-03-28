const express = require("express");
const router = express.Router();
const User = require("../MODELS/user"); // Link to our User rules
const bcrypt = require("bcryptjs");      // Link to our password scrambler

/**
 * TITAN ERP | AUTHENTICATION ROUTES
 * This file handles two main tasks: Creating new Admins and Checking Logins.
 */

// --- SIGNUP: CREATE NEW ADMIN ACCOUNTS ---
// Triggered by your signup.html page.
router.post("/signup", async (req, res) => { 
  try {
    const { username, password } = req.body;
    
    // 1. DATA VALIDATION: Make sure the user didn't leave fields empty.
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    // 2. SECURITY CHECK: Enforce strong passwords (8+ chars, letters & numbers).
    // This stops people from using weak passwords like "123456".
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; 
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password must be 8+ chars with letters & numbers." });
    }

    // 3. DUPLICATION CHECK: Search the database to see if this username is already taken.
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username taken." });

    // 4. SAVE: Create the new user. 
    // Remember: The Model (user.js) will automatically hash the password before saving!
    const user = new User({ username, password });
    await user.save();
    
    res.status(201).json({ message: "Admin Registered Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOGIN: AUTHENTICATE AND GRANT ACCESS ---
// Triggered by your login.html page.
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. LOOKUP: Find the user by their ID.
    const user = await User.findOne({ username });
    
    // 2. USER CHECK: If the ID doesn't exist, stop here.
    if (!user) return res.status(401).json({ error: "User record not found" });

    // 3. PASSWORD CHECK: Compare the typed password with the scrambled one in the DB.
    // Bcrypt is the only one who can "un-scramble" it to check if they match.
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid Credentials" });

    // 4. SUCCESS: Tell the frontend they are allowed in.
    res.json({ success: true, message: "Access Granted", username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Authentication Server Error" });
  }
});

module.exports = router;