const express = require('express');
const router = express.Router();
const Teacher = require('../MODELS/teacher');

// GET ALL
router.get('/', async (req, res) => {
    const { adminId } = req.query; 
    try {
        if (!adminId) return res.status(400).json({ error: "Admin ID required" });
        const teachers = await Teacher.find({ owner: adminId });
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD / UPDATE
router.post('/', async (req, res) => {
    try {
        const { name, subject, salary, adminId } = req.body;
        const updatedTeacher = await Teacher.findOneAndUpdate(
            { name, owner: adminId }, 
            { name, subject, salary: Number(salary), owner: adminId },
            { upsert: true, new: true }
        );
        res.status(201).json(updatedTeacher);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    const { adminId } = req.query;
    try {
        await Teacher.findOneAndDelete({ _id: req.params.id, owner: adminId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;