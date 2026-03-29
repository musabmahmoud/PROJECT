const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    level: { type: String, required: true },
    className: { type: String, required: true },
    language: { type: String, default: 'English Track' }, // Removed strict enum to prevent crashes
    owner: { type: String, required: true },     
    payments: { type: Number, default: 0 },
    attendance: { type: Number, default: 0 },
    absences: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },
    logs: [{
        date: String,
        subject: String,
        status: { type: String, default: 'present' },
        grade: { type: Number, default: 0 },
        payment: { type: Number, default: 0 }
    }],
    records: [{
        month: String,
        payments: { type: Number, default: 0 },
        attendance: { type: Number, default: 0 },
        absences: { type: Number, default: 0 }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);