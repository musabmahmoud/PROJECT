const express = require('express');
const router = express.Router();
const { Table, TableConfig } = require('../MODELS/table');

// Get the grid data
router.get('/', async (req, res) => {
    try {
        const entries = await Table.find({ owner: req.query.adminId });
        const map = {};
        entries.forEach(e => { map[e.cellId] = e.session; });
        res.json(map);
    } catch (err) { res.status(500).json(err); }
});

// Save a session
router.post('/', async (req, res) => {
    const { adminId, cellId, session } = req.body;
    try {
        await Table.findOneAndUpdate(
            { owner: adminId, cellId },
            { session },
            { upsert: true }
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json(err); }
});

// Get/Save Time Slots (The flexible part)
router.get('/config/times', async (req, res) => {
    const config = await TableConfig.findOne({ owner: req.query.adminId });
    res.json(config || { slots: ["08:00", "08:45", "09:30", "10:30", "11:15", "12:00"] });
});

router.post('/config/times', async (req, res) => {
    await TableConfig.findOneAndUpdate(
        { owner: req.body.adminId },
        { slots: req.body.slots },
        { upsert: true }
    );
    res.json({ success: true });
});

module.exports = router;