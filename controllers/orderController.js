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
const { Point } = require("../models/Point");
const { UserPoint } = require("../models/userPoint");
const { Notifications } = require("../models/Notifications");
const { Drivers, renters } = require("../models/Driver");
const { sendSMS } = require("../utils/utils");
const {
  BuyUnits,
  ContactOption,
  SocialOption,
  StaticPage,
  city,
  setting,
  contract,
} = require("../models/Constant");
const { Product, Category, Supplier } = require("../models/Product");
const { userRate, prodcutComment } = require("../models/userRate");
const { getCurrentDateTime } = require("../models/Constant");
const { coupon } = require("../models/couponmodel");
const { tokens } = require("../models/Constant");
const { companyCommision } = require("../models/companyCommision");
const { PaymnetLog, TempPayment } = require("../models/Payment");
const { reserve } = require("../models/Rack");

const options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: "AIzaSyDP-XwnS5Daa_uSFZJvY6H0hsKaOxe2ar0",
  formatter: null,
};
const geocoder = NodeGeocoder(options);

function makeid() {
  var text = "";
  var possible = "0123456789";

  for (var i = 0; i < 3; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

async function getAddress(lat, lng) {
  var current_city = "";
  return new Promise(function (resolve, reject) {
    geocoder
      .reverse({ lat: lat, lon: lng })
      .then(async function (res) {
        if (res) {
          console.log(res[0]);
          console.log(
            res[0]["administrativeLevels"]["level1long"],
            res[0].country
          );
          current_city = res[0]["administrativeLevels"]["level1long"];
          resolve(current_city);
        } else {
          reject("");
        }
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      });
  });
}

function CreateExtraNotification(
  deviceId,
  msg,
  order_id,
  from_userName,
  to_user_id
) {
  return new Promise(function (resolve, reject) {
    let postModel = {
      notification: {
        title: "متابعة الطلبات",
        body: msg,
        sound: "default",
        badge: 1,
      },
      data: {
        data: order_id,
      },
      to: deviceId,
    };
    var data = JSON.stringify(postModel);
    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log("send" + this.responseText);
      }
    });

    xhr.open("POST", "https://fcm.googleapis.com/fcm/send");
    xhr.setRequestHeader(
      "Authorization",
      "key=AAAAN6yOxXI:APA91bH99PN9-Cyfph4w4Tf1pWScF1M3OZOhpsM1FrTZdbjjhhPnDaSmP5MAqTsAY8hPNWx4FaCnBsqgLUlwtzc5cv4osE0uPwSvYwU31bHE_LaHMuLeB9qFcXKkIV59_Rr1eWZbWJoY"
    );
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    resolve(data);
  });
}

function CreateNotification(
  deviceId,
  msg,
  order_id,
  from_userName,
  to_user_id
) {
  return new Promise(function (resolve, reject) {
    let _Notification = new Notifications({
      from: from_userName,
      user_id: to_user_id,
      title: "متابعة الطلبات",
      msg: msg,
      dt_date: getCurrentDateTime(),
      type: 1,
      body_parms: order_id,
      isRead: false,
    });

    let rs = _Notification.save();
    console.log(rs);
    let postModel = {
      notification: {
        title: "متابعة الطلبات",
        body: msg,
        sound: "default",
        badge: 1,
      },
      data: {
        data: order_id,
      },
      to: deviceId,
    };
    var data = JSON.stringify(postModel);
    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log("send" + this.responseText);
      }
    });

    xhr.open("POST", "https://fcm.googleapis.com/fcm/send");
    xhr.setRequestHeader(
      "Authorization",
      "key=AAAAN6yOxXI:APA91bH99PN9-Cyfph4w4Tf1pWScF1M3OZOhpsM1FrTZdbjjhhPnDaSmP5MAqTsAY8hPNWx4FaCnBsqgLUlwtzc5cv4osE0uPwSvYwU31bHE_LaHMuLeB9qFcXKkIV59_Rr1eWZbWJoY"
    );
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    resolve(data);
  });
}

function CreateNotificationMultiple(
  deviceId,
  msg,
  order_id,
  from_userName,
  to_user_id
) {
  return new Promise(function (resolve, reject) {
    // let _Notification = new Notifications({
    //     from: from_userName,
    //     user_id: to_user_id,
    //     title: 'متابعة الطلبات',
    //     msg: msg,
    //     dt_date: getCurrentDateTime(),
    //     type: 1,
    //     body_parms: order_id,
    //     isRead: false
    // });

    // let rs = _Notification.save();
    // console.log(rs);

    let postModel = {
      notification: {
        title: "متابعة الطلبات",
        body: msg,
        sound: "default",
        icon: "assets/images/logo.png",
        badge: 1,
      },
      data: {
        data: order_id,
      },
      registration_ids: deviceId,
    };
    var data = JSON.stringify(postModel);
    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log("send" + this.responseText);
      }
    });

    xhr.open("POST", "https://fcm.googleapis.com/fcm/send");
    xhr.setRequestHeader(
      "Authorization",
      "key=AAAAN6yOxXI:APA91bH99PN9-Cyfph4w4Tf1pWScF1M3OZOhpsM1FrTZdbjjhhPnDaSmP5MAqTsAY8hPNWx4FaCnBsqgLUlwtzc5cv4osE0uPwSvYwU31bHE_LaHMuLeB9qFcXKkIV59_Rr1eWZbWJoY"
    );
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
    resolve(data);
  });
}

