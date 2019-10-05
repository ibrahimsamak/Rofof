const mongoose = require('mongoose');

const UserPointchema = mongoose.Schema({
    user_id:{type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    supplier_id:{type: mongoose.Schema.Types.ObjectId, ref: 'Supplier'},
    points:{type: Number},
    point_price:{type:Number},

}, { versionKey: false });

const UserPoint = mongoose.model('UserPoint',UserPointchema);
exports.UserPoint = UserPoint; 
