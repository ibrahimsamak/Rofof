const Joi = require("joi");
const mongoose = require("mongoose");
const { getCurrentDateTime } = require("../models/Constant");

const favSchema = mongoose.Schema(
  {
    createAt: { type: Date },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
  },
  { versionKey: false }
);

const Favorit = mongoose.model("Favorit", favSchema);

exports.Favorit = Favorit;
