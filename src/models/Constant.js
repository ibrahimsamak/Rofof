const Joi = require('joi');
const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: {
    type: String,
    required: true
  }
}, { versionKey: false });

const Socialschema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  data: {
    type: String
  }
}, { versionKey: false });

const settings = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
}, { versionKey: false });


const setting = mongoose.model('options', settings);
const BuyUnits = mongoose.model('Buyunits', schema);
const SocialOption = mongoose.model('SocialOption', Socialschema);
const ContactOption = mongoose.model('ContactOption', Socialschema);
const city = mongoose.model('city', schema);

const StaticPageSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String
  }
}, { versionKey: false });
const StaticPage = mongoose.model('StaticPage', StaticPageSchema);


function validateCustomer(customer) {
  const schema = {
    name: Joi.required(),
  };

  return Joi.validate(customer, schema);
}


exports.setting = setting;
exports.BuyUnits = BuyUnits;
exports.city = city;
exports.ContactOption = ContactOption;
exports.SocialOption = SocialOption;
exports.StaticPage = StaticPage;
exports.validate = validateCustomer;