// External Dependancies
const boom = require("boom");
const NodeGeocoder = require("node-geocoder");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const geolib = require("geolib");
const _ = require("underscore");
const lodash = require("lodash");
const GeoFire = require("geofire");
const firebase = require("firebase");
const async = require("async");
const moment = require("moment");
const request = require("request");
const axios = require("axios");
const mongoose = require("mongoose");

var config = {
  apiKey: "AIzaSyABN7HaigdqFPQx9un5pngBD7w6w2Cz5_E",
  authDomain: "gazapp-4e160.firebaseapp.com",
  databaseURL: "https://gazapp-4e160.firebaseio.com",
  projectId: "gazapp-4e160",
  storageBucket: "gazapp-4e160.appspot.com",
  messagingSenderId: "239118239090",
};
firebase.initializeApp(config);

var firebaseRef = firebase.database().ref();
// Create a GeoFire index
var geoFire = new GeoFire(firebaseRef);
var ref = geoFire.ref(); // ref === firebaseRef

// Get Data Models
const { Order } = require("../models/Order");
const { Admin } = require("../models/Admin");
const { Notifications } = require("../models/Notifications");
const { renters } = require("../models/Renter");
const { sendSMS, addTransaction, makeid } = require("../utils/utils");
const {
  BuyUnits,
  ContactOption,
  SocialOption,
  StaticPage,
  city,
  setting,
  contract,
} = require("../models/Constant");
const { Product, Category } = require("../models/Product");
const { userRate, prodcutComment } = require("../models/userRate");
const { getCurrentDateTime } = require("../models/Constant");
const { coupon } = require("../models/couponmodel");
const { tokens } = require("../models/Constant");
const { PaymnetLog, TempPayment, Transaction } = require("../models/Payment");
const { reserve } = require("../models/Rack");

const options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: "AIzaSyDP-XwnS5Daa_uSFZJvY6H0hsKaOxe2ar0",
  formatter: null,
};
const geocoder = NodeGeocoder(options);

// add new order of products
// order type : 1 - product , 2 - refill , 3 - gaz Tunck , 4 - gaz Product

