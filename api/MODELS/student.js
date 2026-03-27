const mongoose = require("mongoose");

const MonthlyRecordSchema = new mongoose.Schema({
  month: { type: String, required: true }, // Format: "2026-03"
  payments: { type: Number, default: 0 },
  attendance: { type: Number, default: 0 },
  absences: { type: Number, default: 0 },
  grade: { type: Number, default: 0 }
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: String, required: true },
  owner: { type: String, required: true }, 
  dateAdded: { type: Date, default: Date.now },
  records: [MonthlyRecordSchema]
});

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);