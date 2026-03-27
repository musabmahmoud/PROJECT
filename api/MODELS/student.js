const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  payments: { type: Number, default: 0 },
  attendance: { type: Number, default: 0 },
  absences: { type: Number, default: 0 }, // 🆕 New field
  dateAdded: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Student", studentSchema);