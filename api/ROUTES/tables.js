const express = require('express');
const router = express.Router();
const { Table, TableConfig } = require('../MODELS/table');

/**
 * TITAN ERP | ACADEMIC SCHEDULE ROUTE
 * Handles Grid Sessions and Timeline Configurations.
 */

// --- 1. GET FULL SCHEDULE ---
router.get('/', async (req, res) => {
    const { adminId } = req.query;
    try {
        if (!adminId) return res.status(400).json({ error: "Admin ID required" });

        const entries = await Table.find({ owner: adminId });
        
        // Convert the database array into an object for the frontend:
        // { "cellId": { sub: "Math", teacher: "Mr. Smith" } }
        const scheduleMap = {};
        entries.forEach(e => {
            if (e.session) {
                scheduleMap[e.cellId] = e.session;
            }
        });
        
        res.json(scheduleMap);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch schedule" });
    }
});

// --- 2. SAVE OR DELETE SESSION ---
router.post('/', async (req, res) => {
    const { adminId, cellId, session } = req.body;
    try {
        if (!session || !session.sub) {
            // If the subject is empty, we remove that cell from the DB
            await Table.findOneAndDelete({ owner: adminId, cellId });
            return res.json({ message: "Session cleared" });
        }

        // Update existing or create new (upsert)
        const updated = await Table.findOneAndUpdate(
            { owner: adminId, cellId },
            { session, updatedAt: new Date() },
            { upsert: true, new: true }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Sync failed" });
    }
});

// --- 3. TIMELINE: GET CUSTOM SLOTS ---
router.get('/config/times', async (req, res) => {
    const { adminId } = req.query;
    try {
        const config = await TableConfig.findOne({ owner: adminId });
        res.json(config || { slots: ["08:00", "08:45", "09:30", "10:30", "11:15", "12:00"] });
    } catch (err) {
        res.status(500).json({ error: "Failed to load timeline" });
    }
});

// --- 4. TIMELINE: SAVE CUSTOM SLOTS ---
router.post('/config/times', async (req, res) => {
    const { adminId, slots } = req.body;
    try {
        const updatedConfig = await TableConfig.findOneAndUpdate(
            { owner: adminId },
            { slots },
            { upsert: true, new: true }
        );
        res.json(updatedConfig);
    } catch (err) {
        res.status(500).json({ error: "Timeline sync failed" });
    }
});

module.exports = router;