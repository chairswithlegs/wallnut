const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: String },
    date: { type: Date }
});

module.exports = mongoose.model('Post', postSchema);