const mongoose = require('mongoose');

/**
 * TITAN ERP | ACADEMIC SCHEDULE MODELS
 * Table: Stores the content of each grid cell.
 * TableConfig: Stores the custom list of time slots for each admin.
 */

// 1. The Schema for individual grid cells
const tableSchema = new mongoose.Schema({
    owner: { 
        type: String, 
        required: true,
        index: true // Makes searching by Admin ID faster
    },
    // cellId format: "Level-Group-Language-Time-Day"
    cellId: { 
        type: String, 
        required: true 
    },
    session: {
        sub: { type: String, default: "" },
        teacher: { type: String, default: "" }
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// 2. The Schema for the horizontal time-axis (Timeline)
const configSchema = new mongoose.Schema({
    owner: { 
        type: String, 
        required: true, 
        unique: true 
    },
    slots: {
        type: [String],
        default: ["08:00", "08:45", "09:30", "10:30", "11:15", "12:00"]
    }
});

// We export both models so the Route can use them
const Table = mongoose.model('Table', tableSchema);
const TableConfig = mongoose.model('TableConfig', configSchema);

module.exports = { Table, TableConfig };