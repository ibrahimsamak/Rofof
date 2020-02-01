// External Dependancies
const boom = require("boom");
const jwt = require("jsonwebtoken");
const config = require("config");
const util = require("util");
const cron = require("node-cron");
const _ = require("underscore");
const lodash = require("lodash");
const async = require("async");

// Get Data Models
const { rack, reserve } = require("../models/Rack");

function makeid() {
  var text = "";
  var possible = "0123456789";

  for (var i = 0; i < 3; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

// cron job for renting racks
exports.FinishingRentRacks = async function FinishingRentRacks() {
  cron.schedule(`0 0 0 * * *`, async () => {
    let today = new Date();
    console.log(today);
    const reserves = await reserve.find({ end_date: { $lte: today } });

    async.eachSeries(
      reserves,
      async function updateObject(element, done) {
        console.log(element._id);
        await rack.findByIdAndUpdate(
          element.rack_id,
          { isReserved: false },
          { new: true }
        );
      },
      async function allDone(err) {
        console.log("running a task every minute");
      }
    );
  });
};

// Get all rack
exports.getrack = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);

    const total = await rack.find().count();
    await rack
      .find()
      .populate("inventory_id")
      .sort({ _id: -1 })
      .skip(page * limit)
      .limit(limit)
      .exec(function(err, item) {
        console.log(item);
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item,
          pagenation: {
            size: item.length,
            totalElements: total,
            totalPages: Math.floor(total / limit),
            pageNumber: page
          }
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get single rack by ID
exports.getSinglerack = async (req, reply) => {
  try {
    const _rack = await rack.findById(req.params.id);

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _rack
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Add a new rack
exports.addrack = async (req, reply) => {
  try {
    let _rack = new rack({
      length: req.body.length,
      width: req.body.width,
      height: req.body.height,
      rack_no: req.body.rack_no,
      description: req.body.description,
      isReserved: false,
      inventory_id: req.body.inventory_id,
      lengthUnit: req.body.lengthUnit,
      widthUnit: req.body.widthUnit,
      heightUnit: req.body.heightUnit
    });

    let rs = await _rack.save();
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: rs
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// delete rack
exports.deleterack = async (req, reply) => {
  const _rack = await rack.findByIdAndRemove(req.params.id);
  const response = {
    status_code: 200,
    status: true,
    message: "تمت العملية بنجاح",
    items: []
  };
  return response;
};

// Update an existing rack
exports.updaterack = async (req, reply) => {
  try {
    const _rack = await rack.findByIdAndUpdate(
      req.params.id,
      {
        rack_no: req.body.rack_no,
        description: req.body.description,
        inventory_id: req.body.inventory_id,
        length: req.body.length,
        width: req.body.width,
        height: req.body.height,
        lengthUnit: req.body.lengthUnit,
        widthUnit: req.body.widthUnit,
        heightUnit: req.body.heightUnit
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: _rack
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get all reserve rack by renter id
exports.getReserveRack = async (req, reply) => {
  try {
    await reserve
      .find({ renter_id: req.params.id })
      .populate({
        path: "rack_id"
      })
      .populate("renter_id")
      .populate("contract_id")
      .sort({ _id: -1 })
      .exec(function(err, item) {
        console.log(item);
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getReserveRackById = async (req, reply) => {
  try {
    await reserve
      .findById(req.params.id)
      .sort({ _id: -1 })
      .exec(function(err, item) {
        console.log(item);
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Add a new reserve rack
exports.addReserveRack = async (req, reply) => {
  try {
    let current_year = new Date().getFullYear();
    let contract_no = String(current_year) + makeid();
    let _reserve = new reserve({
      rack_id: req.body.rack_id,
      renter_id: req.body.renter_id,
      renter_type: req.body.renter_type,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      amount: req.body.amount,
      contract_id: req.body.contract_id,
      contract_no: contract_no,
      isApprove: req.body.isApprove
    });

    async.eachSeries(
      req.body.rack_id,
      async function updateObject(element, done) {
        await rack.findByIdAndUpdate(
          element,
          { isReserved: true },
          { new: true }
        );
        await _reserve.save();
      },
      async function allDone(err) {
        console.log("all done");
      }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: null
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing rack
exports.updateReserveRack = async (req, reply) => {
  try {
    console.log(req.body);
    const _reserve = await reserve.findByIdAndUpdate(
      req.params.id,
      {
        renter_type: req.body.renter_type,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        amount: req.body.amount,
        contract_id: req.body.contract_id
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: _reserve
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// delete reserve rack
exports.deleteReserveRack = async (req, reply) => {
  const _reserve = await reserve.findByIdAndRemove(req.params.id);
  await rack.findByIdAndUpdate(
    _reserve.rack_id,
    { isReserved: false },
    { new: true }
  );
  const response = {
    status_code: 200,
    status: true,
    message: "تمت العملية بنجاح",
    items: []
  };
  return response;
};

exports.rackList = async (req, reply) => {
  try {
    await rack
      .find()
      .sort({ _id: -1 })
      .exec(function(err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.rackListNotReserved = async (req, reply) => {
  try {
    await rack
      .find({ isReserved: false })
      .sort({ _id: -1 })
      .exec(function(err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getRackReserveSeacrh = async (req, reply) => {
  try {
    // const admin_id = req.params.id;

    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    // const total = await Order.find().count();
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var query = {};
    if (end_date != "" && end_date != undefined) {
      end_date = new Date(end_date);
      end_date = end_date.setHours(23, 59, 59, 999);
      end_date = new Date(end_date);
    }
    if (start_date != "" && start_date != undefined) {
      start_date = new Date(start_date);
      start_date = start_date.setHours(0, 0, 0, 0);
      start_date = new Date(start_date);
    }
    if (start_date != "" && end_date != "") {
      query = {
        $and: [
          { end_date: { $lt: end_date } },
          { start_date: { $gte: start_date } }
        ]
      };
    }

    console.log(query);
    await reserve
      .find(query)
      .sort({ _id: -1 })
      .populate("renter_id")
      .populate({
        path: "rack_id"
      })
      .populate("contract_id")
      // .skip((page - 1) * limit)
      // .limit(limit)
      .exec(function(err, item) {
        console.log(item);
        var result = _.filter(item, function(itm) {
          // return (
          //   itm.renter_id.name.indexOf(req.body.name) >= 0 ||
          //   itm.renter_id.phone_number.indexOf(req.body.phone_number) >= 0
          // );
        });
        var result1 = lodash(item)
          .slice(page * limit)
          .take(limit)
          .value();
        const response = {
          items: result1,
          status_code: 200,
          message: "returned successfully",
          pagenation: {
            size: result1.length,
            totalElements: result.length,
            totalPages: Math.floor(result.length / limit),
            pageNumber: page
          }
        };
        reply.send(response);
      });
  } catch {
    throw boom.boomify();
  }
};
