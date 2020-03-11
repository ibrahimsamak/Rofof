const Joi = require("joi");
const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    }
  },
  { versionKey: false }
);

const tokenschema = mongoose.Schema(
  {
    supplier_id: {
      type: String
    },
    token_id: {
      type: String
    }
  },
  { versionKey: false }
);

const Socialschema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    data: {
      type: String
    }
  },
  { versionKey: false }
);

const settings = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    max: {
      type: String,
      required: true
    },
    min: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  { versionKey: false }
);

const delivery_timeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    isSort: {
      type: Number,
      required: false
    },
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true
    }
  },
  { versionKey: false }
);

const update = mongoose.Schema(
  {
    isAndroid: {
      type: String
    },
    isIOS: {
      type: String
    },
    isDriver: {
      type: String
    }
  },
  { versionKey: false }
);

const StaticPageSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String
    }
  },
  { versionKey: false }
);

const inventorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    city_id: { type: mongoose.Schema.Types.ObjectId, ref: "city" }
  },
  { versionKey: false }
);

const contractSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    numberOfMonths: {
      type: Number
    },
    amount: {
      type: Number
    }
  },
  { versionKey: false }
);
const transportSchema = mongoose.Schema(
  {
    name: {
      type: String
    },
    value: {
      type: Number
    }
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
function validateCustomer(customer) {
  const schema = {
    name: Joi.required()
  };

  return Joi.validate(customer, schema);
}

function getCurrentDateTime() {
  var utc = new Date();
  var current = utc.setHours(utc.getHours() + 3);
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
