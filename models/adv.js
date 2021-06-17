const Joi = require("joi");
const mongoose = require("mongoose");

const Advschema = mongoose.Schema(
  {
    image: {
      type: String,
    },
    ads_for: {
      type: String,
    },
    createAt: {
      type: Date,
    },
    is_ads_redirect_to_store: {
      type: Boolean,
    },
    url: {
      type: String,
    },
    store_id: {
      type: String,
    },
    product_id: {
      type: String,
    },
    is_ads_have_expiry_date: {
      type: Boolean,
    },
    by: {
      type: String,
    },
    name: {
      type: String,
    },
  },
  { versionKey: false }
);

const Adv = mongoose.model("advs", Advschema);

exports.Adv = Adv;
