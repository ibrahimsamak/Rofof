const _ = require("underscore");
const lodash = require("lodash");
const boom = require("boom");
const moment = require("moment");
const momentTZ = require("moment-timezone");
const { Order } = require("../models/Order");
const { Product, Supplier } = require("../models/Product");
const { renters } = require("../models/Renter");
const { Users } = require("../models/User");
const { rack, reserve } = require("../models/Rack");
const { inventory, city } = require("../models/Constant");

exports.getProductsCount = async (req, reply) => {
  try {
    const supplier_id = req.params.id;

    var _items = [];
    var Products = await Product.countDocuments({isDeleted:false})
    var Suppliers = await Supplier.countDocuments()
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
    var item = await Order.find({ StatusId: 4 });
    item.forEach((element) => {
      // if (element.items) {
      // element.forEach(elm => {
      products.push(element);
      // });
      // }
    });

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
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.importantCounters = async (req, reply) => {
  try {
    var _items = [];

    var Userss = await Users.countDocuments({ isBlock: false })
    var _renters = await renters.countDocuments({ $and:[{isBlock: false},{isDeleted:false}] })
    var _inventory = await inventory.countDocuments()
    var _rack = await rack.countDocuments({isDeleted:false})
    var allOrders = await Order.countDocuments()
    var _reserve = await reserve.countDocuments({ isFinish: false })
    var _city = await city.countDocuments()
    var _Product = await Product.countDocuments({ $and:[{status: true},{isDeleted:false}] })

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

    var _reserve = await reserve.countDocuments({ renter_id: by_user_id });
    var _Product = await Product.countDocuments({ $and:[{by_user_id: by_user_id },{isDeleted:false}]});

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
    var result = await Users.find().sort({ createAt: 1 });
    result.forEach((element) => {
      var month_number = new Date(element.createAt).getMonth();
      var month_name = monthNames[month_number];
      items.push({ month: month_name, user: element._id });
    });

    var result2 = await renters.find({isDeleted:false}).sort({ createAt: 1 });
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
    var result = await Order.find({
      $and: [{ orderFrom: "نعناع" }, { StatusId: 3 }],
    }).sort({ createAt: 1 });
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
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getMostProductSells = async (req, reply) => {
  try {
    var products = [];
    var item = await Order.find()
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .select("items");
    item.forEach((element) => {
      if (element.items.length > 0) {
        element.items.forEach((elm) => {
          if (elm.product_id) {
            products.push(elm);
          }
        });
      }
    });

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
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getMostProductSellsRenter = async (req, reply) => {
  try {
    let user_id = req.params.id;
    var products = [];
    var item = await Order.find()
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .select("items");
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
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getMostProductQty = async (req, reply) => {
  try {
    var products = [];
    var item = await Product.find({isDeleted:false}).sort({ qty: 1 }).limit(10);
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
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getMostProductQtyRenter = async (req, reply) => {
  try {
    let user_id = req.params.id;
    var products = [];
    var item = await Product.find({ $and:[{isDeleted:false},{by_user_id: user_id}]})
      .sort({ qty: 1 })
      .limit(10);
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
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getMostRenter = async (req, reply) => {
  try {
    var item = await reserve.find().populate("renter_id");
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
    var result = await Order.find();
    result.forEach((element) => {
      var month_number = new Date(element.createAt).getMonth();
      var month_name = monthNames[month_number];
      items.push({ month: month_name, Total: element.Admin_Total });
    });

    var result2 = await reserve.find();
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
    var result = await Order.find();
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
  } catch (err) {
    throw boom.boomify(err);
  }
};
