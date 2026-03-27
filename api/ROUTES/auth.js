const express = require("express");
const router = express.Router();
const User = require("../MODELS/user");
const bcrypt = require("bcrypt");

// Signup Route
router.post("/signup", async (req, res) => { 
  try {
    const { username, password } = req.body;

    // 1. Basic Check
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // 2. 🛡️ Password Strength Validation
    // Requirements: Min 8 characters, at least 1 letter and 1 number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; 
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: "Password too weak! Must be at least 8 characters and contain both letters and numbers." 
      });
    }

    // 3. Check if user already exists (prevents duplicate error)
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken." });
    }

    const user = new User({ username, password });
    await user.save();
    
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Wrong password" });
    }

    return res.json({ message: "Login successful", username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;