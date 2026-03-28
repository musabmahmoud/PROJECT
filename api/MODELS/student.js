const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    level: { type: String, required: true },     // Primary 1 - Prep 3
    className: { type: String, required: true }, // Group A, Group B
    language: { type: String, enum: ['Arabic', 'English'], default: 'English' },
    owner: { type: String, required: true },     // Admin ID
    
    // DAILY TIMELINE LOGS (The big change)
    // This allows: "On March 28, Ahmed was Absent for English and paid 600"
    logs: [{
        date: { type: String, required: true },    // e.g., "2026-03-28"
        subject: { type: String, required: true }, // e.g., "English"
        status: { type: String, enum: ['present', 'absent'], default: 'present' },
        grade: { type: Number, default: 0 },
        payment: { type: Number, default: 0 }
    }],

    // MONTHLY RECORDS (Kept for your Stats Engine)
    records: [{
        month: { type: String, required: true }, // e.g., "2026-03"
        payments: { type: Number, default: 0 },
        attendance: { type: Number, default: 0 },
        absences: { type: Number, default: 0 },
        grades: {
            math: { type: Number, default: 0 },
            english: { type: Number, default: 0 },
            arabic: { type: Number, default: 0 },
            physics: { type: Number, default: 0 },
            chemistry: { type: Number, default: 0 },
            science: { type: Number, default: 0 },
            socialStudies: { type: Number, default: 0 },
            religion: { type: Number, default: 0 }
        }
    }],
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);