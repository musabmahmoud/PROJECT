const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: String, required: true },
  payments: { type: Number, default: 0 },
  attendance: { type: Number, default: 0 },
  absences: { type: Number, default: 0 },
  grade: { type: Number, default: 0 },
  dateAdded: { type: Date, default: Date.now }
});

// This line checks if the model already exists to prevent Vercel recompilation errors
module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);