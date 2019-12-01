const boom = require("boom");
const util = require("util");

// Get Data Models
const {
  update,
  BuyUnits,
  ContactOption,
  SocialOption,
  StaticPage,
  city,
  setting,
  delivery_time,
  inventory,
  contract
} = require("../models/Constant");
const { client } = require("../models/cache");

exports.getUpdates = async (req, reply) => {
  try {
    const updates = await update.find().sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: updates
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getBuyUnits = async (req, reply) => {
  try {
    // client.get = util.promisify(client.get)
    // const cachedObj = await client.get('BuyUnits')
    // if (cachedObj) {
    //     console.log('serving from cach')
    //     const response = {
    //         status_code: 200,
    //         status: true,
    //         message: 'return succssfully',
    //         items: JSON.parse(cachedObj)
    //     }
    //     return response
    // }
    const buyunits = await BuyUnits.find().sort({ _id: -1 });
    // client.set('BuyUnits', JSON.stringify(buyunits))
    // client.expire('BuyUnits', 86400)
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: buyunits
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getContactOption = async (req, reply) => {
  try {
    const ContactOptions = await ContactOption.find().sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: ContactOptions
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getSocialOption = async (req, reply) => {
  try {
    const SocialOptions = await SocialOption.find().sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: SocialOptions
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getStaticPage = async (req, reply) => {
  try {
    const staticpages = await StaticPage.find().sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: staticpages
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getCity = async (req, reply) => {
  try {
    const cities = await city.find().sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: cities
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getSingleCity = async (req, reply) => {
  try {
    const cities = await city.findById(req.params.id).sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: cities
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getContract = async (req, reply) => {
  try {
    const cities = await contract.find().sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: cities
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getContractDetails = async (req, reply) => {
  try {
    console.log(req.params.id);
    const cities = await contract.findById(req.params.id).sort({ _id: -1 });
    console.log(cities);
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: cities
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getInventory = async (req, reply) => {
  try {
    const cities = await inventory
      .find()
      .populate("city_id")
      .sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: cities
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getSingleInventory = async (req, reply) => {
  try {
    const cities = await inventory.findById(req.params.id).sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: cities
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getSettings = async (req, reply) => {
  try {
    const settings = await setting.find().sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: settings
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getSingleSettings = async (req, reply) => {
  try {
    const settings = await setting.findById(req.params.id);
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: settings
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getdelivery_time = async (req, reply) => {
  try {
    const settings = await delivery_time.find().sort({ isSort: 1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: settings
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// cPanel
exports.adddelivery_time = async (req, reply) => {
  try {
    let _setting = new delivery_time({
      name: req.body.name,
      supplier_id: req.body.supplier_id
    });

    let rs = await _setting.save();
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: rs
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updatedelivery_time = async (req, reply) => {
  try {
    const _city = await delivery_time.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        supplier_id: req.body.supplier_id
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: _city
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deletedelivery_time = async (req, reply) => {
  try {
    const _city = await delivery_time.findByIdAndRemove(req.params.id);

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: []
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addSetting = async (req, reply) => {
  try {
    let _setting = new setting({
      name: req.body.name,
      value: req.body.value,
      max: req.body.max,
      min: req.body.min,
      supplier_id: req.body.supplier_id
    });

    let rs = await _setting.save();
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: rs
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateSetting = async (req, reply) => {
  try {
    const _setting = await setting.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        value: req.body.value,
        max: req.body.max,
        min: req.body.min,
        supplier_id: req.body.supplier_id
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: _setting
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteSetting = async (req, reply) => {
  try {
    await setting.findByIdAndRemove(req.params.id);

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: []
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addCity = async (req, reply) => {
  try {
    let _city = new city({
      name: req.body.name
    });

    let rs = await _city.save();
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: rs
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateCity = async (req, reply) => {
  try {
    const _city = await city.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: _city
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteCity = async (req, reply) => {
  try {
    const _city = await city.findByIdAndRemove(req.params.id);

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: []
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addContract = async (req, reply) => {
  try {
    let _city = new contract({
      name: req.body.name,
      numberOfMonths: req.body.numberOfMonths,
      amount: req.body.amount
    });

    let rs = await _city.save();
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: rs
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateContract = async (req, reply) => {
  try {
    const _city = await contract.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        numberOfMonths: req.body.numberOfMonths,
        amount: req.body.amount
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: _city
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteContract = async (req, reply) => {
  try {
    const _city = await contract.findByIdAndRemove(req.params.id);

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: []
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addInventory = async (req, reply) => {
  try {
    let _city = new inventory({
      name: req.body.name,
      city_id: req.body.city_id
    });

    let rs = await _city.save();
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: rs
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateInventory = async (req, reply) => {
  try {
    const _city = await inventory.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        city_id: req.body.city_id
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: _city
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteInventory = async (req, reply) => {
  try {
    const _city = await inventory.findByIdAndRemove(req.params.id);

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: []
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addSocial = async (req, reply) => {
  try {
    let SocialOptions = new SocialOption({
      name: req.body.name,
      data: req.body.data
    });

    let rs = await SocialOptions.save();
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: rs
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateSocial = async (req, reply) => {
  try {
    const SocialOptions = await SocialOption.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        data: req.body.data
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: SocialOptions
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteSocial = async (req, reply) => {
  try {
    const SocialOptions = await SocialOption.findByIdAndRemove(req.params.id);

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: []
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getSingleStatic = async (req, reply) => {
  try {
    const StaticPages = await StaticPage.findById(req.params.id);
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: StaticPages
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addStatic = async (req, reply) => {
  try {
    let staticpages = new StaticPage({
      title: req.body.title,
      content: req.body.content
    });

    let rs = await staticpages.save();
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: rs
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateStatic = async (req, reply) => {
  try {
    const staticpages = await StaticPage.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content
      },
      { new: true }
    );
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: staticpages
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteStatic = async (req, reply) => {
  try {
    const staticpages = await StaticPage.findByIdAndRemove(req.params.id);

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: []
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getSingleContract = async (req, reply) => {
  try {
    const ContactOptions = await ContactOption.find().sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: ContactOptions
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addContact = async (req, reply) => {
  try {
    let ContactOptions = new ContactOption({
      name: req.body.name,
      data: req.body.data
    });

    let rs = await ContactOptions.save();
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: rs
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateContact = async (req, reply) => {
  try {
    const ContactOptions = await ContactOption.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        data: req.body.data
      },
      { new: true }
    );
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: ContactOptions
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteContact = async (req, reply) => {
  try {
    const ContactOptions = await ContactOption.findByIdAndRemove(req.params.id);
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: []
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};
