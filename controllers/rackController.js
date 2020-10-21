// External Dependancies
const boom = require("boom");
const jwt = require("jsonwebtoken");
const config = require("config");
const util = require("util");
const cron = require("node-cron");
const _ = require("underscore");
const lodash = require("lodash");
const async = require("async");
const moment = require("moment");

// Get Data Models
const { rack, reserve } = require("../models/Rack");
const { Product } = require("../models/Product");
const { renters } = require("../models/Driver");
const { sendSMS } = require("../utils/utils");

function makeid() {
  var text = "";
  var possible = "0123456789";

  for (var i = 0; i < 3; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

// cron job for renting racks
exports.FinishingRentRacks = async function FinishingRentRacks() {
  //0 */45 * * * *
  // 0 0 * * *
  cron.schedule(`0 0 * * *`, async () => {
    let today = new Date();
    //, { isFinish: false }
    const reserves = await reserve
      .find({
        $and: [
          {
            end_date: {
              $lte: today,
            },
          },
          {
            isFinish: false,
          },
        ],
      })
      .populate("rack_id");

    for await (const item of reserves) {
      var msg =
        " عميلنا العزيز، نود تذكيركم بأن العقد رقم " +
        item.contract_no +
        " قد انتهت مدته و نرجو منكم زيارة المتجر لتجديد العقد أو أخذ مقتنياتكم في أقرب وقت. ";
      var _user = await renters.findById(item.renter_id);
      sendSMS(_user.phone_number, "", "", msg);

      await reserve.findByIdAndUpdate(
        item._id,
        {
          isFinish: true,
        },
        {
          new: true,
        }
      );

      for await (const reserve_rack of item.rack_id) {
        await rack.findByIdAndUpdate(
          reserve_rack._id,
          {
            isReserved: false,
          },
          {
            new: true,
          }
        );
        Product.updateMany(
          {
            $and: [{ reserve_id: item._id }, { rack_id: reserve_rack._id }],
          },
          {
            status: false,
          },
          function (err, res) {}
        );
      }
    }
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
      .exec(function (err, item) {
        console.log(item);
        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: item,
          pagenation: {
            size: item.length,
            totalElements: total,
            totalPages: Math.floor(total / limit),
            pageNumber: page,
          },
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
      items: _rack,
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
      heightUnit: req.body.heightUnit,
    });

    let rs = await _rack.save();
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: rs,
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
    items: [],
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
        heightUnit: req.body.heightUnit,
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _rack,
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
      .find({ $and: [{ renter_id: req.params.id }] })
      .populate({
        path: "rack_id",
      })
      .populate("renter_id")
      .populate("contract_id")
      .sort({ _id: -1 })
      .exec(function (err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: item,
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
      .exec(function (err, item) {
        console.log(item);
        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: item,
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
      isApprove: true,
      isFinish: false,
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
      items: null,
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.renewReservRack = async (req, reply) => {
  try {
    var first_rack = [];
    let current_year = new Date().getFullYear();
    let contract_no = String(current_year) + makeid();
    var previous_reserve_id = req.body.previous_reserve_id;
    let _reserve = new reserve({
      rack_id: req.body.rack_id,
      renter_id: req.body.renter_id,
      renter_type: req.body.renter_type,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      amount: req.body.amount,
      contract_id: req.body.contract_id,
      contract_no: contract_no,
      isApprove: true,
      isFinish: false,
    });

    for await (const element of req.body.rack_id) {
      await rack.findByIdAndUpdate(
        element,
        { isReserved: true },
        { new: true }
      );
    }

    var rs = await _reserve.save();
    //delete previous reserve
    //console.log("prev_id: " + previous_reserve_id);
    //await reserve.findByIdAndRemove(previous_reserve_id);

    first_rack = rs.rack_id;

    Product.updateMany(
      {
        $and: [
          { by_user_id: req.body.renter_id },
          { reserve_id: previous_reserve_id },
        ],
      },
      {
        status: true,
        reserve_id: rs._id,
        rack_id: first_rack[0],
      },
      function (err, res) {}
    );

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: null,
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
        contract_id: req.body.contract_id,
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _reserve,
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
    items: [],
  };
  return response;
};

exports.rackList = async (req, reply) => {
  try {
    await rack
      .find()
      .sort({ _id: -1 })
      .exec(function (err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: item,
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
      .exec(function (err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: item,
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getRackListNotReservedAndMyRacks = async (req, reply) => {
  try {
    var _reserve = await reserve.findById(req.params.id).populate("rack_id");

    await rack
      .find({ isReserved: false })
      .sort({ _id: -1 })
      .exec(function (err, item) {
        var arr = [];
        item.forEach((element) => {
          arr.push(element);
        });
        _reserve.rack_id.forEach((element) => {
          arr.push(element);
        });

        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: arr,
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
    // if (end_date != "" && end_date != undefined) {
    //   end_date = new Date(end_date);
    //   end_date = end_date.setHours(23, 59, 59, 999);
    //   end_date = new Date(end_date);
    // }
    // if (start_date != "" && start_date != undefined) {
    //   start_date = new Date(start_date);
    //   start_date = start_date.setHours(0, 0, 0, 0);
    //   start_date = new Date(start_date);
    // }
    if (start_date != "" && end_date != "") {
      query = {
        // createAt: {
        //   $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
        //   $lt: new Date(new Date(end_date).setHours(23, 59, 59)),
        // },

        $and: [
          {
            end_date: {
              $lt: new Date(new Date(end_date).setHours(23, 59, 59)),
            },
          },
          {
            start_date: {
              $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
            },
          },
        ],
      };
    }

    await reserve
      .find(query)
      .sort({ start_date: -1 })
      .populate("renter_id")
      .populate({
        path: "rack_id",
      })
      .populate("contract_id")
      // .skip((page - 1) * limit)
      // .limit(limit)
      .exec(function (err, item) {
        console.log(item);
        var result = _.filter(item, function (itm) {
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
            pageNumber: page,
          },
        };
        reply.send(response);
      });
  } catch {
    throw boom.boomify();
  }
};

exports.getRackReserveSeacrhExcel = async (req, reply) => {
  try {
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var query = {};
    if (start_date != "" && end_date != "") {
      query = {
        $and: [
          {
            end_date: {
              $lt: new Date(new Date(end_date).setHours(23, 59, 59)),
            },
          },
          {
            start_date: {
              $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
            },
          },
        ],
      };
    }

    await reserve
      .find(query)
      .sort({ start_date: -1 })
      .populate("renter_id")
      .populate({
        path: "rack_id",
      })
      .populate("contract_id")
      .exec(function (err, item) {
        console.log(item);
        var result = _.filter(item, function (itm) {});
        var result1 = lodash(item)
          .slice(page * limit)
          .take(limit)
          .value();
        const response = {
          items: result1,
          status_code: 200,
          message: "returned successfully",
        };
        reply.send(response);
      });
  } catch {
    throw boom.boomify();
  }
};

// new
exports.getRackReserveAboutToFinish = async (req, reply) => {
  try {
    // const admin_id = req.params.id;

    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    // const total = await Order.find().count();
    var current_date_more_than_10_days = moment().add(10, "days");
    var current_date = moment();
    var total = await reserve
      .find({
        end_date: {
          $gt: current_date,
          $lte: current_date_more_than_10_days,
        },
      })
      .count();

    await reserve
      .find({
        end_date: {
          $gt: current_date,
          $lte: current_date_more_than_10_days,
        },
      })
      .sort({ _id: -1 })
      .populate("renter_id")
      .populate({
        path: "rack_id",
      })
      .populate("contract_id")
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, item) {
        console.log(item);
        const response = {
          items: item,
          status_code: 200,
          message: "returned successfully",
          pagenation: {
            size: item.length,
            totalElements: total,
            totalPages: Math.floor(total / limit),
            pageNumber: page,
          },
        };
        reply.send(response);
      });
  } catch {
    throw boom.boomify();
  }
};

exports.getRackReserveAboutToFinishExcel = async (req, reply) => {
  try {
    // const admin_id = req.params.id;

    // var page = parseFloat(req.query.page, 10);
    // var limit = parseFloat(req.query.limit, 10);
    // const total = await Order.find().count();
    var current_date_more_than_10_days = moment().add(10, "days");
    var current_date = moment();
    // var total = await reserve
    //   .find({
    //     end_date: {
    //       $gt: current_date,
    //       $lte: current_date_more_than_10_days,
    //     },
    //   })
    //   .count();

    await reserve
      .find({
        end_date: {
          $gt: current_date,
          $lte: current_date_more_than_10_days,
        },
      })
      .sort({ _id: -1 })
      .populate("renter_id")
      .populate({
        path: "rack_id",
      })
      .populate("contract_id")
      // .skip(page * limit)
      // .limit(limit)
      .exec(function (err, item) {
        console.log(item);
        const response = {
          items: item,
          status_code: 200,
          message: "returned successfully",
          // pagenation: {
          //   size: item.length,
          //   totalElements: total,
          //   totalPages: Math.floor(total / limit),
          //   pageNumber: page,
          // },
        };
        reply.send(response);
      });
  } catch {
    throw boom.boomify();
  }
};
