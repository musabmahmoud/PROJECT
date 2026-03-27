const express = require('express');
const router = express.Router();
const Teacher = require('../MODELS/teacher');
const Student = require('../MODELS/student');

router.get('/', async (req, res) => {
    const { admin } = req.query;
    try {
        const teachers = await Teacher.find({ owner: admin });
        let totalPayroll = 0;

        const calculatedTeachers = await Promise.all(teachers.map(async (t) => {
            let finalPay = 0;

            if (t.salaryType === 'Fixed') {
                finalPay = t.baseSalary;
            } else {
                // PER-STUDENT LOGIC
                // Count students who are in the classes this teacher is assigned to
                const studentCount = await Student.countDocuments({
                    owner: admin,
                    level: { $in: t.assignedClasses.map(c => c.level) },
                    language: { $in: t.assignedClasses.map(c => c.language) }
                });
                finalPay = studentCount * t.ratePerStudent;
            }

            totalPayroll += finalPay;
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

// POST: Add New Faculty
router.post('/', async (req, res) => {
    const teacher = new Teacher({
        ...req.body,
        owner: req.body.owner
    });
    try {
        const newTeacher = await teacher.save();
        res.status(201).json(newTeacher);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;