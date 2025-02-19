const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const resetCodeSchema = new Schema({
    userId: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 // Expires in 15 minutes
    }
});

module.exports = model('ResetCode', resetCodeSchema);
