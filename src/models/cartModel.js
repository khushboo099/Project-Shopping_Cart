const mongoose = require('mongoose')
let ObjectId = mongoose.Schema.Types.ObjectId


const cartSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [{
        productId: { type: ObjectId, ref: 'products' },
        quantity: { type: Number, minLen: 1 },
        _id: false
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Cart', cartSchema)


