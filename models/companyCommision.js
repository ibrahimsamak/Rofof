const mongoose = require('mongoose');

const companyCommisionSchema = mongoose.Schema({
    supplier_id:{type: mongoose.Schema.Types.ObjectId, ref: 'Supplier'},
    value:{type: Number},
    totalPay:{type:Number},
    dt_date: {type: Date},
    last_date_pay:{type: Date}

}, { versionKey: false });

const _companyCommision = mongoose.model('companyCommision',companyCommisionSchema);
exports.companyCommision = _companyCommision; 
