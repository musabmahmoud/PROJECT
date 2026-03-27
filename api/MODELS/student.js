const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  payments: { 
    type: Number, 
    default: 0 
  },
  attendance: { 
    type: Number, 
    default: 0,
    alias: "presents" // Just an internal reminder that this is for "Present" days
  },
  // 🆕 Added this to track missed days
  absences: { 
    type: Number, 
    default: 0 
  },
  dateAdded: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Student", studentSchema);