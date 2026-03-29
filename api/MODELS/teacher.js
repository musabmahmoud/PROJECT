const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: String,
    salary: Number,
    owner: { type: String, required: true }, // Must match 'owner' used in routes
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Teacher', teacherSchema);