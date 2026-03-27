const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// REMOVE 'next' from the arguments and the call
userSchema.pre("save", async function() {
  if (!this.isModified("password")) return; // Just return, don't call next()
  
  this.password = await bcrypt.hash(this.password, 10);
  // No next() call needed here for async functions
});

module.exports = mongoose.model("User", userSchema);