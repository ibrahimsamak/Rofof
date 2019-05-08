const Joi = require('joi');
const mongoose = require('mongoose');

const Productschema = mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    rate: {
        type: Number,
        required: false
    },
    price: {
        type: Number,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    warrenty: {
        type: String,
        required: false
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Category'
    },
    createat: {
        type: Date
    },
    isNewProduct: {
        type: Boolean,
        required: false
    },
    isReplacement: {
        type: Boolean,
        required: false
    },
    isSort: {
        type: Number,
        required: false
    }
}, { versionKey: false });

const schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

const Supplierschema = mongoose.Schema({
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
    email: {
        type: String
    },
    password: {
        type: String
    }
});


Productschema.index({ "category_id": 1 })

const Category = mongoose.model('Category', schema);
const Supplier = mongoose.model('Supplier', Supplierschema);
const Product = mongoose.model('Product', Productschema);

exports.Category = Category;
exports.Supplier = Supplier;
exports.Product = Product;