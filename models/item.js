const mongoose = require('mongoose');
const Schema = mongoose.Schema.Types.ObjectId;

const itemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    seller: { type: Schema, ref: 'User', required: true },
    condition: { type: String, required: true, enum: ['New', 'Used', 'Refurbished'] },
    price: { type: Number, required: true, min: 0.01 },
    details: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    totalOffers: { type: Number, default: 0 },
    highestOffer: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    },
    {timestamps: true}
);

module.exports = mongoose.model('Item', itemSchema);