async function updateOrder(obj) {
  return new Promise(async function (resolve, reject) {
    const order = await Order.findById(obj._id).populate("user_id");
    const clientFCM = order.user_id.fcmToken;
    if (obj.StatusId == 2) {
      if (order.StatusId == 5) {
        const response = {
          status_code: 404,
          status: false,
          message: "عذرا تم الغاء الطلب من قبل العميل",
          items: sp,
        };
        resolve(response);
      } else {
        if (order.driver_id != null && order.driver_id) {
          const response = {
            status_code: 404,
            status: false,
            message: "عذرا تم قبول الطلب من قبل سائق اخر",
            items: [],
          };
          resolve(response);
        } else {
          let msg = `تم استلام طلبكم وجاري التوصيل طلب رقم: ${order._id}`;
          // console.log(req.user._id)
          const sp = await Order.findByIdAndUpdate(
            order._id,
            {
              StatusId: obj.StatusId,
              Notes: obj.Notes,
              driver_id: obj.driver_id,
            },
            { new: true }
          );
          const driver = await Drivers.findById(obj.driver_id);
          //let notification = CreateNotification(clientFCM, msg, order._id, driver.name, order.user_id._id);

          const response = {
            status_code: 200,
            status: true,
            message: "تم تعديل الطلب بنجاح",
            items: sp,
          };

          resolve(response);
        }
      }
    }
    if (obj.StatusId == 3) {
      const _order = await Order.findById(order._id)
        .populate("user_id")
        .populate("driver_id");
      let msg = `تم توصيل طلبكم رقم: ${_order._id}`;
      console.log(msg);

      CreateNotification(
        clientFCM,
        msg,
        _order._id,
        _order.driver_id.name,
        _order.user_id._id
      );

      const sp = await Order.findByIdAndUpdate(
        order._id,
        {
          StatusId: obj.StatusId,
          Notes: obj.Notes,
        },
        { new: true }
      );

      const _points = await Point.findOne({
        $and: [
          { supplier_id: _order.driver_id.supplier_id },
          { min_value: { $lt: _order.Total } },
          { max_value: { $gte: order.Total } },
        ],
      });

      // if (_order.driver_id.supplier_id != "5c67f4ba0fb3d50d6e9f03f3") {
      //     //commision
      //     var commsions = await setting.findById('5d26ecdc7c213e5998ea3799')
      //     var commsion_val = parseFloat(commsions.value, 10)

      //     const _comapny_commesion = await companyCommision.findOne({ 'supplier_id': _order.driver_id.supplier_id })

      //     if (_comapny_commesion) {
      //         console.log('find')
      //         await companyCommision.findOneAndUpdate(({ supplier_id: _order.driver_id.supplier_id }), {
      //             $inc: { value: commsion_val }
      //         }, { new: true })
      //     } else {
      //         console.log('not find')
      //         let ـcompanyCommision = new companyCommision({
      //             supplier_id: _order.driver_id.supplier_id,
      //             value: commsion_val,
      //             totalPay: 0,
      //             dt_date: getCurrentDateTime()
      //         });
      //         await ـcompanyCommision.save();
      //     }
      // }

      const response = {
        status_code: 200,
        status: true,
        message: "تم تعديل الطلب بنجاح",
        items: sp,
      };
      resolve(response);
    }
    if (obj.StatusId == 5) {
      if (order.StatusId == 1) {
        let msg = `قام العميل بالغاء الطلب رقم: ${order._id}`;

        const arr = [];
        const devicesID = await Admin.find().select("fcmToken");
        devicesID.forEach((element) => {
          arr.push(element["fcmToken"]);
        });
        CreateNotificationMultiple(arr, msg, "", "", "");

        const sp = await Order.findByIdAndUpdate(
          req.query.id,
          {
            StatusId: 5,
            Notes: "canceld from nana app !!",
          },
          { new: true }
        );

        const response = {
          status_code: 200,
          status: true,
          message: "تم تعديل الطلب بنجاح",
          items: sp,
        };
        return response;
      } else {
        const response = {
          status_code: 400,
          status: false,
          message:
            " عذرا لا يمكن الغاء الطلب جاري توصيله او قد يكون تم الغاء الطلب مسبقا",
          items: [],
        };
        return response;
      }
    }
  });
}

async function updateNanaOrder(obj) {
  let url = "https://nana.sa/api/change_order_level_by_key";
  let config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: obj.token,
    },
  };

  try {
    let requestData = axios.post(url, obj, config);
    // .then(async function (response) {
    //     console.log(response.data);
    //     return response
    // })
    // .catch(function (error) {
    //     console.log(error);
    //     return error
    // });
    console.log(requestData.data);
    return requestData;
  } catch (err) {
    console.log(err);
    return err;
  }
}

