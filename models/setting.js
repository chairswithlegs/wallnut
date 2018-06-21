const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: Object
});

module.exports = mongoose.model('Setting', settingSchema);