const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // The library that "scrambles" passwords

/**
 * TITAN ERP | USER & AUTHENTICATION MODEL
 * This schema defines the login credentials for Administrators.
 * It uses BCRYPT to ensure passwords are never stored in plain text.
 */
const userSchema = new mongoose.Schema({
  // UNIQUE ensures that two people cannot register with the same User ID.
  username: { type: String, required: true, unique: true },
  
  // This will store the "Hashed" version of the password, not the actual word.
  password: { type: String, required: true }
});

/**
 * SECURITY MIDDLEWARE: AUTO-HASHING
 * This runs automatically right before a User is saved to MongoDB.
 * It takes a password like "123456" and turns it into a long string 
 * of random characters like "$2a$10$X..."
 */
userSchema.pre("save", async function(next) {
  // Only scramble the password if it's new or being changed.
  if (!this.isModified("password")) return next();

  // '10' is the saltRounds (the strength of the encryption).
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// The '||' check prevents Mongoose from trying to recreate the model 
// if it's already loaded, which is common in Vercel/Serverless environments.
module.exports = mongoose.models.User || mongoose.model("User", userSchema);