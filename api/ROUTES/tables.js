const express = require('express');
const router = express.Router();
const { Table, TableConfig } = require('../MODELS/table');

// 1. GET GRID DATA
router.get('/', async (req, res) => {
    try {
        const { adminId } = req.query;
        if (!adminId) return res.status(400).json({ error: "Missing adminId" });

        const entries = await Table.find({ owner: adminId });
        const map = {};
        entries.forEach(e => { 
            if (e.cellId) map[e.cellId] = e.session; 
        });
        res.json(map);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 2. SAVE OR UPDATE SESSION (The Critical Fix)
router.post('/', async (req, res) => {
    const { adminId, cellId, session } = req.body;
    
    if (!adminId || !cellId) {
        return res.status(400).json({ error: "Missing adminId or cellId" });
    }

    try {
        // If session is null, delete the entry
        if (!session || (!session.sub && !session.teacher)) {
            await Table.findOneAndDelete({ owner: adminId, cellId });
            return res.json({ success: true, message: "Deleted" });
        }

        // FIX: You must include 'owner' and 'cellId' in the update object 
        // so that if it's an 'upsert' (new record), those fields are set.
        const updated = await Table.findOneAndUpdate(
            { owner: adminId, cellId },
            { 
                owner: adminId, // Added for upsert safety
                cellId: cellId, // Added for upsert safety
                session, 
                updatedAt: new Date() 
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json(updated);
    } catch (err) {
        console.error("🔥 Save Error:", err);
        res.status(500).json({ message: "Database Error", error: err.message });
    }
});

// 3. GET TIME SLOTS
router.get('/config/times', async (req, res) => {
    try {
        const config = await TableConfig.findOne({ owner: req.query.adminId });
        // Return default slots if none found in DB
        res.json(config || { slots: ["08:00", "08:45", "09:30", "10:30", "11:15", "12:00"] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. SAVE TIME SLOTS
router.post('/config/times', async (req, res) => {
    try {
        const { adminId, slots } = req.body;
        await TableConfig.findOneAndUpdate(
            { owner: adminId },
            { owner: adminId, slots: slots }, // Include owner for upsert
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;