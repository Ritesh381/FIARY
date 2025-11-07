const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemorySchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    photos: [{
        type: String
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {timestamps:true});

module.exports = mongoose.model("Memory", MemorySchema);