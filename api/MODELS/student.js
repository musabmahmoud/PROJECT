const mongoose = require('mongoose');

/**
 * TITAN ERP | STUDENT DATA STRUCTURE
 * This file defines the rules for every student saved in your MongoDB.
 * If a field is "required: true", the server will REJECT the save if it's missing.
 */
const studentSchema = new mongoose.Schema({
    // --- IDENTITY SECTION ---
    name: { type: String, required: true },
    level: { type: String, required: true },     // Format: "Primary 1" through "Sec 3"
    className: { type: String, required: true }, // Format: "Group A", "Group B", etc.
    
    // CRITICAL: The server only allows these exact words. 
    // If you send "English Track", it will throw a 400 Error.
    language: { type: String, enum: ['Arabic', 'English'], default: 'English' },
    
    // SYNC KEY: This links the student to YOUR specific Admin ID.
    owner: { type: String, required: true },     

    // --- FINANCE TRACKER ---
    // Tracks money paid vs discounts given for the current month.
    payments: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    
    // --- ATTENDANCE MATRIX ---
    // Automatic counters for the current period.
    attendance: { type: Number, default: 0 },
    absences: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },

    // --- THE ACADEMIC VAULT ---
    // Stores current grades for the Egyptian Curriculum (Secondary 2 Focus).
    grades: {
        math: { type: Number, default: 0 },
        english: { type: Number, default: 0 },
        arabic: { type: Number, default: 0 },
        physics: { type: Number, default: 0 },   
        chemistry: { type: Number, default: 0 }, 
        science: { type: Number, default: 0 },   
        discovery: { type: Number, default: 0 }, 
        socialStudies: { type: Number, default: 0 },
        religion: { type: Number, default: 0 }
    },

    // --- DAILY TIMELINE LOGS ---
    // A history list of every single lesson (Date, Subject, Result).
    // This allows you to see a student's progress over time.
    logs: [{
        date: String,
        subject: String,
        status: { type: String, enum: ['present', 'absent'], default: 'present' },
        grade: { type: Number, default: 0 },
        payment: { type: Number, default: 0 }
    }],

    // --- MONTHLY ARCHIVE ---
    // Used for generating monthly reports for parents.
    records: [{
        month: String,
        payments: { type: Number, default: 0 },
        attendance: { type: Number, default: 0 },
        absences: { type: Number, default: 0 },
        grades: { type: Map, of: Number } 
    }],
    
    // Timestamp of when the student was first enrolled.
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);