exports.addOrder = async (req, reply) => {
  try {
    var percentage = 0.0;
    var arr = [];
    arr = req.body.items;
    var user_id = "5dd946601c9d4400001fdfd8";
    if (req.body.user_id != "") {
      user_id = req.body.user_id;
    }

    for await (const data of req.body.items) {
      var prod = await Product.findById(data.product_id);
      var reserve_id = await reserve.findById(prod.reserve_id);
      if(!reserve_id){
        const response = {
          items: {},
          status: false,
          status_code: 400,
          message: "عذرا .. هذا المنتج غير مرتبط بعقد",
        };
        reply.send(response);
        return
      }
      var contract_id = await contract.findById(reserve_id.contract_id);
      percentage = Number(contract_id.value);


      //add transaction payment
      let _newTotal = Number(data.price) * Number(data.qty)
      let admin_amount = (parseFloat(percentage).toFixed(2) * _newTotal).toFixed(2);
      let provider_amount = -1 * Number(_newTotal - admin_amount);
      
      await addTransaction(data.by_user_id,req.body.Order_no,reserve_id._id,provider_amount,"worthy","عملية شراء");
      await addTransaction(data.by_user_id,req.body.Order_no,reserve_id._id,admin_amount,"admin","مستحقات الادارة");
    }

    var shipment = 0;
    if (req.body.Shipment && req.body.Shipment != "0") {
      shipment = req.body.Shipment;
    }

    var newTotal = shipment + parseFloat(req.body.Total, 10).toFixed(2) - parseFloat(req.body.Total_Discount, 10).toFixed(2);

    let Orders = new Order({
      provider_id: req.body.provider_id,
      Order_no: req.body.Order_no,
      Total: newTotal,
      Admin_Total: (parseFloat(percentage).toFixed(2) * newTotal).toFixed(2),
      Renter_Total: newTotal - (parseFloat(percentage).toFixed(2) * newTotal).toFixed(2),
      StatusId: 1,
      user_id: user_id,
      items: req.body.items,
      city_id: req.body.city_id,
      payment_id: req.body.payment_id,
      delivery_id: req.body.delivery_id,
      delivery_company_id: req.body.delivery_company_id,
      Shipment: shipment,
      address: req.body.address,
      createAt: getCurrentDateTime(),
      Total_Discount: req.body.Total_Discount,
    });

    let currentDate = new Date();
    let currentMonth = moment(currentDate).format("MM");
    let currentYear = moment(currentDate).format("YYYY");
    var checkPayment = await PaymnetLog.findOne({
      $and: [
        {
          by_user_id: req.body.provider_id,
        },
        { PeriodMonth: currentMonth },
        { PeriodYear: currentYear },
      ],
    });


    // add to monthly payment log
    if (checkPayment) {
      //update increament
      await PaymnetLog.findByIdAndUpdate(
        checkPayment._id,
        {
          $inc: {
            Total: Number(newTotal),
            Admin_Total: Number(
              (parseFloat(percentage).toFixed(2) * newTotal).toFixed(2)
            ),
            provider_Total: Number(
              newTotal -
                (parseFloat(percentage).toFixed(2) * newTotal).toFixed(2)
            ),
          },
        },
        { new: true }
      );
    } else {
      //add payment logs
      let _Payment = new PaymnetLog({
        by_user_id: req.body.provider_id,
        Total: Number(newTotal),
        Admin_Total: Number(
          (parseFloat(percentage).toFixed(2) * newTotal).toFixed(2)
        ),
        provider_Total: Number(
          newTotal - (parseFloat(percentage).toFixed(2) * newTotal).toFixed(2)
        ),
        TotalPaied: 0,
        TotalRemain: 0,
        PeriodMonth: moment(currentDate).format("MM"),
        PeriodYear: moment(currentDate).format("YYYY"),
        createAt: getCurrentDateTime(),
        PaymentType: -1,
      });
      _Payment.save();
    }

    async.each(req.body.items, async function (data, callback) {
      await Product.findOneAndUpdate(
        { _id: data.product_id },
        { $inc: { qty: -parseInt(data.qty) } },
        { new: true }
      );
    });

    // خصم الكمية بعد اضافة الشراء
    let rs = await Orders.save();


    const response = {
      items: rs,
      status: true,
      status_code: 200,
      message: "تمت عملية الشراء بنجاح",
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// add Rate of Orders and products
exports.addRate = async (req, reply) => {
  try {
    const currentOrder = await Order.findById(req.body.order_id);
    let itemProducts = currentOrder.items;

    await Order.findByIdAndUpdate(
      req.body.order_id,
      {
        StatusId: 5,
      },
      { new: true }
    );

    if (itemProducts.length > 0) {
      itemProducts.forEach(async function (element) {
        let _userRate = new userRate({
          product_id: element.product_id,
          order_id: req.body.order_id,
          user_id: currentOrder.user_id,
          rate: req.body.rate,
          isCommentApproved: false,
          comment: req.body.comment,
          createAt: getCurrentDateTime(),
        });
        await _userRate.save();

        const allOrderLikeItems = await userRate
          .find({
            product_id: element.product_id,
          })
          .count();
        const summationOfRates = await userRate.find({
          product_id: element.product_id,
        });

        let sum = lodash.sumBy(summationOfRates, function (o) {
          return o.rate;
        });
        await Product.findByIdAndUpdate(element.product_id, {
          rate: parseInt(sum / allOrderLikeItems),
        });
      });
    }

    const response = {
      status_code: 200,
      status: true,
      message: "شكرا لك .. تم اضافة تقييمك بنجاح",
      items: [],
    };

    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addProcutComment = async (req, reply) => {
  try {
    let _userRate = new prodcutComment({
      product_id: req.body.product_id,
      user_id: req.body.user_id,
      isCommentApproved: false,
      comment: req.body.comment,
      createAt: getCurrentDateTime(),
    });
    await _userRate.save();
    const response = {
      status_code: 200,
      status: true,
      message: "تم اضافة تعليقك  ..  سيتم مراجعته من قبل الادارة",
      items: [],
    };

    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.approveRate = async (req, reply) => {
  try {
    await userRate.findByIdAndUpdate(req.params.id, {
      isCommentApproved: req.body.isCommentApproved,
    });

    const response = {
      status_code: 200,
      status: true,
      message: "تم التعديل بنجاح",
      items: [],
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.approveComment = async (req, reply) => {
  try {
    await prodcutComment.findByIdAndUpdate(req.params.id, {
      isCommentApproved: req.body.isCommentApproved,
    });

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: [],
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get user Order
exports.getUserOrder = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await Order.find({
      user_id: req.query.id,
      StatusId: req.query.staustId,
    }).count();

    var result = [];
    var query = {};

    if (req.query.staustId != 1) {
      if (req.query.staustId == 3) {
        query["user_id"] = req.query.id;
        query["StatusId"] = { $in: [3, 4] };
      } else {
        query["user_id"] = req.query.id;
        query["StatusId"] = req.query.staustId;
      }

      var item = await Order.find(query)
        .sort({ _id: -1 })
        .populate("user_id")
        .populate("driver_id")
        .populate({
          path: "items.product_id",
          populate: { path: "product_id" },
        })
        .skip(page * limit)
        .limit(limit);
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
    } else {
      var item = await Order.find({
        user_id: req.query.id,
        StatusId: req.query.staustId,
      })
        .sort({ _id: -1 })
        .populate("user_id")
        // .populate('driver_id')
        .populate({
          path: "items.product_id",
          populate: { path: "product_id" },
        })
        .skip(page * limit)
        .limit(limit);
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
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get Order Details
exports.getOrderDetails = async (req, reply) => {
  try {
    var item = await Order.find({ Order_no: req.params.id })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate({
        path: "items.product_id",
        populate: { path: "product_id" },
      });
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
  } catch {
    throw boom.boomify(err);
  }
};

exports.getOrderDetailsByRenter = async (req, reply) => {
  try {
    var item = await Order.find({ Order_no: req.params.id })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate({
        path: "items.product_id",
        populate: { path: "product_id" },
      });
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
  } catch {
    throw boom.boomify(err);
  }
};

exports.getOrdersByUserId = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await Order.find({
      user_id: req.params.id,
    }).count();

    var item = await Order.find({
      user_id: req.params.id,
    })
      .sort({ _id: -1 })
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .skip(page * limit)
      .limit(limit);
    // if (err) return handleError(err);
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
  } catch {
    throw boom.boomify(err);
  }
};

exports.getOrdersSeacrh = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var query = {};

    if (start_date != "" && end_date != "") {
      query = {
        createAt: {
          $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
          $lt: new Date(new Date(end_date).setHours(23, 59, 59)),
        },
      };
    }

    if (req.body.renter_id != "" && req.body.renter_id) {
      query = { provider_id: req.body.renter_id };
    }
    var allOrders = await Order.find(query);
    var Total = lodash.sumBy(allOrders, function (o) {
      return o.Total;
    });
    var Total_Discount = lodash.sumBy(allOrders, function (o) {
      return o.Total_Discount;
    });
    var Admin_Total = lodash.sumBy(allOrders, function (o) {
      return o.Admin_Total;
    });
    var Renter_Total = lodash.sumBy(allOrders, function (o) {
      return o.Renter_Total;
    });
    var total = await Order.find(query).count();
    var item = await Order.find(query)
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("city_id")
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .populate({ path: "items.by_admin_id", populate: { path: "admins" } })
      .populate({ path: "items.by_user_id", populate: { path: "renters" } })
      .skip(page * limit)
      .limit(limit);

    const response = {
      items: item,
      status_code: 200,
      status: true,
      message: "returned successfully",
      Total: Total,
      Total_Discount: Total_Discount,
      Admin_Total: Admin_Total,
      Renter_Total: Renter_Total,
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

exports.getOrdersSeacrhExcel = async (req, reply) => {
  try {
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var query = {};

    if (start_date != "" && end_date != "") {
      query = {
        createAt: {
          $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
          $lt: new Date(new Date(end_date).setHours(23, 59, 59)),
        },
      };
    }
    if (req.body.renter_id != "" && req.body.renter_id) {
      query = { provider_id: req.body.renter_id };
    }
    var allOrders = await Order.find(query);
    var Total = lodash.sumBy(allOrders, function (o) {
      return o.Total;
    });
    var Total_Discount = lodash.sumBy(allOrders, function (o) {
      return o.Total_Discount;
    });
    var Admin_Total = lodash.sumBy(allOrders, function (o) {
      return o.Admin_Total;
    });
    var Renter_Total = lodash.sumBy(allOrders, function (o) {
      return o.Renter_Total;
    });
    var item = await Order.find(query)
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("city_id")
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .populate({ path: "items.by_admin_id", populate: { path: "admins" } })
      .populate({ path: "items.by_user_id", populate: { path: "renters" } });
    const response = {
      items: item,
      status_code: 200,
      status: true,
      message: "returned successfully",
      Total: Total,
      Total_Discount: Total_Discount,
      Admin_Total: Admin_Total,
      Renter_Total: Renter_Total,
    };
    reply.send(response);
  } catch {
    throw boom.boomify();
  }
};

exports.getRatedOrders = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await userRate.find().count();

    var item = await userRate
      .find()
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("order_id")
      .populate("product_id")
      .skip(page * limit)
      .limit(limit);
    // if (err) return handleError(err);
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
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getApproveRatedOrders = async (req, reply) => {
  try {
    var item = await userRate
      .find({ isCommentApproved: true })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("order_id")
      .populate("product_id")
      .limit(8);
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

exports.getRatedProducts = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await prodcutComment.find().count();

    var item = await prodcutComment
      .find()
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("product_id")
      .skip(page * limit)
      .limit(limit);
    // if (err) return handleError(err);
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
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getRatedProductsById = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await prodcutComment
      .find({ product_id: req.params.id, isCommentApproved: true })
      .count();

    var item = await prodcutComment
      .find({ product_id: req.params.id, isCommentApproved: true })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("product_id")
      .skip(page * limit)
      .limit(limit);
    // if (err) return handleError(err);
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
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getNewOrder = async (req, reply) => {
  try {
    const supplier_id = req.params.id;
    const total = await Order.find({
      $and: [{ StatusId: 1 }, { supplier_id: supplier_id }],
    }).count();
    reply.send(total);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getNewRatedOrder = async (req, reply) => {
  try {
    const supplier_id = req.params.id;
    const total = await Order.find({
      $and: [{ supplier_id: supplier_id }, { isRate: true }, { isOpen: false }],
    }).count();
    reply.send(total);
  } catch {
    throw boom.boomify(err);
  }
};

exports.updateRate = async (req, reply) => {
  try {
    const _order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        isOpen: true,
      },
      { new: true }
    );
    const response = {
      status_code: 200,
      status: true,
      message: "تم تعديل التقييم بنجاح",
      items: null,
    };
    reply.send(response);
  } catch {
    throw boom.boomify(err);
  }
};

exports.updateOrderByAdmin = async (req, reply) => {
  try {
    const sp = await Order.findByIdAndUpdate(
      req.params.id,
      {
        StatusId: req.body.StatusId,
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "تم تعديل الطلب بنجاح",
      items: sp,
    };

    // const order = await Order.findById(req.params.id).populate("user_id");

    // if (req.body.StatusId === 2) {
    //     let msg = `جاري توصيل طلبكم رقم: ${order._id}`;
    //     console.log(msg)

    //     let notification = CreateNotification(order.user_id.fcmToken, msg, order._id, 'ادارة تطبيق غاز', order.user_id._id);
    // }

    // if (req.body.StatusId === 3) {
    //     let msg = `تم توصيل طلبكم رقم: ${order._id}`;
    //     console.log(msg)

    //     let notification = CreateNotification(order.user_id.fcmToken, msg, order._id, 'ادارة تطبيق غاز', order.user_id._id);

    // }

    // if (req.body.StatusId === 6) {
    //   let msg = `تم الغاء طلبكم رقم: ${order._id}`;
    //   console.log(msg);

    //   CreateNotification(
    //     order.user_id.fcmToken,
    //     msg,
    //     order._id,
    //     "ادارة تطبيق غاز",
    //     order.user_id._id
    //   );
    // }

    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.DailyOrders = async (req, reply) => {
  try {
    // const dt = new Date()
    // console.log(dt.toISOString().slice(0, 10))

    var utc = new Date();
    var current = utc.setHours(utc.getHours() + 3);
    // const today = moment().startOf('day')
    // console.log(today.add(3, 'hours').toDate())
    // const order = await Order.find({
    //     $and: [{
    //         createAt: {
    //             $gte: today.add(3, 'hours').toDate(),
    //             $lte: moment(today.add(3, 'hours')).endOf('day').toDate()
    //         }
    //     }, { staustId: 4 }]
    // })
    //     .populate('user_id')
    //     .populate('driver_id')
    //     .populate({ path: 'items.product_id', populate: { path: 'product_id' } }).count()
    // const response = {
    //     status_code: 200,
    //     status: true,
    //     message: 'تمت العملية بنجاح',
    //     items: order
    // }
    // reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteOrder = async (req, reply) => {
  try {
    const _order = await Order.findById(req.params.id)
      .sort({ _id: -1 })
      .populate("user_id")
      .populate({
        path: "items.product_id",
        populate: { path: "product_id" },
      });

    if (_order.items && _order.items.length == 1) {
      var percentage = 0.0;
      // let percentage = await setting.findOne({
      //   min: { $lte: _order.Total },
      //   max: { $gte: _order.Total },
      // });

      for await (const data of _order.items) {
        var prod = await Product.findOneAndUpdate(
          { _id: data.product_id._id },
          { $inc: { qty: +parseInt(data.qty) } },
          { new: true }
        );
        var reserve_id = await reserve.findOne({ _id: prod.reserve_id });
        var contract_id = await contract.findOne({
          _id: reserve_id.contract_id,
        });

        percentage = Number(contract_id.value);

        //add transaction payment
        let admin_amount = _order.Admin_Total;
        let Renter_Total = _order.Renter_Total;

        await addTransaction(_order.provider_id,_order.Order_no,reserve_id._id,Renter_Total,"worthy","ارجاع منتجات");
        await addTransaction(_order.provider_id,_order.Order_no,reserve_id._id,Number(-1 * admin_amount),"admin","ارجاع مستحقات الادارة");
          
      }

      var prevOrder = await Order.findById(req.params.id);
      await Order.findByIdAndRemove(req.params.id);

      let currentDate = new Date(prevOrder.createAt);
      let currentMonth = moment(currentDate).format("MM");
      let currentYear = moment(currentDate).format("YYYY");
      var checkPayment = await PaymnetLog.findOne({
        $and: [
          {
            by_user_id: prevOrder.provider_id,
          },
          { PeriodMonth: currentMonth },
          { PeriodYear: currentYear },
        ],
      });

      if (checkPayment) {
        //update increament
        await PaymnetLog.findByIdAndUpdate(
          checkPayment._id,
          {
            $inc: {
              Total: -Number(_order.Total),
              Admin_Total: -Number(
                (parseFloat(percentage).toFixed(2) * _order.Total).toFixed(2)
              ),
              provider_Total: -Number(
                _order.Total -
                  (parseFloat(percentage).toFixed(2) * _order.Total).toFixed(2)
              ),
            },
          },
          { new: true }
        );
      }


   
      const response = {
        status_code: 200,
        status: true,
        message: "تم ارجاع المنتج بنجاح",
        items: [],
      };
      reply.send(response);
    } else if (_order.items && _order.items.length > 1) {
      var total = Number(req.body.total);
      // let percentage = await setting.findOne({
      //   min: { $lte: total },
      //   max: { $gte: total },
      // });
      var prod = await Product.findOneAndUpdate(
        { _id: req.body.product_id },
        { $inc: { qty: +parseInt(req.body.qty) } },
        { new: true }
      );
      var reserve_id = await reserve.findOne({ _id: prod.reserve_id });
      var contract_id = await contract.findOne({
        _id: reserve_id.contract_id,
      });

      var percentage = Number(contract_id.value);


      var newTotal = Number(_order.Total) - Number(req.body.total);
      var New_Renter_Total =
        Number(newTotal) - Number(percentage) * Number(newTotal);
      var New_Admin_Total = Number(newTotal) - Number(New_Renter_Total);

      await Order.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { items: { _id: req.body.itemId } },
          Total: newTotal,
          Admin_Total: New_Admin_Total,
          Renter_Total: New_Renter_Total,
        },
        { safe: true, upsert: true },
        function (err, node) {
          if (err) {
            console.log("error");
          }
          console.log("success");
        }
      );

      // var prevOrder = await Order.findById(req.params.id);
      let currentDate = new Date(_order.createAt);
      let currentMonth = moment(currentDate).format("MM");
      let currentYear = moment(currentDate).format("YYYY");
      var checkPayment = await PaymnetLog.findOne({
        $and: [
          {
            by_user_id: _order.provider_id,
          },
          { PeriodMonth: currentMonth },
          { PeriodYear: currentYear },
        ],
      });

      if (checkPayment) {
        //update increament
        await PaymnetLog.findByIdAndUpdate(
          checkPayment._id,
          {
            $inc: {
              Total: -Number(total),
              Admin_Total: -Number(
                (parseFloat(percentage).toFixed(2) * total).toFixed(2)
              ),
              provider_Total: -Number(
                total - (parseFloat(percentage).toFixed(2) * total).toFixed(2)
              ),
            },
          },
          { new: true }
        );
      }

      const response = {
        status_code: 200,
        status: true,
        message: "تم ارجاع المنتج بنجاح",
        items: [],
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getPaymentLogDetailsByRenterId = async (req, reply) => {
  try {
    var _paymentLog = await PaymnetLog.find({ by_user_id: req.params.id });
    let provider_Total = lodash.sumBy(_paymentLog, function (o) {
      return o.provider_Total;
    });
    let TotalPaied = lodash.sumBy(_paymentLog, function (o) {
      return o.TotalPaied;
    });
    let items = {
      provider_Total: provider_Total,
      TotalPaied: TotalPaied,
    };
    const response = {
      status_code: 200,
      status: true,
      message: "تم ارجاع المنتج بنجاح",
      items: items,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getPaymnetLog = async (req, reply) => {
  try {
    var query = {};
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);

    if (req.query.provider_id != "" && req.query.provider_id) {
      query["by_user_id"] = req.query.provider_id;
    }

    if (req.query.PeriodMonth != "" && req.query.PeriodMonth) {
      query["PeriodMonth"] = req.query.PeriodMonth;
    }

    if (req.query.PeriodYear != "" && req.query.PeriodYear) {
      query["PeriodYear"] = req.query.PeriodYear;
    }

    const _paymentLogAll = await PaymnetLog.find(query);
    let provider_Total = lodash.sumBy(_paymentLogAll, function (o) {
      return o.provider_Total;
    });
    let TotalPaied = lodash.sumBy(_paymentLogAll, function (o) {
      return o.TotalPaied;
    });
    const total = await PaymnetLog.find(query).count();
    const _PaymnetLog = await PaymnetLog.find(query)
      .sort({ _id: -1 })
      .populate("by_user_id")
      .skip(page * limit)
      .limit(limit);
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _PaymnetLog,
      provider_Total: provider_Total,
      TotalPaied: TotalPaied,
      pagenation: {
        size: _PaymnetLog.length,
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

// Update Payment
exports.updatePayment = async (req, reply) => {
  try {
    const preLog = await PaymnetLog.findById(req.params.id);
    if (
      Number(req.body.TotalPaied).toFixed(2) <=
      Number(preLog.provider_Total - preLog.TotalPaied).toFixed(2)
    ) {
      const _PaymnetLog = await PaymnetLog.findByIdAndUpdate(
        req.params.id,
        {
          $inc: {
            TotalPaied: Number(req.body.TotalPaied).toFixed(2),
          },
          PaymentType: req.body.PaymentType,
        },
        { new: true }
      );
      await PaymnetLog.findByIdAndUpdate(
        req.params.id,
        {
          TotalRemain:
            Number(preLog.provider_Total).toFixed(2) -
            Number(_PaymnetLog.TotalPaied).toFixed(2),
        },
        { new: true }
      );
      var msg = `تم تسليم مستحاقتكم بمبلغ ${req.body.TotalPaied} ريال وذلك لشهر ${preLog.PeriodMonth} نتمنى لكم تجارة مربحة معنا`;
      var user = await renters.findById(preLog.by_user_id);

      sendSMS(user.phone_number, "الادارة", "", msg);
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: _PaymnetLog,
      };
      reply.send(response);
    } else {
      const response = {
        status_code: 400,
        status: false,
        message: "الرجاء التأكد من القيم المدخلة",
        items: {},
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

//add transaction
exports.addPayment = async (req, reply) => {
  try {

    await addTransaction(req.body.by_user_id,req.body.order_no,req.body.reserve_id,req.body.amount,"paid",req.body.note)

    var msg = `تم تسليم مستحاقتكم بمبلغ ${req.body.amount} ريال وذلك عن ${req.body.note} نتمنى لكم تجارة مربحة معنا`;
    var user = await renters.findById(req.body.by_user_id);

      sendSMS(user.phone_number, "الادارة", "", msg);
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: {},
      };
      reply.send(response);

  } catch (err) {
    throw boom.boomify(err);
  }
};

//get payment search

exports.getTransactionSeacrh = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    var start_date = req.query.start_date;
    var end_date = req.query.end_date;
    var query = {$and:[{}]};
    var query_total = {$and:[{}]};

    if (start_date != "" && end_date != "") {
      query.$and.push({
        createAt: {
          $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
          $lt: new Date(new Date(end_date).setHours(23, 59, 59)),
        },
      })
      query_total.$and.push({
        createAt: {
          $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
          $lt: new Date(new Date(end_date).setHours(23, 59, 59)),
        },
      })
    }

    if (req.query.provider_id != "" && req.query.provider_id) {
      query.$and.push({ provider_id: req.query.provider_id })
      query_total.$and.push({ provider_id: req.query.provider_id })
    }

    if (req.query.reserve_id != "" && req.query.reserve_id) {
      query.$and.push({ reserve_id: req.query.reserve_id })
      query_total.$and.push({ reserve_id: req.query.reserve_id })
    }
    
    if (req.query.type != "" && req.query.type) {
      query.$and.push({ type: req.query.type })
    }

    var allOrders = await Transaction.find(query_total);
    
    var Total_Worthy = 0;
    var Total_Admin = 0;
    var Total_Paid = 0;
    allOrders.forEach(element => {
      if(element.type == "worthy") Total_Worthy += element.amount
      if(element.type == "admin") Total_Admin += element.amount
      if(element.type == "paid") Total_Paid += element.amount
    });
    
    var total = await Transaction.find(query).count();
    var item = await Transaction.find(query)
      .sort({ _id: -1 })
      .populate("provider_id")
      .populate("reserve_id")
      .skip(page * limit)
      .limit(limit);

    const response = {
      items: item,
      status_code: 200,
      status: true,
      message: "returned successfully",
      Total_Worthy: Total_Worthy,
      Total_Admin: Total_Admin,
      Total_Paid: Total_Paid,
      Total: Number(-1*Total_Worthy)+Number(Total_Admin),
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



exports.orderDetailsByUserId = async (req, reply) => {
  try {
    var start_date = req.query.start_date;
    var end_date = req.query.end_date;
    var query = {$and:[{}]};
    var query_total = {$and:[{}]};
    var products = []
    
    if (start_date != "" && end_date != "") {
      query.$and.push({
        createAt: {
          $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
          $lt: new Date(new Date(end_date).setHours(23, 59, 59)),
        },
      })
      query_total.$and.push({
        createAt: {
          $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
          $lt: new Date(new Date(end_date).setHours(23, 59, 59)),
        },
      })
    }

    if (req.query.provider_id != "" && req.query.provider_id) {
      query.$and.push({ provider_id: req.query.provider_id })
    }
    
    // if (req.query.reserve_id != "" && req.query.reserve_id) {
    //   query.$and.push({ reserve_id: req.query.reserve_id })
    // }

    var orders = await Order.find(query)
      .sort({ _id: -1 })
      .populate("provider_id")
      .populate({
        path: "items.product_id",
        populate: { path: "product_id" },
      });

      var objs = []
      orders.forEach((element) => {
        if (element.items.length > 0) {
          element.items.forEach((elm) => {
            if (elm.product_id) { 
              products.push(elm.product_id);
            }
          });
        }
      });

    products.forEach(element => {
      let exsit = objs.filter(x=>String(x.product_id) == String(element._id))
      if(exsit.length > 0){
        //exsits find index and update counts
        let index = objs.findIndex(x=>String(x.product_id) == String(element._id))
        objs[index].product_payments_count += 1;
      }else{
        let newObject = {
          product_id: element._id,
          product_image: element.image,
          product_name: element.name,
          product_qty: element.qty,
          product_payments_count: 1
        }
        objs.push(newObject)
      }
    });
    const response = {
      items: objs,
      status_code: 200,
      status: true,
      message: "returned successfully",
    };
    reply.send(response);
  } catch {
    throw boom.boomify();
  }
}