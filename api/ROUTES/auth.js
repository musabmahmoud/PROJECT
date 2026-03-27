const express = require("express");
const router = express.Router();
const User = require("../MODELS/user"); // Ensure you have a User model
const bcrypt = require("bcryptjs");

// SIGNUP: Create new Admin accounts
router.post("/signup", async (req, res) => { 
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    // Password strength: 8 chars, 1 letter, 1 number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; 
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password must be 8+ chars with letters & numbers." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username taken." });

    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "Admin Registered Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN: Authenticate and grant access
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) return res.status(401).json({ error: "User record not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid Credentials" });

    res.json({ success: true, message: "Access Granted", username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Authentication Server Error" });
  }
});

module.exports = router;