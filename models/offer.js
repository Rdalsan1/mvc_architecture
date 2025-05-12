const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'Offer amount must be at least 0.01']
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
