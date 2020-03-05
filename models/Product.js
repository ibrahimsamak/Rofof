const Joi = require("joi");
const mongoose = require("mongoose");

const Productschema = mongoose.Schema(
  {
    name: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    },
    barcode: {
      type: String
    },
    rate: {
      type: Number
    },
    qty: {
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
    status: {
      type: Boolean
    },
    images: {
      type: [String]
    },
    createat: {
      type: Date
    },
    by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "renters"
    },
    by_admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins"
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    discountPrice: {
      type: Number
    }
  },
  { versionKey: false }
);

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

Productschema.index({ category_id: 1 });

const Category = mongoose.model("Category", schema);
const Supplier = mongoose.model("Supplier", Supplierschema);
const Product = mongoose.model("Product", Productschema);

exports.Category = Category;
exports.Supplier = Supplier;
exports.Product = Product;
