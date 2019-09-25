const Joi = require('joi');
const mongoose = require('mongoose');
const { getCurrentDateTime } = require('../models/Constant');

const Orderschema = mongoose.Schema({
    nanaOrderId: { type: String },
    orderFrom: { type: String },
    addressDetails: { type: String },
    orderType: { type: Number },
    lat: { type: Number },
    lng: { type: Number },
    city: { type: String, required: false },
    paymentType: { type: Number },
    deliveryCost: { type: Number },
    subTotal: { type: Number },
    Total: { type: Number, required: false },
    Notes: { type: String, required: false },
    StatusId: { type: Number },
    delivery_date: { type: Date, required: false },
    delivery_time: { type: String, required: false },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: false },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    items: {
        type: [{
            product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            qty: { type: Number },
            price: { type: Number }
        }]
    },
    createAt: {
        type: Date, default: getCurrentDateTime()
    },
    rate: { type: Number, required: false },
    comment: { type: String, required: false },
    isRate: { type: Boolean, required: false },
    rateDate: { type: Date, required: false },
    isOpen: { type: Boolean, required: false }
}, { versionKey: false });


Orderschema.index({ "driver_id": 1, "StatusId": 1 })
Orderschema.index({ "user_id": 1, "StatusId": 1 })
Orderschema.index({ "createAt": 1 })
// Orderschema.index({ "supplier_id": 1 })
const Order = mongoose.model('Order', Orderschema);


exports.Order = Order;
