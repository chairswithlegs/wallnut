const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    authorId: { type: String, required: true },
    date: { type: Date, required: false }
});

module.exports = mongoose.Model('Post', postSchema);