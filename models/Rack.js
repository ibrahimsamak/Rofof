const Joi = require("joi");
const mongoose = require("mongoose");

const RackSchema = mongoose.Schema(
  {
    rack_no: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isReserved: {
      type: Boolean,
      required: true,
    },
    length: {
      type: Number,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    inventory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "inventory",
    },
    lengthUnit: {
      type: String,
    },
    widthUnit: {
      type: String,
    },
    heightUnit: {
      type: String,
    },
  },
  { versionKey: false }
);

const RackReservationSchema = mongoose.Schema(
  {
    rack_id: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "racks",
        },
      ],
    },
    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "contract",
    },
    renter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "renters",
    },
    renter_type: {
      type: String,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    amount: {
      type: Number,
    },
    contract_no: {
      type: String,
    },
    isApprove: {
      type: Boolean,
    },
    isFinish: {
      type: Boolean,
    },
    ApproveCode:{
      type: String,
      default:""
    },
    isApproveCode:{
      type: Boolean,
      default:false
    },
  },
  { versionKey: false }
);

RackSchema.index({ rack_no: -1});
RackReservationSchema.index({ amount: 1  ,contract_id: 1 });

const racks = mongoose.model("racks", RackSchema);
const reserve = mongoose.model("reserve", RackReservationSchema);

exports.rack = racks;
exports.reserve = reserve;