exports.testNana = async (req, reply) => {
  const obj = Order.find({ nanaOrderId: req.params.id });
  return obj;
};
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
      var prod = await Product.findOne({ _id: data.product_id });
      var reserve_id = await reserve.findOne({ _id: prod.reserve_id });
      var contract_id = await contract.findOne({ _id: reserve_id.contract_id });

      percentage = Number(contract_id.value);
    }

    console.log("percentage:" + percentage);
    // let percentage = await contract.findOne({
    //   min: { $lte: req.body.Total },
    //   max: { $gte: req.body.Total },
    // });

    // let _reserve = await reserve.findOne({ renter_id: req.body.provider_id });
    // let percentage = await contract.findOne({ _reserve.contract_id });

    var shipment = 0;
    if (req.body.Shipment && req.body.Shipment != "0") {
      shipment = req.body.Shipment;
    }
    var newTotal =
      shipment +
      parseFloat(req.body.Total, 10).toFixed(2) -
      parseFloat(req.body.Total_Discount, 10).toFixed(2);

    let Orders = new Order({
      provider_id: req.body.provider_id,
      Order_no: req.body.Order_no,
      Total: newTotal,
      Admin_Total: (parseFloat(percentage).toFixed(2) * newTotal).toFixed(2),
      Renter_Total:
        newTotal - (parseFloat(percentage).toFixed(2) * newTotal).toFixed(2),
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
      console.log("add payment logs");
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

exports.addOrderFromNana = async (req, reply) => {
  //paymentType:
  //1: cash
  //2: paymet getway
  //3: points
  var users = [];

  try {
    let orders = await Order.findOne({ nanaOrderId: req.body.id });
    if (orders) {
      // update

      //١-  بانتظار استلام السائق للطلب
      // ٢- تم استلام السائق وجاري التوصيل — السائق
      // ٣- تم التوصيل  — السائق
      // ٤- تم استلام الزبون — الزبون
      // ٥- تم الغاء الطلب من الزبون — الزبون
      // ٦- تم الغاء الطلب من السائق — السائق

      // New Order
      // Waiting for Shopping
      // Shopping
      // Packaged
      // Delivering
      // Delivered
      // Canceled

      var obj = {
        _id: orders._id,
        StatusId: 1,
        Notes: "",
        driver_id: orders.driver_id,
      };

      let token = await tokens.findOne({ supplier_id: orders.supplier_id });
      let config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: token.token_id,
        },
      };

      if (req.body.level == "Canceled") {
        obj.StatusId = 5;
        await updateOrder(obj).then((response) => {
          reply.send(response);
        });
      }

      reply.send({ message: "finih" });
    } else {
      // add new
      var raduis = await setting.findById("5c6758e0c65f421a494cef89");
      var Delivery_Price = await setting.findById("5c6758d9c65f421a494cef88");
      await getAddress(req.body.user.latitude, req.body.user.longitude).then(
        (x) => {
          current_city = x;
        }
      );

      const supplier_token = req.headers["branch_token"];
      const supplierData = await tokens
        .findOne({ token_id: supplier_token })
        .select("supplier_id");
      const items = [];
      const req_items = req.body.items;

      req_items.forEach((element) => {
        let obj = {
          product_id: element.sku,
          price: element.price,
          qty: element.count,
          uom: Number(element.uom),
        };
        items.push(obj);
      });
      let orderDate = new Date(req.body.receivingDate * 1000);
      let Orders = new Order({
        nanaOrderId: req.body.id,
        orderFrom: "نعناع",
        addressDetails: req.body.user.fullName + " " + req.body.user.phone,
        orderType: req_items[0].uom,
        lat: req.body.user.latitude,
        lng: req.body.user.longitude,
        paymentType: 1,
        deliveryCost: items.length * Delivery_Price.value,
        subTotal: req.body.totalPrice - items.length * Delivery_Price.value,
        Total: req.body.totalPrice,
        Notes: req.body.notes,
        StatusId: 1,
        delivery_date: orderDate,
        // delivery_time: '',
        user_id: "5d8a58a2e7179a022441c566",
        items: items,
        city: "",
        supplier_id: supplierData.supplier_id,
        createAt: getCurrentDateTime(),
      });

      let rs = await Orders.save();
      const response = {
        items: rs,
        status: true,
        status_code: 200,
        message: "تمت اضافة طلبك بنجاح",
      };

      var database = firebase.database();
      var geoFire = new GeoFire(database.ref("userLocation"));
      var driversToken = [];
      var keys_arr = [];

      let geoQuery = geoFire.query({
        center: [
          Number(req.body.user.latitude),
          Number(req.body.user.longitude),
        ],
        radius: 1000,
      });

      var onKeyEnteredRegistration = geoQuery.on("key_entered", function (
        key,
        location,
        distance
      ) {
        console.log(
          key +
            " entered query at " +
            location +
            " (" +
            distance +
            " km from center)"
        );
        let obj = {
          key: key,
          location: location,
          distance: distance,
        };

        if (distance <= parseFloat(raduis.value, 10)) {
          keys_arr.push(key);
        }
      });

      var onKeyExitedRegistration = geoQuery.on("ready", async function (
        key,
        location,
        distance
      ) {
        console.log(
          key +
            " exited query to " +
            location +
            " (" +
            distance +
            " km from center)"
        );
        onKeyEnteredRegistration.cancel();
        await Drivers.find({ _id: { $in: keys_arr } }, function (err, _users) {
          users = _users;
          _users.forEach((element) => {
            if (element.supplier_id == req.body.supplier_id) {
              driversToken.push(element["fcmToken"]);
            }
          });
        });
        async.each(users, async function (data, callback) {
          let _Notification = new Notifications({
            from: "زبون جديد",
            user_id: data._id,
            title: "متابعة الطلبات",
            msg: "تم تلقي طلب جديد في حدود منطقتك الحالية",
            dt_date: getCurrentDateTime(),
            type: 1,
            body_parms: rs._id,
            isRead: false,
          });

          await _Notification.save();
          console.log("saved");
        });

        CreateNotificationMultiple(
          driversToken,
          "تم تلقي طلب جديد في حدود منطقتك الحالية",
          rs._id,
          "",
          ""
        );
        // reply.send(driversToken)
      });

      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addOrderDriver = async (req, reply) => {
  try {
    const driverFCM = await Drivers.find({ _id: req.body.driver_id }).select(
      "fcmToken"
    );
    const order = await Order.findOne({ _id: req.params.id }).populate(
      "user_id"
    );

    let _Notification = new Notifications({
      from: "زبون جديد",
      user_id: req.body.driver_id,
      title: "متابعة الطلبات",
      msg: "تم تلقي طلب جديد في حدود منطقتك الحالية",
      dt_date: getCurrentDateTime(),
      type: 1,
      body_parms: req.params.id,
      isRead: false,
    });
    await _Notification.save();
    CreateExtraNotification(
      driverFCM,
      "لديك طلب جديد في حدود منطقتك",
      order._id,
      "زبون جديد",
      req.body.driver_id
    );

    // if (order.nanaOrderId) {
    //     console.log('nanaOrderId: ' + order.nanaOrderId)
    //     var tokenObj = await tokens.findOne({ supplier_id: order.supplier_id })

    //     const obj = {
    //         order_id: order.nanaOrderId,
    //         level: "Shopping",
    //         token: tokenObj.token_id
    //     }
    //     console.log(obj)
    //     await updateNanaOrder(obj)
    // }

    const response = {
      status_code: 200,
      status: true,
      message: "تم تعديل الطلب بنجاح",
      items: order,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// update order status
exports.updateOrderByUser = async (req, reply) => {
  try {
    if (req.body.StatusId == 4) {
      // to cpanel also
      const order = await Order.findById(req.query.id)
        .populate("user_id")
        .populate("driver_id");
      // const clientFCM = order.user_id.fcmToken
      const arr = [];
      let msg = `تم استلام الطلب من العميل رقم الطلب: ${order._id}`;
      const driverFCM = order.driver_id.fcmToken;

      const sp = await Order.findByIdAndUpdate(
        req.query.id,
        {
          StatusId: req.body.StatusId,
        },
        { new: true }
      );

      CreateNotification(
        driverFCM,
        msg,
        order._id,
        order.user_id.full_name,
        order.driver_id._id
      );
      const response = {
        status_code: 200,
        status: true,
        message: "تم تعديل الطلب بنجاح",
        items: sp,
      };
      const devicesID = await Admin.find().select("fcmToken");
      devicesID.forEach((element) => {
        arr.push(element["fcmToken"]);
      });
      CreateNotificationMultiple(arr, msg, "", "", "");
      console.log(devicesID);

      return response;
    }
    if (req.body.StatusId == 5) {
      const _order = await Order.findById(req.query.id).populate("user_id");
      const tokenObj = await tokens.findOne({
        supplier_id: _order.supplier_id,
      });

      if (_order.StatusId == 1) {
        const order = await Order.findById(req.query.id).populate("user_id");
        let msg = `قام العميل بالغاء الطلب رقم: ${order._id}`;

        const arr = [];
        const devicesID = await Admin.find().select("fcmToken");
        devicesID.forEach((element) => {
          arr.push(element["fcmToken"]);
        });
        CreateNotificationMultiple(arr, msg, "", "", "");

        const sp = await Order.findByIdAndUpdate(
          req.query.id,
          {
            StatusId: req.body.StatusId,
            Notes: req.body.Notes,
          },
          { new: true }
        );

        const response = {
          status_code: 200,
          status: true,
          message: "تم تعديل الطلب بنجاح",
          items: sp,
        };
        return response;
      } else {
        const response = {
          status_code: 400,
          status: false,
          message:
            " عذرا لا يمكن الغاء الطلب جاري توصيله او قد يكون تم الغاء الطلب مسبقا",
          items: [],
        };
        return response;
      }
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

//update order driver
exports.updateOrderByDriver = async (req, reply) => {
  try {
    var users = [];
    const order = await Order.findById(req.query.id).populate("user_id");
    const tokenObj = await tokens.findOne({ supplier_id: order.supplier_id });
    // const clientFCM = '11'
    const clientFCM = order.user_id.fcmToken;
    // const driverFCM = order.driver_id.fcmToken;
    if (req.body.StatusId == 2) {
      if (order.StatusId == 5) {
        const response = {
          status_code: 404,
          status: false,
          message: "عذرا تم الغاء الطلب من قبل العميل",
          items: sp,
        };
        return response;
      } else {
        if (order.driver_id != null && order.driver_id) {
          const response = {
            status_code: 404,
            status: false,
            message: "عذرا تم قبول الطلب من قبل سائق اخر",
            items: [],
          };
          return response;
        } else {
          if (order.nanaOrderId) {
            const obj = {
              order_id: order.nanaOrderId,
              level: "Shopping",
              token: tokenObj.token_id,
            };
            let status1 = await updateNanaOrder(obj);
            console.log(status1);
            if (
              status1.data.result &&
              status1.data.result.new_level == "Shopping"
            ) {
              obj.level = "Packaged";
              console.log(obj);
              let status2 = await updateNanaOrder(obj);
              if (
                status2.data.result &&
                status2.data.result.new_level == "Packaged"
              ) {
                obj.level = "Delivering";
                console.log(obj);
                let status3 = await updateNanaOrder(obj);
                if (
                  status3.data.result &&
                  status3.data.result.new_level == "Delivering"
                ) {
                  let msg = `تم استلام طلبكم وجاري التوصيل طلب رقم: ${order._id}`;
                  const sp = await Order.findByIdAndUpdate(
                    req.query.id,
                    {
                      StatusId: req.body.StatusId,
                      Notes: req.body.Notes,
                      driver_id: req.user._id,
                    },
                    { new: true }
                  );
                  const driver = await Drivers.findById(req.user._id);
                  CreateNotification(
                    clientFCM,
                    msg,
                    order._id,
                    driver.name,
                    order.user_id._id
                  );
                  const response = {
                    status_code: 200,
                    status: true,
                    message: "تم تعديل الطلب بنجاح",
                    items: sp,
                  };
                  return response;
                } else {
                  let response = status3.data;
                  return response;
                }
              } else {
                let response = status2.data;
                return response;
              }
            } else {
              let response = status1.data;
              return response;
            }
          } else {
            let msg = `تم استلام طلبكم وجاري التوصيل طلب رقم: ${order._id}`;
            const sp = await Order.findByIdAndUpdate(
              req.query.id,
              {
                StatusId: req.body.StatusId,
                Notes: req.body.Notes,
                driver_id: req.user._id,
              },
              { new: true }
            );
            const driver = await Drivers.findById(req.user._id);
            CreateNotification(
              clientFCM,
              msg,
              order._id,
              driver.name,
              order.user_id._id
            );
            const response = {
              status_code: 200,
              status: true,
              message: "تم تعديل الطلب بنجاح",
              items: sp,
            };
            return response;
          }
        }
      }
    }
    if (req.body.StatusId == 3) {
      const _order = await Order.findById(req.query.id)
        .populate("user_id")
        .populate("driver_id");
      let msg = `تم توصيل طلبكم رقم: ${_order._id}`;
      console.log(_order);
      CreateNotification(
        clientFCM,
        msg,
        _order._id,
        _order.driver_id.name || "",
        _order.user_id._id
      );

      const _points = await Point.findOne({
        $and: [
          { supplier_id: _order.driver_id.supplier_id },
          { min_value: { $lt: _order.Total } },
          { max_value: { $gte: order.Total } },
        ],
      });

      if (_order.driver_id.supplier_id != "5c67f4ba0fb3d50d6e9f03f3") {
        //commision
        var commsions = await setting.findById("5d26ecdc7c213e5998ea3799");
        var commsion_val = parseFloat(commsions.value, 10);
        const _comapny_commesion = await companyCommision.findOne({
          supplier_id: _order.driver_id.supplier_id,
        });

        if (_comapny_commesion) {
          console.log("find");
          await companyCommision.findOneAndUpdate(
            { supplier_id: _order.driver_id.supplier_id },
            {
              $inc: { value: commsion_val },
            },
            { new: true }
          );
        } else {
          console.log("not find");
          let ـcompanyCommision = new companyCommision({
            supplier_id: _order.driver_id.supplier_id,
            value: commsion_val,
            totalPay: 0,
            dt_date: getCurrentDateTime(),
          });
          await ـcompanyCommision.save();
        }
      }

      const _user_points = await UserPoint.findOne({
        $and: [{ user_id: _order.user_id._id }],
      });

      if (_points) {
        console.log(_points);
        if (_user_points) {
          const UserPoints = await UserPoint.findByIdAndUpdate(
            _user_points._id,
            {
              $inc: { points: _points.points },
            },
            { new: true }
          );
        } else {
          let UserPoints = new UserPoint({
            user_id: _order.user_id._id,
            supplier_id: _order.driver_id.supplier_id,
            points: _points.points,
            point_price: _points.point_price,
          });
          await UserPoints.save();
          console.log(UserPoints);
        }
      }

      if (order.nanaOrderId) {
        const obj = {
          order_id: order.nanaOrderId,
          level: "Delivered",
          token: tokenObj.token_id,
        };
        let status = await updateNanaOrder(obj);
        if (status.data.result && status.data.result.new_level == "Delivered") {
          const sp = await Order.findByIdAndUpdate(
            req.query.id,
            {
              StatusId: req.body.StatusId,
              Notes: req.body.Notes,
            },
            { new: true }
          );

          const response = {
            status_code: 200,
            status: true,
            message: "تم تعديل الطلب بنجاح",
            items: sp,
          };
          return response;
        } else {
          const response = {
            status_code: 400,
            status: false,
            message: "حدث خطأ ما .. الرجاء المحاولة فيما بعد",
            items: [],
          };
          return response;
        }
      } else {
        const sp = await Order.findByIdAndUpdate(
          req.query.id,
          {
            StatusId: req.body.StatusId,
            Notes: req.body.Notes,
          },
          { new: true }
        );

        const response = {
          status_code: 200,
          status: true,
          message: "تم تعديل الطلب بنجاح",
          items: sp,
        };
        return response;
      }
    }
    if (req.body.StatusId == 6) {
      if (order.nanaOrderId) {
        const response = {
          status_code: 404,
          status: false,
          message:
            "لا يمكن الغاءالطلبات القادمة من نعناع الا بعد التواصل مع خدمة العملاء في نعناع",
          items: [],
        };
        return response;
      } else {
        if (order.StatusId == 1) {
          var raduis = await setting.findById("5c6758e0c65f421a494cef89");

          let msg = `قام السائق برفض الطلب رقم: ${order._id}`;
          console.log(msg);
          var arr = [];
          const driver = await Drivers.findById(req.user._id);
          let notification = CreateNotification(
            clientFCM,
            msg,
            order._id,
            driver.name,
            order.user_id._id
          );
          const sp = await Order.findByIdAndUpdate(
            req.query.id,
            {
              StatusId: 1,
              driver_id: null,
              Notes: "",
            },
            { new: true }
          );

          const devicesID = await Admin.find().select("fcmToken");
          devicesID.forEach((element) => {
            arr.push(element["fcmToken"]);
          });
          CreateNotificationMultiple(arr, msg, "", "", "");

          var database = firebase.database(); // Ref to Firebase Database
          var geoFire = new GeoFire(database.ref("userLocation")); // Ref to 'Item Locations' table
          // geoFire.set('3',[21.400404, 23.1030303]);
          var driversToken = [];
          var keys_arr = [];
          let geoQuery = geoFire.query({
            center: [Number(order.lat), Number(order.lng)],
            radius: 1000,
          });

          var onKeyEnteredRegistration = geoQuery.on("key_entered", function (
            key,
            location,
            distance
          ) {
            console.log(
              key +
                " entered query at " +
                location +
                " (" +
                distance +
                " km from center)"
            );
            let obj = {
              key: key,
              location: location,
              distance: distance,
            };
            console.log(key);
            if (distance <= parseFloat(raduis.value, 10)) {
              keys_arr.push(key);
            }
          });

          var onKeyExitedRegistration = geoQuery.on("ready", async function (
            key,
            location,
            distance
          ) {
            console.log(
              key +
                " exited query to " +
                location +
                " (" +
                distance +
                " km from center)"
            );
            onKeyEnteredRegistration.cancel();

            // const drivers = await Drivers.find({ _id: { $in: keys_arr } }).select('fcmToken')
            // console.log(drivers)
            // drivers.forEach(element => {
            // });
            await Drivers.find({ _id: { $in: keys_arr } }, function (
              err,
              _users
            ) {
              // console.log(users)
              users = _users;
              _users.forEach((element) => {
                driversToken.push(element.fcmToken);
              });
            });
            CreateNotificationMultiple(
              driversToken,
              "تم تلقي طلب جديد في حدود منطقتك الحالية",
              rs._id,
              "",
              User_id
            );
            async.each(users, async function (data, callback) {
              let _Notification = new Notifications({
                from: "زبون جديد",
                user_id: data._id,
                title: "متابعة الطلبات",
                msg: "تم تلقي طلب جديد في حدود منطقتك الحالية",
                dt_date: getCurrentDateTime(),
                type: 1,
                body_parms: rs._id,
                isRead: false,
              });

              await _Notification.save();
              console.log("saved");
            });
            // reply.send(driversToken)
          });

          const response = {
            status_code: 200,
            status: true,
            message: "تم تعديل الطلب بنجاح",
            items: sp,
          };
          return response;
        } else {
          const response = {
            status_code: 404,
            status: false,
            message: "عذرا لايمكن رفض الطلب بعد قبوله",
            items: [],
          };
          return response;
        }
      }
    }
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
        console.log("allOrderLikeItems: " + allOrderLikeItems);
        const summationOfRates = await userRate.find({
          product_id: element.product_id,
        });
        console.log("summationOfRates: " + summationOfRates);

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

    return response;
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

    return response;
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
    return response;
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

      await Order.find(query)
        .sort({ _id: -1 })
        .populate("user_id")
        .populate("driver_id")
        .populate({
          path: "items.product_id",
          populate: { path: "product_id" },
        })
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
    } else {
      await Order.find({ user_id: req.query.id, StatusId: req.query.staustId })
        .sort({ _id: -1 })
        .populate("user_id")
        // .populate('driver_id')
        .populate({
          path: "items.product_id",
          populate: { path: "product_id" },
        })
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
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get Driver Order
exports.getDriverOrder = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await Order.find({
      driver_id: req.query.id,
      StatusId: req.query.staustId,
    }).count();

    var result = [];
    await Order.find({ driver_id: req.query.id, StatusId: req.query.staustId })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("driver_id")
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, item) {
        result = item;
        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: result,
          pagenation: {
            size: result.length,
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

// Get Order Details
exports.getOrderDetails = async (req, reply) => {
  try {
    console.log(req.query.id);
    await Order.find({ Order_no: req.params.id })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate({
        path: "items.product_id",
        populate: { path: "product_id" },
      })
      .exec(async function (err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: item,
        };
        reply.send(response);
      });
  } catch {
    throw boom.boomify(err);
  }
};

exports.getOrderDetailsByRenter = async (req, reply) => {
  try {
    await Order.find({ Order_no: req.params.id })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate({
        path: "items.product_id",
        populate: { path: "product_id" },
      })
      .exec(async function (err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: item,
        };
        reply.send(response);
      });
  } catch {
    throw boom.boomify(err);
  }
};

//check drivers in range in refill gaz
exports.checkAvailableDrivers = async (req, reply) => {
  try {
    var database = firebase.database(); // Ref to Firebase Database
    var geoFire = new GeoFire(database.ref("userLocation")); // Ref to 'Item Locations' table
    // geoFire.set('3',[21.400404, 23.1030303]);
    var raduis = await setting.findById("5c6758e0c65f421a494cef89");
    console.log(Number(req.body.lat), Number(req.body.lng));
    var keys_arr = [];
    let geoQuery = geoFire.query({
      center: [Number(req.body.lat), Number(req.body.lng)],
      radius: 1000,
    });

    var onKeyEnteredRegistration = geoQuery.on("key_entered", function (
      key,
      location,
      distance
    ) {
      console.log(
        key +
          " entered query at " +
          location +
          " (" +
          distance +
          " km from center)"
      );
      if (distance <= parseFloat(raduis.value, 10)) {
        keys_arr.push(key);
      }
    });

    var onKeyExitedRegistration = geoQuery.on("ready", async function (
      key,
      location,
      distance
    ) {
      console.log(
        key +
          " exited query to " +
          location +
          " (" +
          distance +
          " km from center)"
      );
      onKeyEnteredRegistration.cancel();

      if (keys_arr.length > 0) {
        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: null,
        };
        reply.send(response);
      } else {
        const response = {
          status_code: 404,
          status: false,
          message:
            "منطقتك غير مغطاة: نعتذر منكم منطقتكم غير مغطاة بخدمة سوق غاز نعمل جاهدين لتغطية المنظقة وخدمتكم في أقرب وقت",
          items: null,
        };
        reply.send(response);
      }
    });
  } catch (err) {
    // const response = {
    //     status_code: 404,
    //     status: false,
    //     message: 'عذرا منطقتك خارج التغطية الرجاء المحاولة فيما بعد',
    //     items: null,
    // }
    // reply.send(response)
    throw boom.boomify(err);
  }
};

//check nearest suppliers
exports.checkAvailableSupplier = async (req, reply) => {
  try {
    var database = firebase.database(); // Ref to Firebase Database
    var geoFire = new GeoFire(database.ref("userLocation"));
    var raduis = 100;
    console.log(Number(req.body.lat), Number(req.body.lng));
    var keys_arr = [];
    let geoQuery = geoFire.query({
      center: [Number(req.body.lat), Number(req.body.lng)],
      radius: 1000,
    });

    var onKeyEnteredRegistration = geoQuery.on("key_entered", function (
      key,
      location,
      distance
    ) {
      console.log(
        key +
          " entered query at " +
          location +
          " (" +
          distance +
          " km from center)"
      );
      if (distance <= raduis) {
        keys_arr.push({ driverID: key, Distance: distance });
      }
    });

    var onKeyExitedRegistration = geoQuery.on("ready", async function (
      key,
      location,
      distance
    ) {
      console.log(
        key +
          " exited query to " +
          location +
          " (" +
          distance +
          " km from center)"
      );
      onKeyEnteredRegistration.cancel();

      if (keys_arr.length > 0) {
        keys_arr.sort((one, two) => (one.Distance < two.Distance ? -1 : 1));
        console.log(keys_arr[0]["driverID"]);
        let supplier_id = await Drivers.findById(
          keys_arr[0]["driverID"]
        ).select("supplier_id");
        console.log(supplier_id);
        let supplierObj = await Supplier.findById(supplier_id["supplier_id"]);

        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: supplierObj,
        };

        reply.send(response);
      } else {
        const response = {
          status_code: 404,
          status: false,
          message:
            "منطقتك غير مغطاة: نعتذر منكم منطقتكم غير مغطاة بخدمة سوق غاز نعمل جاهدين لتغطية المنظقة وخدمتكم في أقرب وقت",
          items: null,
        };
        reply.send(response);
      }
    });
  } catch (err) {
    // const response = {
    //     status_code: 404,
    //     status: false,
    //     message: 'عذرا منطقتك خارج التغطية الرجاء المحاولة فيما بعد',
    //     items: null,
    // }
    // reply.send(response)
    throw boom.boomify(err);
  }
};

// cPanel
exports.getOrders = async (req, reply) => {
  try {
    const supplier_id = req.params.id;

    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await Order.find({
      $and: [{ orderType: { $ne: 3 } }, { supplier_id: supplier_id }],
    }).count();

    await Order.find({
      $and: [{ orderType: { $ne: 3 } }, { supplier_id: supplier_id }],
    })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("driver_id")
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, item) {
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
      });
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

    await Order.find({
      user_id: req.params.id,
    })
      .sort({ _id: -1 })
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, item) {
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
      });
  } catch {
    throw boom.boomify(err);
  }
};

exports.getTunckOrders = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await Order.find({ orderType: 3 }).count();

    await Order.find({ orderType: 3 })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("driver_id")
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, item) {
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
      });
  } catch {
    throw boom.boomify(err);
  }
};

