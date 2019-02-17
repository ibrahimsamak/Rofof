const Joi = require('joi');
const mongoose = require('mongoose');

const Pointchema = mongoose.Schema({
    point_price:{
        type:Number,
        required:true
    },
    supplier_id:{
        type : mongoose.Schema.Types.ObjectId, ref: 'Supplier',
        required:true
    },
    min_value:{type:Number},
    max_value:{type:Number},
    points:{type:Number},

}, { versionKey: false });

const Point = mongoose.model('Point',Pointchema);

exports.Point = Point; 