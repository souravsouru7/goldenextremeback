const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    hasTicket: {
        type: Boolean,
        required: true,
        default: false
    },
    ticketPrice: {
        type: Number,
        required: function() {
            return this.hasTicket === true;
        },
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    sponsoredBy: {
        type: String,
        required: true,
        trim: true
    },
    media: [{
        type: String,  // URLs to images/videos stored in Cloudinary
        required: true
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema); 