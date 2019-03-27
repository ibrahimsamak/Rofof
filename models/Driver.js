

const Joi = require('joi');
const mongoose = require('mongoose');

const Driverschema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    supplier_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Supplier',
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    images: {
        type: [String]
    },
    dt_dob: {
        type: Date,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false
    },
    isBlock: {
        type: Boolean,
        required: false
    },
    driver_status: {
        type: Boolean,
        required: false
    },
    createAt: {
        type: Date, default: new Date()
    },
    fcmToken: {
        type: String,
        required: false
    },
    token: {
        type: String,
        required: false
    },
    car_name: {
        type: String,
        required: false
    },
    car_color: {
        type: String,
        required: false
    },
    car_number: {
        type: String,
        required: false
    }
    
}, { versionKey: false });

const Driver = mongoose.model('Driver', Driverschema);

exports.Drivers = Driver; 
