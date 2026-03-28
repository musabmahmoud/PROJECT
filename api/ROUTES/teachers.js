const express = require('express');
const router = express.Router();
const Teacher = require('../MODELS/teacher');

/**
 * TITAN ERP | FACULTY & PAYROLL MANAGEMENT
 * Syncing UI 'adminId' with Backend 'owner'
 */

// --- 1. GET ALL TEACHERS ---
router.get('/', async (req, res) => {
    // SYNC: We use 'adminId' from the frontend query string
    const { adminId } = req.query; 
    
    try {
        if (!adminId) return res.status(400).json({ error: "Admin ID required" });

        // Find teachers belonging to this admin
        const teachers = await Teacher.find({ owner: adminId });
        
        // Return the array directly to match your frontend render loop
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 2. ADD NEW FACULTY (POST) ---
router.post('/', async (req, res) => {
    try {
        const { name, subject, salary, adminId } = req.body;

        const teacher = new Teacher({
            name,
            subject,
            salary: Number(salary), // Ensure it's a number for calculations
            owner: adminId // This maps the teacher to the logged-in user
        });

        const newTeacher = await teacher.save();
        res.status(201).json(newTeacher);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- 3. DELETE FACULTY (RESOLVE CONTRACT) ---
router.delete('/:id', async (req, res) => {
    const { adminId } = req.query;
    try {
        const deleted = await Teacher.findOneAndDelete({ 
            _id: req.params.id, 
            owner: adminId 
        });

        if (!deleted) return res.status(404).json({ error: "Teacher not found or unauthorized" });
        
        res.json({ success: true, message: "Contract Resolved" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;