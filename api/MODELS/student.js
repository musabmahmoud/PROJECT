const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    level: { type: String, required: true },     // Primary 1 - Sec 3
    className: { type: String, required: true }, // Class A, B, C
    language: { type: String, enum: ['Arabic', 'English'], default: 'English' },
    owner: { type: String, required: true },     // Admin ID
    
    // THE FINANCE TRACKER
    payments: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    
    // THE ATTENDANCE MATRIX
    attendance: { type: Number, default: 0 },
    absences: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },

    // THE ACADEMIC VAULT (Dynamic Grades)
    grades: {
        math: { type: Number, default: 0 },
        english: { type: Number, default: 0 },
        arabic: { type: Number, default: 0 },
        physics: { type: Number, default: 0 },   // For Sec/Prep
        chemistry: { type: Number, default: 0 }, // For Sec
        science: { type: Number, default: 0 },   // For Primary/Prep
        discovery: { type: Number, default: 0 }, // For Primary
        socialStudies: { type: Number, default: 0 },
        religion: { type: Number, default: 0 }
    },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);