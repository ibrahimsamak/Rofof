const Joi = require('joi');
const mongoose = require('mongoose');

const Couponchema = mongoose.Schema({
    coupon: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    dt_from: {
        type: Date,
        required: true
    },
    dt_to: {
        type: Date,
        required: true
    },
    discount_rate: {
        type: Number,
        required: true
    }
}, { versionKey: false });

const coupon = mongoose.model('coupons', Couponchema);

function validateCoupon(c) {
    const schema = {
        coupon: Joi.string().required(),
        msg: Joi.string().required(),
        discount_rate: Joi.number().required()
    };
    return Joi.validate(c, schema);
}

exports.coupon = coupon;
exports.validateCoupon = validateCoupon;