const Joi = require("joi");
const mongoose = require("mongoose");

const userRateSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users"
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },
    comment: {
      type: String
    },
    rate: {
      type: Number,
      required: true
    },
    isCommentApproved: {
      type: Boolean
    },
    createAt: { type: Date }
  },
  { versionKey: false }
);

const prodcutCommentSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users"
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    comment: {
      type: String
    },
    isCommentApproved: {
      type: Boolean
    },
    createAt: { type: Date }
  },
  { versionKey: false }
);

const userRate = mongoose.model("userRate", userRateSchema);
const prodcutComment = mongoose.model("prodcutComment", prodcutCommentSchema);

exports.userRate = userRate;
exports.prodcutComment = prodcutComment;
