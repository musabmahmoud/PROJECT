const express = require("express");
const router = express.Router();
const User = require("../MODELS/user");
const bcrypt = require("bcrypt");

// Register (Signup) - Clean Version
router.post("/register", async (req, res) => {
  try {
    // Just pass the plain password; the Schema's .pre("save") will hash it for you!
    const user = new User({ 
      username: req.body.username, 
      password: req.body.password 
    });

    await user.save();
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ error: "User not found" });

    // This compares the typed password with the scrambled one in the DB
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });

    res.json({ message: "Login successful", username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;