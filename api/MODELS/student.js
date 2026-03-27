const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true // Removes accidental extra spaces
  },
  payments: { 
    type: Number, 
    default: 0 
  },
  attendance: { 
    type: Number, 
    default: 0 
  },
  dateAdded: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Student", studentSchema);