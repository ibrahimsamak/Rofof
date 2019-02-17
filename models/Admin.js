

const Joi = require('joi');
const mongoose = require('mongoose');

const Adminschema = mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: false
    },
    token:{
        type: String,
        required: false
    },
    fcmToken:{
        type: String,
        required: false
    },
    roles:{
        type: [{name:{type:String}}]
    }
}, { versionKey: false });

const Admin = mongoose.model('Admin', Adminschema);

exports.Admin = Admin; 
