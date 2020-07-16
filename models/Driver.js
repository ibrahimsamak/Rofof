const Joi = require("joi");
const mongoose = require("mongoose");
const { getCurrentDateTime } = require("../models/Constant");

const renterschema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    isOnlineSupport: { type: Boolean },
    IBAN: { type: String },
    BankName: { type: String },
    isBlock: {
      type: Boolean,
      required: false,
    },
    createAt: {
      type: Date,
      default: getCurrentDateTime(),
    },
    fcmToken: {
      type: String,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
    car_name: {
      type: String,
      required: false,
    },
  },
  { versionKey: false }
);

renterschema.index({ supplier_id: 1 });
const renters = mongoose.model("renters", renterschema);

exports.renters = renters;
