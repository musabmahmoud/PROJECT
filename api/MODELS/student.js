const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    level: { type: String, required: true },     // Primary 1 - Sec 3
    className: { type: String, required: true }, // Class A, B, C
    language: { type: String, enum: ['Arabic', 'English'], default: 'English' },
    owner: { type: String, required: true },     // Admin ID
    
    // THE FINANCE TRACKER (Original)
    payments: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    
    // THE ATTENDANCE MATRIX (Original)
    attendance: { type: Number, default: 0 },
    absences: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },

    // THE ACADEMIC VAULT (Original - All subjects kept)
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

    // THE DAILY TIMELINE LOGS (The New Addition)
    // This stores every single session detail without overwriting the above
    logs: [{
        date: String,
        subject: String,
        status: { type: String, enum: ['present', 'absent'], default: 'present' },
        grade: { type: Number, default: 0 },
        payment: { type: Number, default: 0 }
    }],

    // THE MONTHLY RECORDS (From your route logic)
    records: [{
        month: String,
        payments: { type: Number, default: 0 },
        attendance: { type: Number, default: 0 },
        absences: { type: Number, default: 0 },
        grades: { type: Map, of: Number } 
    }],
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);