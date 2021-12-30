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
const { renters } = require("../models/Renter");
const { sendSMS, handleError, Padder } = require("../utils/utils");
const { extra } = require("../models/Constant");

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

    var query = {};
    if (req.query.name && req.query.name != "") {
      query["rack_no"] = { $regex: new RegExp(req.query.name, "i") };
    }
    
    query["isDeleted"] = false
    var all_racks = await rack.find({isDeleted:false}).lean();
    var all_rack = all_racks.length;
    var reserved_rack = lodash.sumBy(all_racks, function (o) {
      return o.isReserved;
    });
    var free_rack = lodash.sumBy(all_racks, function (o) {
      return !o.isReserved;
    });
 
    const total = await rack.countDocuments(query);
    var item = await rack
      .find(query)
      .populate("inventory_id")
      .sort({ _id: -1 })
      .skip(page * limit)
      .limit(limit);

      const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
      reserved_rack: reserved_rack,
      free_rack: free_rack,
      all_rack: all_rack,
      pagenation: {
        size: item.length,
        totalElements: total,
        totalPages: Math.floor(total / limit),
        pageNumber: page,
      },
    };
    reply.send(response);
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
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Add a new rack
exports.addrack = async (req, reply) => {
  try {
    const prev_rack = await rack.findOne({
      $and:[{rack_no: req.body.rack_no,},{isDeleted:false}]
    });
    if (prev_rack) {
      const response = {
        status_code: 200,
        status: false,
        message: "عذرا الرقم المرجعي موجود مسبقا",
        items: {},
      };
      reply.send(response);
    }
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
      isDeleted:false
    });
    var _return = handleError(_rack.validateSync());
    if (_return.length > 0) {
      reply.code(200).send({
        status_code: 400,
        status: false,
        message: _return[0],
        items: _return,
      });
      return;
    }
    let rs = await _rack.save();
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: rs,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// delete rack
exports.deleterack = async (req, reply) => {
  const _rack = await rack.findByIdAndUpdate(req.params.id,{isDeleted:true},{new:true});
  const response = {
    status_code: 200,
    status: true,
    message: "تمت العملية بنجاح",
    items: [],
  };
  reply.send(response);
};

