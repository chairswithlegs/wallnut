const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: Object,
    themeSetting: { type: Boolean, required: true }
});

module.exports = mongoose.model('Setting', settingSchema);