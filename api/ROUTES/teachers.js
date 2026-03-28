const express = require('express');
const router = express.Router();
const Teacher = require('../MODELS/teacher');
const Student = require('../MODELS/student');

/**
 * TITAN ERP | FACULTY & PAYROLL MANAGEMENT
 * This route manages teacher records and calculates salaries dynamically.
 */

// --- 1. GET ALL TEACHERS & CALCULATE PAYROLL ---
// This handles the logic for both Fixed and Per-Student salary types.
router.get('/', async (req, res) => {
    const { admin } = req.query;
    try {
        // SECURITY: Only fetch teachers belonging to the logged-in Admin.
        const teachers = await Teacher.find({ owner: admin });
        let totalPayroll = 0;

        // Promise.all is used because we are doing multiple database lookups at once.
        const calculatedTeachers = await Promise.all(teachers.map(async (t) => {
            let finalPay = 0;

            if (t.salaryType === 'Fixed') {
                // Scenario A: Teacher has a flat monthly salary.
                finalPay = t.baseSalary;
            } else {
                // Scenario B: PER-STUDENT LOGIC
                // The system scans the Student collection to count how many students 
                // match the Levels and Languages assigned to this teacher.
                const studentCount = await Student.countDocuments({
                    owner: admin,
                    level: { $in: t.assignedClasses.map(c => c.level) },
                    language: { $in: t.assignedClasses.map(c => c.language) }
                });
                
                // Multiply the live student count by the teacher's commission rate.
                finalPay = studentCount * t.ratePerStudent;
            }

            totalPayroll += finalPay;
            
            // Return the teacher data plus the new 'calculatedPay' field.
            return { ...t._doc, calculatedPay: finalPay };
        }));

        res.json({
            teachers: calculatedTeachers,
            totalPayroll: totalPayroll
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 2. ADD NEW FACULTY (POST) ---
// Triggered when you hire a new teacher in the UI.
router.post('/', async (req, res) => {
    const teacher = new Teacher({
        ...req.body, // Spread operator pulls all fields from the form (name, subject, etc.)
        owner: req.body.owner // Explicitly set the owner for sync security.
    });
    try {
        const newTeacher = await teacher.save();
        res.status(201).json(newTeacher);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;