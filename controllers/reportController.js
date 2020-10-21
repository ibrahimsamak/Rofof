const _ = require("underscore");
const lodash = require("lodash");
const boom = require("boom");
const moment = require("moment");
const momentTZ = require("moment-timezone");

const { Order } = require("../models/Order");
const { Product, Supplier } = require("../models/Product");
const { renters } = require("../models/Driver");
const { Users } = require("../models/User");
const { companyCommision } = require("../models/companyCommision");
const { getCurrentDateTime, inventory, city } = require("../models/Constant");
const { rack, reserve } = require("../models/Rack");

//pages
exports.rpt_getOrderswithstatus = async (req, reply) => {
  try {
    var query = {};

    if (req.body.dt_start && req.body.dt_end) {
      query = {
        $and: [
          { createAt: { $lte: new Date(req.body.dt_end) } },
          { createAt: { $gte: new Date(req.body.dt_start) } },
        ],
      };
    }

    if (req.body.StatusId) {
      query["StatusId"] = req.body.StatusId;
    }
    if (req.body.driver_id) {
      query["driver_id"] = req.body.driver_id;
    }
    if (req.body.supplier_id) {
      // var arr = []
      // const supplier_id = req.body.supplier_id
      // const _drivers_ids = await Drivers.find().select('_id')
      // _drivers_ids.forEach(element => {
      //     arr.push(element._id)
      // });
      // console.log(arr)
      // query['driver_id'] = { $in: arr }
      query["supplier_id"] = req.body.supplier_id;
    }

    console.log(query);
    var page = parseInt(req.query.page, 10);
    var limit = parseInt(req.query.limit, 10);
    const total = await Order.find(query).count();

    await Order.find(query)
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("driver_id")
      .populate("delivery_id")
      .populate("deliveryOption_id")
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .populate({ path: "driver_id", populate: { path: "supplier_id" } })
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, item) {
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

exports.rpt_getRevenu = async (req, reply) => {
  try {
    var query = {};

    if (req.body.dt_start && req.body.dt_end) {
      query = {
        $and: [
          { createAt: { $lte: new Date(req.body.dt_end) } },
          { createAt: { $gte: new Date(req.body.dt_start) } },
        ],
      };
    }
    if (req.body.driver_id) {
      query["driver_id"] = req.body.driver_id;
    }
    if (req.body.supplier_id) {
      // var arr = []
      // const supplier_id = req.body.supplier_id
      // const _drivers_ids = await Drivers.find().select('_id')
      // _drivers_ids.forEach(element => {
      //     arr.push(element._id)
      // });
      // console.log(arr)
      // query['driver_id'] = { $in: arr }
      query["supplier_id"] = req.body.supplier_id;
    }

    query["StatusId"] = 4;

    var page = parseInt(req.query.page, 10);
    var limit = parseInt(req.query.limit, 10);
    const total = await Order.find(query).count();
    const all = await Order.find(query);

    await Order.find(query)
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("driver_id")
      .populate("delivery_id")
      .populate("deliveryOption_id")
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .populate({
        path: "items.supplier_id",
        populate: { path: "supplier_id" },
      })
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: item,
          sum: lodash.sumBy(all, function (o) {
            return o.Admin_Total;
          }),
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

exports.rpt_getOrderMaps = async (req, reply) => {
  try {
    var query = {};

    if (req.body.dt_start && req.body.dt_end) {
      query = {
        $and: [
          { createAt: { $lte: new Date(req.body.dt_end) } },
          { createAt: { $gte: new Date(req.body.dt_start) } },
        ],
      };
    }

    query["StatusId"] = 4;
    query["supplier_id"] = req.body.supplier_id;

    await Order.find(query)
      .sort({ _id: -1 })
      .select({ lat: 1, lng: 1 })
      .populate("user_id")
      // .skip((page) * limit)
      // .limit(limit)
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

exports.rpt_getOrderMaps = async (req, reply) => {
  try {
    var query = {};

    if (req.body.dt_start && req.body.dt_end) {
      query = {
        $and: [
          { createAt: { $lte: new Date(req.body.dt_end) } },
          { createAt: { $gte: new Date(req.body.dt_start) } },
        ],
      };
    }

    query["StatusId"] = 4;
    query["supplier_id"] = req.body.supplier_id;

    await Order.find(query)
      .sort({ _id: -1 })
      .select({ lat: 1, lng: 1 })
      .populate("user_id")
      // .skip((page) * limit)
      // .limit(limit)
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

exports.rpt_getCompanyCommission = async (req, reply) => {
  try {
    var page = parseInt(req.query.page, 10);
    var limit = parseInt(req.query.limit, 10);
    const total = await companyCommision.find().count();

    await companyCommision
      .find()
      .populate("supplier_id")
      .exec(function (err, item) {
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

exports.addCompanyCommission = async (req, reply) => {
  try {
    const _companyCommision = await companyCommision.findOne({
      supplier_id: req.body.supplier_id,
    });
    if (req.body.totalPay > _companyCommision.value) {
      await companyCommision.findOneAndUpdate(
        { supplier_id: req.body.supplier_id },
        {
          $inc: {
            value: -_companyCommision.value,
            totalPay: _companyCommision.value,
          },
          last_date_pay: getCurrentDateTime(),
        },
        { new: true }
      );

      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: companyCommision,
      };
      reply.send(response);
    } else {
      await companyCommision.findOneAndUpdate(
        { supplier_id: req.body.supplier_id },
        {
          $inc: { value: -req.body.totalPay, totalPay: req.body.totalPay },
          last_date_pay: getCurrentDateTime(),
        },
        { new: true }
      );

      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: companyCommision,
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

//charts
exports.getDailyRevenu = async (req, reply) => {
  try {
    const supplier_id = req.params.id;

    let cc = momentTZ().tz("Asia/Riyadh").format("YYYY-MM-DD");
    console.log(cc);
    var _items = [];
    const dt = new Date();
    console.log(dt.toISOString().slice(0, 10));

    const today = moment().startOf("day");
    const today_val = today.add(-3, "hours").toDate();
    const today_val2 = moment(today.add(-3, "hours")).endOf("day").toDate();
    console.log(today.toDate());

    // var all = await Order.find({ StatusId: 4 })
    // var DailyRevenu = lodash.sumBy(all, function (o) { return o.Total; })
    // var newComments = await Order.find({ isRate: true, isOpen: false }).count();

    // const order =
    // console.log(order)

    console.log("today1" + new Date(new Date().setHours(00, 00, 00)));
    console.log("today2" + new Date(new Date().setHours(23, 59, 59)));
    // const test = await Order.find({ $or: [{ StatusId: 3 }, { StatusId: 4 }] })
    // var vvv = []
    // const  x =  test.filter(element=>{
    //     return element.createAt.toISOString().slice(0, 10) == cc
    // })
    // // test.forEach(element => {
    // //     console.log(element.createAt.toISOString().slice(0, 10), cc)
    // //     if (element.createAt.toISOString().slice(0, 10) == cc) {
    // //         vvv.push(element)
    // //     }
    // // });
    // console.log(x.length)
    const newOrders = await Order.find({
      $and: [
        {
          createAt: {
            $gte: new Date(new Date().setHours(00, 00, 00)),
            $lt: new Date(new Date().setHours(23, 59, 59)),
          },
        },
        ,
        { StatusId: 2 },
      ],
    }).count();
    const _all = await Order.find({
      $and: [
        {
          createAt: {
            $gte: new Date(new Date().setHours(00, 00, 00)),
            $lt: new Date(new Date().setHours(23, 59, 59)),
          },
        },
        ,
        { $or: [{ StatusId: 3 }, { StatusId: 4 }] },
      ],
    }).count();
    const cancelOrder_drivers = await Order.find({
      $and: [
        {
          createAt: {
            $gte: new Date(new Date().setHours(00, 00, 00)),
            $lt: new Date(new Date().setHours(23, 59, 59)),
          },
        },
        ,
        { StatusId: 6 },
      ],
    }).count();
    const cancelOrder_users = await Order.find({
      $and: [
        {
          createAt: {
            $gte: new Date(new Date().setHours(00, 00, 00)),
            $lt: new Date(new Date().setHours(23, 59, 59)),
          },
        },
        ,
        { StatusId: 5 },
      ],
    }).count();

    _items.push(
      { _all: _all },
      { newOrders: newOrders },
      { cancelOrder_drivers: cancelOrder_drivers },
      { cancelOrder_users: cancelOrder_users }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _items,
    };

    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getProductsCount = async (req, reply) => {
  try {
    const supplier_id = req.params.id;

    var _items = [];
    var Products = await Product.find().count();
    var Suppliers = await Supplier.find().count();

    var allOrders = await Order.find({
      $and: [{ $or: [{ StatusId: 4 }, { StatusId: 3 }] }],
    });
    var DailyRevenu = lodash.sumBy(allOrders, function (o) {
      return o.Total;
    });
    var deliveryCostRevenu = lodash.sumBy(allOrders, function (o) {
      return o.deliveryCost;
    });

    _items.push(
      { revenu: DailyRevenu.toFixed(2) - deliveryCostRevenu.toFixed(2) },
      { deliveryCostRevenu: deliveryCostRevenu.toFixed(2) },
      { Suppliers: Suppliers },
      { Products: Products }
    );
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _items,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getTop10Cities = async (req, reply) => {
  try {
    var products = [];
    await Order.find({ StatusId: 4 }).exec(function (err, item) {
      item.forEach((element) => {
        // if (element.items) {
        // element.forEach(elm => {
        products.push(element);
        console.log(element);
        // });
        // }
      });

      // var result = lodash.countBy(products, 'product_id.name');
      // console.log(result);

      var _result = lodash(products)
        .groupBy("city")
        .map(function (items, _name) {
          return { name: _name, value: items.length };
        })
        .value();

      var orderedResult = lodash.orderBy(_result, ["count"], ["desc"]);
      var FinalResult = lodash.take(orderedResult, 10);

      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: FinalResult,
      };
      reply.send(response);
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.importantCounters = async (req, reply) => {
  try {
    var _items = [];

    var Userss = await Users.find({ isBlock: false }).count();
    var _renters = await renters.find({ isBlock: false }).count();
    var _inventory = await inventory.find().count();
    var _rack = await rack.find().count();
    var allOrders = await Order.find().count();
    var _reserve = await reserve.find({ isFinish: false }).count();
    var _city = await city.find().count();
    var _Product = await Product.find({status:true}).count();

    _items.push({
      total_users: Userss,
      total_renter: _renters,
      total_inventory: _inventory,
      total_rack: _rack,
      orders: allOrders,
      reserve: _reserve,
      products: _Product,
      city: _city,
    });

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _items,
    };

    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.importantCountersForRenter = async (req, reply) => {
  try {
    let by_user_id = req.params.id;
    var _items = [];

    var _reserve = await reserve.find({ renter_id: by_user_id }).count();
    var _Product = await Product.find({ by_user_id: by_user_id }).count();

    _items.push({
      reserve: _reserve,
      products: _Product,
    });

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _items,
    };

    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.top15NewUsers = async (req, reply) => {
  try {
    var Userss = await Users.find().sort({ createAt: -1 }).limit(15);

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: Userss,
    };

    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.UsersRenterPerYear = async (req, reply) => {
  try {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    var items = [];
    var items2 = [];
    await Users.find()
      .sort({ createAt: 1 })
      .exec(async function (err, result) {
        result.forEach((element) => {
          var month_number = new Date(element.createAt).getMonth();
          var month_name = monthNames[month_number];
          items.push({ month: month_name, user: element._id });
        });

        await renters
          .find()
          .sort({ createAt: 1 })
          .exec(function (err, result2) {
            result2.forEach((element2) => {
              var month_number = new Date(element2.createAt).getMonth();
              var month_name = monthNames[month_number];
              items2.push({ month: month_name, user: element2._id });
            });
            var _result = lodash(items)
              .groupBy("month")
              .map(function (items, _name) {
                return { name: _name, value: items.length };
              })
              .value();

            var _result2 = lodash(items2)
              .groupBy("month")
              .map(function (items, _name) {
                return { name: _name, value: items.length };
              })
              .value();
            var orderedResult = lodash.orderBy(_result, ["count"], ["desc"]);
            var orderedResult2 = lodash.orderBy(_result2, ["count"], ["desc"]);

            const response = {
              items: [
                { name: "مستخدم جديد", series: orderedResult },
                { name: "مستأجر", series: orderedResult2 },
              ],
            };
            reply.send(response);
          });
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.OrdersPerYear = async (req, reply) => {
  try {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    var items = [];
    await Order.find({ $and: [{ orderFrom: "نعناع" }, { StatusId: 3 }] })
      .sort({ createAt: 1 })
      .exec(function (err, result) {
        result.forEach((element) => {
          var month_number = new Date(element.createAt).getMonth();
          var month_name = monthNames[month_number];
          items.push({ month: month_name, user: element._id });
        });

        var _result = lodash(items)
          .groupBy("month")
          .map(function (items, _name) {
            return { name: _name, value: items.length };
          })
          .value();

        var orderedResult = lodash.orderBy(_result, ["count"], ["desc"]);

        const response = {
          name: "طلب من نعناع",
          series: orderedResult,
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getMostProductSells = async (req, reply) => {
  try {
    var products = [];
    await Order.find()
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .select("items")
      .exec(function (err, item) {
        item.forEach((element) => {
          if (element.items.length > 0) {
            element.items.forEach((elm) => {
              if (elm.product_id) {
                products.push(elm);
                console.log(elm);
              }
            });
          }
        });

        // var result = lodash.countBy(products, 'product_id.name');
        // console.log(result);

        var _result = lodash(products)
          .groupBy("product_id.name")
          .map(function (items, _name) {
            if (_name != "undefined") {
              return { name: _name, value: items.length };
            }
          })
          .value();

        var orderedResult = lodash.orderBy(_result, ["value"], ["desc"]);
        var FinalResult = lodash.take(orderedResult, 10);

        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: FinalResult,
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getMostProductSellsRenter = async (req, reply) => {
  try {
    let user_id = req.params.id;
    var products = [];
    await Order.find()
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .select("items")
      .exec(function (err, item) {
        item.forEach((element) => {
          if (element.items.length > 0) {
            element.items.forEach((elm) => {
              if (elm.by_user_id && elm.by_user_id == user_id) {
                if (elm.product_id) {
                  products.push(elm);
                }
              }
            });
          }
        });

        // var result = lodash.countBy(products, 'product_id.name');
        // console.log(result);

        var _result = lodash(products)
          .groupBy("product_id.name")
          .map(function (items, _name) {
            if (_name != "undefined") {
              return { name: _name, value: items.length };
            }
          })
          .value();

        var orderedResult = lodash.orderBy(_result, ["value"], ["desc"]);
        var FinalResult = lodash.take(orderedResult, 10);

        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: FinalResult,
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getMostProductQty = async (req, reply) => {
  try {
    var products = [];
    await Product.find()
      .sort({ qty: 1 })
      .limit(10)
      .exec(function (err, item) {
        var _result = lodash(item)
          .map(function (items, _name) {
            return { name: items.name, value: items.qty };
          })
          .value();

        var orderedResult = lodash.orderBy(_result, ["value"], ["desc"]);

        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: orderedResult,
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getMostProductQtyRenter = async (req, reply) => {
  try {
    let user_id = req.params.id;
    var products = [];
    await Product.find({ by_user_id: user_id })
      .sort({ qty: 1 })
      .limit(10)
      .exec(function (err, item) {
        var _result = lodash(item)
          .map(function (items, _name) {
            return { name: items.name, value: items.qty };
          })
          .value();

        var orderedResult = lodash.orderBy(_result, ["value"], ["desc"]);

        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: orderedResult,
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getMostRenter = async (req, reply) => {
  try {
    await reserve
      .find()
      .populate("renter_id")
      .exec(function (err, item) {
        var _result = lodash(item)
          .groupBy("renter_id.name")
          .map(function (items, _name) {
            if (_name && _name != "undefined" && _name != "") {
              return { name: _name, value: items.length };
            }
          })
          .value();

        var orderedResult = lodash.orderBy(_result, ["value"], ["desc"]);
        var FinalResult = lodash.take(orderedResult, 10);
        console.log(FinalResult.length);
        var arr = [];
        FinalResult.forEach((element) => {
          if (element && element != null) {
            arr.push(element);
          }
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

exports.revenuPerYear = async (req, reply) => {
  try {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    var items = [];
    var items2 = [];
    await Order.find().exec(async function (err, result) {
      result.forEach((element) => {
        var month_number = new Date(element.createAt).getMonth();
        var month_name = monthNames[month_number];
        items.push({ month: month_name, Total: element.Admin_Total });
      });

      await reserve.find().exec(function (err, result2) {
        result2.forEach((element2) => {
          var month_number = new Date(element2.end_date).getMonth();
          var month_name = monthNames[month_number];
          items2.push({ month: month_name, amount: element2.amount });
        });
        var _result = lodash(items)
          .groupBy("month")
          .map(function (items, _name) {
            return {
              name: _name,
              value: lodash.sumBy(items, function (o) {
                return o.Total;
              }),
            };
          })
          .value();

        var _result2 = lodash(items2)
          .groupBy("month")
          .map(function (items, _name) {
            return {
              name: _name,
              value: lodash.sumBy(items, function (o) {
                return o.amount;
              }),
            };
          })
          .value();

        var orderedResult = lodash.orderBy(_result, ["value"], ["desc"]);
        var orderedResult2 = lodash.orderBy(_result2, ["value"], ["desc"]);

        const response = {
          items: [
            { name: "الرفوف", series: orderedResult2 },
            { name: "المنتجات", series: orderedResult },
          ],
        };
        reply.send(response);
      });
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.revenuPerYearRenter = async (req, reply) => {
  try {
    let user_id = req.params.id;
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    var items = [];
    await Order.find().exec(async function (err, result) {
      result.forEach((element) => {
        element.items.forEach((elm) => {
          if (elm.by_user_id == user_id) {
            var month_number = new Date(element.createAt).getMonth();
            var month_name = monthNames[month_number];
            items.push({ month: month_name, Total: element.Renter_Total });
          }
        });
      });

      var _result2 = lodash(items)
        .groupBy("month")
        .map(function (items, _name) {
          return {
            name: _name,
            value: lodash.sumBy(items, function (o) {
              return o.Total;
            }),
          };
        })
        .value();

      var orderedResult2 = lodash.orderBy(_result2, ["value"], ["desc"]);

      const response = {
        items: [{ name: "المنتجات", series: orderedResult2 }],
      };
      reply.send(response);
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.SupplierPerYear = async (req, reply) => {
  try {
    const supplier_id = req.params.id;

    var supplier_arr = [];
    var orderedResult = [];
    var count = 0;
    var sup = await Supplier.find().count();
    await Drivers.find()
      .populate("supplier_id")
      .exec(async function (err, result) {
        result.forEach(async function (element) {
          var cancelOrder = await Order.find({
            $and: [
              { driver_id: element._id },
              { $or: [{ StatusId: 5 }, { StatusId: 6 }] },
            ],
          }).count();
          var DoneOrder = await Order.find({
            $and: [{ StatusId: 4 }, { driver_id: element._id }],
          }).count();
          var allOrders = await Order.find({ driver_id: element._id }).count();
          // supplier_arr.push(element.name)
          orderedResult.push(
            {
              name: "الطلبات الملغية",
              value: cancelOrder,
            },
            {
              name: "الطلبات المنجزة",
              value: DoneOrder,
            },
            {
              name: "الطلبات الكلية",
              value: allOrders,
            }
          );
          supplier_arr.push({
            name: element.supplier_id.name,
            series: orderedResult,
          });
          orderedResult = [];
          count++;
          if (count === sup) {
            count = 0;

            reply.send(supplier_arr);
            // reply.end()
          }
        });
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};
