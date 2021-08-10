const Joi = require("joi");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

const extraSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "title is required"],
    },
    price: {
      type: Number,
      required: [true, "price is required"],
    },
  },
  { versionKey: false }
);


const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "title is required"],
    },
  },
  { versionKey: false }
);

const tokenschema = mongoose.Schema(
  {
    supplier_id: {
      type: String,
    },
    token_id: {
      type: String,
    },
  },
  { versionKey: false }
);

const Socialschema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "title is required"],
    },
    data: {
      type: String,
    },
  },
  { versionKey: false }
);

const settings = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "title is required"],
    },
    max: {
      type: String,
      required: [true, "max is required"],
    },
    min: {
      type: String,
      required: [true, "min is required"],
    },
    value: {
      type: String,
      required: [true, "value is required"],
    },
  },
  { versionKey: false }
);

const delivery_timeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "title is required"],
    },
    isSort: {
      type: Number,
      required: [true, "sort is required"],
    },
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "supplier is required"],
    },
  },
  { versionKey: false }
);

const update = mongoose.Schema(
  {
    isAndroid: {
      type: String,
    },
    isIOS: {
      type: String,
    },
    isDriver: {
      type: String,
    },
  },
  { versionKey: false }
);

const StaticPageSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    content: {
      type: String,
    },
  },
  { versionKey: false }
);

const inventorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "title is required"],
    },
    city_id: { type: mongoose.Schema.Types.ObjectId, ref: "city" },
  },
  { versionKey: false }
);

const contractSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "title is required"],
    },
    numberOfMonths: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    value: {
      type: String,
      required: [true, "value is required"],
    },
  },
  { versionKey: false }
);

const transportSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "title is required"],
    },
    value: {
      type: Number,
      required: [true, "value is required"],
    },
  },
  { versionKey: false }
);

const updates = mongoose.model("updates", update);
const setting = mongoose.model("options", settings);
const BuyUnits = mongoose.model("Buyunits", schema);
const SocialOption = mongoose.model("SocialOption", Socialschema);
const ContactOption = mongoose.model("ContactOption", Socialschema);
const city = mongoose.model("city", schema);
const contract = mongoose.model("contract", contractSchema);
const delivery_time = mongoose.model("deliveryTime", delivery_timeSchema);
const tokens = mongoose.model("tokens", tokenschema);
const StaticPage = mongoose.model("StaticPage", StaticPageSchema);
const inventory = mongoose.model("inventory", inventorySchema);
const transport = mongoose.model("transport", transportSchema);
const extra = mongoose.model("extra", extraSchema);

function validateCustomer(customer) {
  const schema = {
    name: Joi.required(),
  };

  return Joi.validate(customer, schema);
}

function getCurrentDateTime() {
  var current = moment().tz("Asia/Riyadh");
  return current;
}

exports.update = updates;
exports.delivery_time = delivery_time;
exports.setting = setting;
exports.BuyUnits = BuyUnits;
exports.city = city;
exports.ContactOption = ContactOption;
exports.SocialOption = SocialOption;
exports.StaticPage = StaticPage;
exports.validate = validateCustomer;
exports.getCurrentDateTime = getCurrentDateTime;
exports.tokens = tokens;
exports.inventory = inventory;
exports.contract = contract;
exports.transport = transport;
exports.extra = extra