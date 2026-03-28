const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    owner: String,
    cellId: String,
    session: { sub: String, teacher: String }
});

const configSchema = new mongoose.Schema({
    owner: { type: String, unique: true },
    slots: [String]
});

module.exports = { 
    Table: mongoose.model('Table', tableSchema), 
    TableConfig: mongoose.model('TableConfig', configSchema) 
};