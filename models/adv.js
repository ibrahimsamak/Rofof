const Joi = require('joi');
const mongoose = require('mongoose');

const Advschema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    details: {
        type: String
    },
    type: {
        type: String
    },
    price_after: {
        type: Number
    },
    price_before: {
        type: Number
    }
}, { versionKey: false });

const Adv = mongoose.model('advs', Advschema);

function validateAdv(c) {
    const schema = {
        name: Joi.string().required(),
        image: Joi.string().required()
    };
    return Joi.validate(c, schema);
}

exports.Adv = Adv;
exports.validateAdv = validateAdv;