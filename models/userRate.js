

const Joi = require('joi');
const mongoose = require('mongoose');

const userRateSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    product_id: {
        type: String,
        required: true
    },
    order_id: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        required: true
    }
}, { versionKey: false });

const userRate = mongoose.model('userRate', userRateSchema);

exports.userRate = userRate; 
