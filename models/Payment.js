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

const TransactionSchema = mongoose.Schema(
  {
    order_no: { type: String },
    reserve_id: { type: mongoose.Schema.Types.ObjectId,ref: "reserve"},   
    provider_id: { type: mongoose.Schema.Types.ObjectId, ref: "renters" },
    amount: { type: Number},
    createAt: { type: Date},
    type:{
      type:String,
      enum:["worthy","paid","admin"]
    },
    note: { type: String},
  },
  { versionKey: false }
);

TransactionSchema.index({ reserve_id: 1, provider_id: 1 });


const PaymnetLog = mongoose.model("paymnetlogs", PaymentSchema);
const TempPayment = mongoose.model("temppayments", TempPaymentSchema);
const Transaction = mongoose.model("transaction", TransactionSchema);

exports.PaymnetLog = PaymnetLog;
exports.TempPayment = TempPayment;
exports.Transaction = Transaction;