exports.getOrdersSeacrh = async (req, reply) => {
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
    //   query = { createAt: { $lt: end_date } };
    // }
    // if (start_date != "" && start_date != undefined) {
    //   start_date = new Date(start_date);
    //   start_date = start_date.setHours(0, 0, 0, 0);
    //   start_date = new Date(start_date);
    //   query = {
    //     createAt: { $gte: start_date },
    //   };
    // }
    if (start_date != "" && end_date != "") {
      query = {
        createAt: {
          $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
          $lt: new Date(new Date(end_date).setHours(23, 59, 59)),
        },

        // createAt: { $gte: start_date, $lt: end_date },
      };
    }
    if (req.body.renter_id != "" && req.body.renter_id) {
      query = { provider_id: req.body.renter_id };
    }
    console.log(query);
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
    await Order.find(query)
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("city_id")
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .populate({ path: "items.by_admin_id", populate: { path: "admins" } })
      .populate({ path: "items.by_user_id", populate: { path: "renters" } })
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, item) {
        // console.log(item);
        // var result = _.filter(item, function (itm) {
        //   console.log(req.body.renter_id);
        //   return item;
        //   // if (req.body.renter_id) {
        //   //   return itm.items.some(function(x) {
        //   //     console.log(x);
        //   //     if (x.by_user_id) {
        //   //       return x.product_id.by_user_id == req.body.renter_id;
        //   //     }
        //   //   });
        //   // } else {

        //   // }
        // });
        // var result1 = lodash(result)
        //   .slice(page * limit)
        //   .take(limit)
        //   .value();
        const response = {
          items: item,
          status_code: 200,
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
      });
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
    console.log(query);
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
    await Order.find(query)
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("city_id")
      .populate({ path: "items.product_id", populate: { path: "product_id" } })
      .populate({ path: "items.by_admin_id", populate: { path: "admins" } })
      .populate({ path: "items.by_user_id", populate: { path: "renters" } })
      .exec(function (err, item) {
        const response = {
          items: item,
          status_code: 200,
          message: "returned successfully",
          Total: Total,
          Total_Discount: Total_Discount,
          Admin_Total: Admin_Total,
          Renter_Total: Renter_Total,
        };
        reply.send(response);
      });
  } catch {
    throw boom.boomify();
  }
};

