// External Dependancies
const boom = require("boom");

// Get Data Models
const { coupon } = require("../models/couponmodel");
const { Order } = require("../models/Order");
const { getCurrentDateTime } = require("../models/Constant");

// Get all coupon
exports.getcoupon = async (req, reply) => {
  try {
    const coupons = await coupon.find().sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: coupons,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get single coupon by ID
exports.getSinglecoupon = async (req, reply) => {
  try {
    const sp = await coupon.findById(req.params.id);
    return sp;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Add a new coupon
exports.addcoupon = async (req, reply) => {
  try {
    let _coupon = new coupon({
      coupon: req.body.coupon,
      msg: req.body.msg,
      dt_from: req.body.dt_from,
      dt_to: req.body.dt_to,
      discount_rate: req.body.discount_rate,
    });

    let rs = await _coupon.save();
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

// delete coupon
exports.deletecoupon = async (req, reply) => {
  const _coupon = await coupon.findByIdAndRemove(req.params.id);
  const response = {
    status_code: 200,
    status: true,
    message: "تمت العملية بنجاح",
    items: [],
  };
  reply.send(response);
};

// Update an existing adv
exports.updatecoupon = async (req, reply) => {
  try {
    const _coupon = await coupon.findByIdAndUpdate(
      req.params.id,
      {
        coupon: req.body.coupon,
        msg: req.body.msg,
        dt_from: req.body.dt_from,
        dt_to: req.body.dt_to,
        discount_rate: req.body.discount_rate,
      },
      { new: true }
    );
    return _coupon;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Check Coupon
exports.checkCoupon = async (req, reply) => {
  try {
    const user_id = req.user._id;
    const sp = await coupon.findOne({
      $and: [
        { dt_from: { $lte: getCurrentDateTime() } },
        { dt_to: { $gte: getCurrentDateTime() } },
        { coupon: req.body.coupon },
      ],
    });
    if (sp) {
      const myReq = await Order.find({
        $and: [{ coupon: req.body.coupon }, { user_id: user_id }],
      }).count();
      console.log("ts" + myReq);
      if (myReq == 1) {
        const response = {
          items: [],
          status_code: 400,
          message: "الكوبون غير صالح حاليا",
        };
        reply.send(response);
      } else {
        const response = {
          items: sp,
          status_code: 200,
          message: "الكوبون متاح",
        };
        reply.send(response);
      }
    } else {
      const response = {
        items: [],
        status_code: 400,
        message: "الكوبون غير صالح حاليا",
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};
