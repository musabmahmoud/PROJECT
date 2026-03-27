const express = require("express");
const router = express.Router();
const User = require("../MODELS/user");
const bcrypt = require("bcrypt");

// Signup Route
router.post("/signup", async (req, res, next) => { 
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = new User({ username, password });
    await user.save();
    
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    // If 'next' is failing, we handle the error directly here
    res.status(400).json({ error: err.message });
  }
});

// Login Route
router.post("/login", async (req, res, next) => {
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
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;