exports.getRatedOrders = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await userRate.find().count();

    await userRate
      .find()
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("order_id")
      .populate("product_id")
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, item) {
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
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getApproveRatedOrders = async (req, reply) => {
  try {
    await userRate
      .find({ isCommentApproved: true })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("order_id")
      .populate("product_id")
      .limit(8)
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

exports.getRatedProducts = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await prodcutComment.find().count();

    await prodcutComment
      .find()
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("product_id")
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, item) {
        console.log(item);
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
      });
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

    await prodcutComment
      .find({ product_id: req.params.id, isCommentApproved: true })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("product_id")
      .skip(page * limit)
      .limit(limit)
      .exec(function (err, item) {
        console.log(item);
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
      });
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
    console.log(req.params.id);
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

    return response;
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
    console.log(utc, current);
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

exports.updateeee = async (req, reply) => {
  try {
    Order.updateMany({}, { supplier_id: "5c67f4ba0fb3d50d6e9f03f3" }, function (
      err,
      res
    ) {
      if (err) {
        const response = {
          status_code: 400,
          status: false,
          message: "حدث خطأ الرجاء المحاولة مرة اخرى",
          items: [],
        };
        reply.send(response);
      } else {
        const response = {
          status_code: 200,
          status: true,
          message: "تم تعديل بنجاح",
          items: [],
        };
        reply.send(response);
      }
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteOrder = async (req, reply) => {
  try {
    var percentage = 0.0;

    const _order = await Order.findById(req.params.id)
      .sort({ _id: -1 })
      .populate("user_id")
      .populate({
        path: "items.product_id",
        populate: { path: "product_id" },
      });

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
      var contract_id = await contract.findOne({ _id: reserve_id.contract_id });

      percentage = Number(contract_id.value);
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
    return response;
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
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);

    var query = {};
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
      .sort({ PeriodMonth: 1 })
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
    return response;
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
      return response;
    } else {
      const response = {
        status_code: 400,
        status: false,
        message: "الرجاء التأكد من القيم المدخلة",
        items: {},
      };
      return response;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};
