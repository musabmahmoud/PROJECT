const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  level: { 
    type: String, 
    required: true, 
    default: "Sec 2" 
  }, // Ranges from Primary 1 to Sec 3
  className: { 
    type: String, 
    default: "Class A" 
  },
  language: { 
    type: String, 
    enum: ['Arabic', 'English'], 
    default: 'English' 
  },
  owner: { 
    type: String, 
    required: true 
  }, // This links the student to the Admin's username
  
  // THE ENGINE: Monthly Records Array
  records: [{
    month: { 
      type: String, 
      required: true 
    }, // Format: "2026-03"
    payments: { 
      type: Number, 
      default: 0 
    },
    attendance: { 
      type: Number, 
      default: 0 
    },
    absences: { 
      type: Number, 
      default: 0 
    },
    // Dynamic Grades Object
    // Allows storing any subject: { physics: 90, math: 85, ... }
    grades: { 
      type: Map, 
      of: Number, 
      default: {} 
    }
  }],
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create index for faster searching by Admin and Level
studentSchema.index({ owner: 1, level: 1 });

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);