const Joi = require("joi");
const mongoose = require("mongoose");

const PaymentSchema = mongoose.Schema(
  {
    by_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "renters" },
    Total: {
      type: Number,
    },
    Admin_Total: {
      type: Number,
    },
    provider_Total: {
      type: Number,
    },
    TotalPaied: {
      type: Number,
    },
    TotalRemain: {
      type: Number,
    },
    createAt: {
      type: Date,
    },
    PeriodMonth: {
      type: Number,
    },
    PeriodYear: {
      type: Number,
    },
    PaymentType: {
      type: Number,
    },
  },
  { versionKey: false }
);

const TempPaymentSchema = mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    amount: { type: Number },
    createAt: { type: Date },
    order_id: { type: String },
    order_no: { type: String },
  },
  { versionKey: false }
);

const PaymnetLog = mongoose.model("paymnetlogs", PaymentSchema);
const TempPayment = mongoose.model("temppayments", TempPaymentSchema);

exports.PaymnetLog = PaymnetLog;
exports.TempPayment = TempPayment;
