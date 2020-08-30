const Joi = require("joi");
const mongoose = require("mongoose");
const { getCurrentDateTime } = require("../models/Constant");

const renterschema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    image: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    address: {
      type: String,
    },
    isOnlineSupport: { type: Boolean },
    IBAN: { type: String },
    BankName: { type: String },
    isBlock: {
      type: Boolean,
    },
    createAt: {
      type: Date,
      default: getCurrentDateTime(),
    },
    fcmToken: {
      type: String,
    },
    token: {
      type: String,
    },
    car_name: {
      type: String,
    },
  },
  { versionKey: false }
);

renterschema.index({ supplier_id: 1 });
const renters = mongoose.model("renters", renterschema);

exports.renters = renters;