// Update an existing rack
exports.updaterack = async (req, reply) => {
  try {
    const prev_rack = await rack.findOne({
      $and: [{ rack_no: req.body.rack_no },{isDeleted:false} , { _id: { $ne: req.params.id } }],
    });
    if (prev_rack) {
      const response = {
        status_code: 200,
        status: false,
        message: "عذرا الرقم المرجعي موجود مسبقا",
        items: {},
      };
      reply.send(response);
    }

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
      { new: true, runValidators: true },
      function (err, model) {
        var _return = handleError(err);
        if (_return.length > 0) {
          reply.code(200).send({
            status_code: 400,
            status: false,
            message: _return[0],
            items: _return,
          });
          return;
        }
      }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _rack,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get all reserve rack by renter id
exports.getReserveRack = async (req, reply) => {
  try {
    var item = await reserve
      .find({ $and: [{ renter_id: req.params.id }] })
      .populate({
        path: "rack_id",
      })
      .populate("renter_id")
      .populate("contract_id")
      .sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getReserveRackById = async (req, reply) => {
  try {
    var item = await reserve.findById(req.params.id).sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Add a new reserve rack
exports.addReserveRack = async (req, reply) => {
  try {
    let contract_no = await Padder()
    let newTotal = Number(req.body.amount);
    if(req.body.extras.length > 0){
      let exxtras = await extra.find({_id:{$in:req.body.extras}})
      exxtras.forEach(element => {
        newTotal += Number(element.price)
      });
    }

    let _reserve = new reserve({
      rack_id: req.body.rack_id,
      extras: req.body.extras,
      renter_id: req.body.renter_id,
      renter_type: req.body.renter_type,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      amount: newTotal,
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
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.renewReservRack = async (req, reply) => {
  try {
    var first_rack = [];

    let contract_no = await Padder()


    var previous_reserve_id = req.body.previous_reserve_id;
    let newTotal = Number(req.body.amount);
    if(req.body.extras.length > 0){
      let exxtras = await extra.find({_id:{$in:req.body.extras}})
      exxtras.forEach(element => {
        newTotal += Number(element.price)
      });
    }
    let _reserve = new reserve({
      rack_id: req.body.rack_id,
      renter_id: req.body.renter_id,
      renter_type: req.body.renter_type,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      amount: newTotal,
      contract_id: req.body.contract_id,
      contract_no: contract_no,
      extras: req.body.extras,
      isApprove: true,
      isFinish: false,
    });

    for await (const element of req.body.rack_id) {
      await rack.findByIdAndUpdate(element,{ isReserved: true },{ new: true });
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
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing rack
exports.updateReserveRack = async (req, reply) => {
  try {
    
    let newTotal = Number(req.body.amount);
    if(req.body.extras.length > 0){
      let exxtras = await extra.find({_id:{$in:req.body.extras}})
      exxtras.forEach(element => {
        newTotal += Number(element.price)
      });
    }

    const _reserve = await reserve.findByIdAndUpdate(
      req.params.id,
      {
        renter_type: req.body.renter_type,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        amount: newTotal,
        contract_id: req.body.contract_id,
        extras: req.body.extras,
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _reserve,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// delete reserve rack
exports.deleteReserveRack = async (req, reply) => {
  const _reserve = await reserve.findByIdAndRemove(req.params.id);
  rack.updateMany(
    { _id: { $in: _reserve.rack_id } },
    { isReserved: false },
    function (err, res) {}
  );

  Product.updateMany(
    {
      $and: [
        { rack_id: { $in: _reserve.rack_id } },
        { by_user_id: _reserve.renter_id },
      ],
    },
    { status: false },
    function (err, res) {}
  );
  const response = {
    status_code: 200,
    status: true,
    message: "تمت العملية بنجاح",
    items: [],
  };
  reply.send(response);
};

exports.rackList = async (req, reply) => {
  try {
    var item = await rack.find({isDeleted:false}).sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.rackListNotReserved = async (req, reply) => {
  try {
    var item = await rack.find({ $and:[{isReserved: false},{isDeleted:false}] }).sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getRackListNotReservedAndMyRacks = async (req, reply) => {
  try {
    var _reserve = await reserve.findById(req.params.id).populate("rack_id");

    var item = await rack.find({ $and:[{isReserved: false},{isDeleted:false}] }).sort({ _id: -1 });
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
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getRackReserveSeacrh = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var query = {};

    let sort_value = req.body.sort_value;
    let sort_field = req.body.sort_field;

    let sort = {};
    sort[sort_field] = Number(sort_value);

    if (start_date != "" && end_date != "") {
      query = {
        $and: [
          {
            start_date: {
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


    var all_racks = await reserve.find(query).lean();
    var count_racks = await rack.count({$and:[{isReserved:true},{isDeleted:false}]})
   
    var total_reserved_racks = lodash.sumBy(all_racks, function (o) {
      return o.amount;
    });

    var total = await reserve.countDocuments(query);
    var item = await reserve
      .find(query)
      .sort(sort)
      .populate("renter_id")
      .populate({
        path: "rack_id",
      })
      .populate({
        path: "extras",
      })
      .populate("contract_id")
      .skip(page * limit)
      .limit(limit);

      var newItems = []
      item.forEach(element => {
        let new_item = element.toObject()
        var newTotalExtra = 0;
        element.extras.forEach(_element => {
          newTotalExtra += _element.price;
        });
        new_item.extra_total = newTotalExtra
        newItems.push(new_item)
      });
    
    const response = {
      items: newItems,
      status_code: 200,
      status: true,
      message: "returned successfully",
      total_reserved_racks:total_reserved_racks,
      count_racks:count_racks,
      pagenation: {
        size: item.length,
        totalElements: total,
        totalPages: Math.floor(total / limit),
        pageNumber: page,
      },
    };
    reply.send(response);
  } catch {
    throw boom.boomify();
  }
};

exports.getRackReserveSeacrhExcel = async (req, reply) => {
  try {
    var query = {};
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;

    let sort_value = req.body.sort_value;
    let sort_field = req.body.sort_field;

    let sort = {};
    sort[sort_field] = Number(sort_value);

    if (start_date != "" && end_date != "") {
      query = {
        $and: [
          {
            start_date: {
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

    var item = await reserve
      .find(query)
      .sort(sort)
      .populate("renter_id")
      .populate({
        path: "rack_id",
      })
      .populate("contract_id");
    const response = {
      status: true,
      items: item,
      status_code: 200,
      message: "returned successfully",
    };
    reply.send(response);
  } catch {
    throw boom.boomify();
  }
};

// new
exports.getRackReserveAboutToFinish = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    var current_date_more_than_10_days = moment().add(10, "days");
    var current_date = moment();

    let query1 = {$and:[{}]};
    if (req.body.status && req.body.status != "" && req.body.status == "0" ) {
      query1.$and.push({ end_date: {
          $gt: current_date,
          $lte: current_date_more_than_10_days,
      }});
    }
    if (req.body.status && req.body.status != "" && req.body.status == "1" ) {
      query1.$and.push({isFinish:false});
    }
    if (req.body.status && req.body.status != "" && req.body.status == "2" ) {
      query1.$and.push({isFinish:true});
    }
    if (req.body.by_user_id && req.body.by_user_id != "") {
      query1.$and.push({renter_id: req.body.by_user_id});
    }
    if (req.body.contract_no && req.body.contract_no != "") {
      query1.$and.push({contract_no:req.body.contract_no});
    }
    if (req.body.rack_id && req.body.rack_id != "") {
      let racks = await rack.find({$and:[{rack_no:req.body.rack_id},{isDeleted:false}]})
      query1.$and.push({rack_id:{$in:racks}});
    }
    

    var total = await reserve.countDocuments(query1)

    var item = await reserve
      .find(query1)
      .sort({ end_date: 1 })
      .populate("renter_id")
      .populate({
        path: "rack_id",
      })
      .populate("contract_id")
      .skip(page * limit)
      .limit(limit);
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
  } catch {
    throw boom.boomify();
  }
};

exports.getRackReserveAboutToFinishExcel = async (req, reply) => {
  try {
    var current_date_more_than_10_days = moment().add(10, "days");
    var current_date = moment();

    let query1 = {$and:[{}]};
    if (req.body.status && req.body.status != "" && req.body.status == "0" ) {
      query1.$and.push({ end_date: {
          $gt: current_date,
          $lte: current_date_more_than_10_days,
      }});
    }
    if (req.body.status && req.body.status != "" && req.body.status == "1" ) {
      query1.$and.push({isFinish:false});
    }
    if (req.body.status && req.body.status != "" && req.body.status == "2" ) {
      query1.$and.push({isFinish:true});
    }
    if (req.body.by_user_id && req.body.by_user_id != "") {
      query1.$and.push({by_user_id:req.body.by_user_id});
    }
    if (req.body.contract_no && req.body.contract_no != "") {
      query1.$and.push({contract_no:req.body.contract_no});
    }
    if (req.body.rack_id && req.body.rack_id != "") {
      query1.$and.push({rack_id:{$in:[req.body.rack_id]}});
    }

    var item = await reserve
      .find(query1)
      .sort({ end_date: 1 })
      .populate("renter_id")
      .populate({
        path: "rack_id",
      })
      .populate("contract_id");
    const response = {
      items: item,
      status_code: 200,
      message: "returned successfully",
    };
    reply.send(response);
  } catch {
    throw boom.boomify();
  }
};



