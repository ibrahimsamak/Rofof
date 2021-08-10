const Joi = require("joi");
const mongoose = require("mongoose");

const Productschema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
    },
    barcode: {
      type: String,
    },
    rate: {
      type: Number,
    },
    qty: {
      type: Number,
    },
    price: {
      type: Number,
      required: [true, "price is required"],
    },
    image: {
      type: String,
    },
    status: {
      type: Boolean,
    },
    images: {
      type: [String],
    },
    createat: {
      type: Date,
    },
    by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "renters",
    },
    by_admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "category is required"],
    },
    discountPrice: {
      type: Number,
    },
    rack_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "racks",
      required: [true, "rack is required"],
    },
    reserve_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reserve",
      required: [true, "contract is required"],
    },
    isDeleted:{
      type:Boolean
    }
  },
  { versionKey: false }
);

const schema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "title is required"],
  },
  image: {
    type: String,
  },
});

const Supplierschema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "title is required"],
  },
  image: {
    type: String,
  },
  details: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
});

Productschema.index({ category_id: 1 });

const Category = mongoose.model("Category", schema);
const Supplier = mongoose.model("Supplier", Supplierschema);
const Product = mongoose.model("Product", Productschema);

exports.Category = Category;
exports.Supplier = Supplier;
exports.Product = Product;
