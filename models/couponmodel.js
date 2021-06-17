const Joi = require("joi");
const mongoose = require("mongoose");

const Couponchema = mongoose.Schema(
  {
    coupon: {
      type: String,
      required: [true, "coupon is required"],
    },
    msg: {
      type: String,
      required: [true, "message is required"],
    },
    dt_from: {
      type: Date,
      required: [true, "start date is required"],
    },
    dt_to: {
      type: Date,
      required: [true, "end date is required"],
    },
    discount_rate: {
      type: Number,
      required: [true, "discount rate is required"],
    },
  },
  { versionKey: false }
);

const coupon = mongoose.model("coupons", Couponchema);

function validateCoupon(c) {
  const schema = {
    coupon: Joi.string().required(),
    msg: Joi.string().required(),
    discount_rate: Joi.number().required(),
  };
  return Joi.validate(c, schema);
}

exports.coupon = coupon;
exports.validateCoupon = validateCoupon;
