const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// --- DATABASE SCHEMAS ---

// Import Routes
const studentRoutes = require('./ROUTES/students');
const teacherRoutes = require('./ROUTES/teachers');

// Middleware
app.use(express.json());

// Link Routes
app.use('/api/student', studentRoutes);
app.use('/api/teachers', teacherRoutes);

// 1. Teacher Schema (Subject + Salary + Assigned Classes)
const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true }, // e.g., "Physics", "Math"
    salary: { type: Number, default: 0 },
    assignedClasses: [String], // e.g., ["Sec 2 - A", "Sec 1 - B"]
    admin: String // The owner/admin who created this teacher
});

// 2. Student Schema (Language + Grade/Class + Grades + Payments)
const studentSchema = new mongoose.Schema({
    name: String,
    level: String, // Now ranges from "Primary 1" to "Prep 3"
    className: String, // "Class A", "Class B"
    language: { type: String, enum: ['Arabic', 'English'] },
    grades: {
        physics: Number,
        math: Number,
        english: Number,
        arabic: Number,
        discovery: Number, // Primary specific
        religion: Number,
        science: Number,
        socialStudies: Number
    },
    owner: String
});

const Teacher = mongoose.model('Teacher', teacherSchema);
const Student = mongoose.model('Student', studentSchema);

// --- API ROUTES ---

// GET: All Data for a specific Admin (Filtered by Language if needed)
app.get('/api/students', async (req, res) => {
    const { admin, language, level } = req.query;
    let query = { owner: admin };
    if (language) query.language = language;
    if (level) query.level = level;
    
    const students = await Student.find(query);
    res.json(students);
});

// POST: Add Teacher
app.post('/api/teachers', async (req, res) => {
    const newTeacher = new Teacher(req.body);
    await newTeacher.save();
    res.json({ success: true });
});

// GET: All Teachers + Calculate Total Monthly Payroll
app.get('/api/teachers', async (req, res) => {
    const teachers = await Teacher.find({ admin: req.query.admin });
    const totalPayroll = teachers.reduce((acc, t) => acc + t.salary, 0);
    res.json({ teachers, totalPayroll });
});

// POST: Update Student Grade for Specific Subject
app.post('/api/students/:id/grade', async (req, res) => {
    const { subject, value } = req.body; // subject = 'physics', value = 95
    const updatePath = `grades.${subject.toLowerCase()}`;
    await Student.findByIdAndUpdate(req.params.id, { [updatePath]: value });
    res.json({ success: true });
});

// POST: Add Student to Specific Class/Language
app.post('/api/students', async (req, res) => {
    const student = new Student(req.body);
    await student.save();
    res.json(student);
});

mongoose.connect('your_mongodb_connection_string_here')
    .then(() => app.listen(5000, () => console.log("TITAN ENGINE ONLINE ON PORT 5000")));