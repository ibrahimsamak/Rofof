// External Dependancies
const boom = require("boom");
const jwt = require("jsonwebtoken");
const config = require("config");
const fs = require("fs");
const util = require("util");
const NodeGeocoder = require("node-geocoder");
const concat = require("concat-stream");
const pump = require("pump");
const cloudinary = require("cloudinary");
const multer = require("multer");
const moment = require("moment");

cloudinary.config({
  cloud_name: "dclevhb0f",
  api_key: "199179485788727",
  api_secret: "rer8MIlm4zbw1ddW33_X02Phtl8",
});

const options = {
  provider: "google",
  // Optional depending on the providers
  httpAdapter: "https", // Default
  apiKey: "AIzaSyDP-XwnS5Daa_uSFZJvY6H0hsKaOxe2ar0", // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
};
const geocoder = NodeGeocoder(options);

// Get Data Models
const { renters } = require("../models/Driver");
const { getCurrentDateTime } = require("../models/Constant");
const {
  encryptPassword,
  decryptPassword,
  sendSMS,
  mail_general,
} = require("../utils/utils");
const { reserve } = require("../models/Rack");

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
          current_city = "";
          resolve(current_city);
        }
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
        current_city = "";
      });
  });
}

async function uploadImages(img) {
  return new Promise(function (resolve, reject) {
    cloudinary.v2.uploader.upload("./uploads/" + img, function (error, result) {
      if (error) {
        reject(error);
      } else {
        console.log(result, error);
        img = result["url"];
        resolve(img);
      }
    });
  });
}

function makeid() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function makeCode() {
  var text = "";
  var possible = "0123456789";

  for (var i = 0; i < 4; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

// Get all renters
exports.getrenters = async (req, reply) => {
  try {
    console.log(req.body);
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    let search_field = req.body.search_field;
    let search_value = req.body.search_value;

    let query1 = {};
    var contracts = [];
    var _renters = [];
    if (search_field == "no") {
      contracts = await reserve.find({ contract_no: search_value });
      contracts.forEach((element) => {
        _renters.push(element.renter_id);
      });
      const total = await renters.find({ _id: { $in: _renters } }).count();
      await renters
        .find({ _id: { $in: _renters } })
        .sort({ createAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .exec(async function (err, item) {
          var newArray = [];
          for await (const newItem of item) {
            var newObject = newItem.toObject();
            var _reserve = await reserve
              .findOne({
                $and: [{ renter_id: newItem._id }, { isApprove: true }],
              })
              .sort({ _id: -1 });
            if (_reserve) {
              newObject.contract_no = _reserve.contract_no;
              newObject.amount = _reserve.amount;
              newObject.start_date = _reserve.start_date;
              newObject.end_date = _reserve.end_date;
            } else {
              newObject.contract_no = "";
              newObject.amount = "";
              newObject.start_date = "";
              newObject.end_date = "";
            }

            newArray.push(newObject);
          }
          const response = {
            status_code: 200,
            status: true,
            message: "تمت العملية بنجاح",
            items: newArray,
            pagenation: {
              size: newArray.length,
              totalElements: total,
              totalPages: Math.floor(total / limit),
              pageNumber: page,
            },
          };
          reply.send(response);
        });
    } else {
      query1[search_field] = { $regex: new RegExp(search_value, "i") };
      const total = await renters.find(query1).count();

      await renters
        .find(query1)
        .sort({ createAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .exec(async function (err, item) {
          var newArray = [];
          for await (const newItem of item) {
            var newObject = newItem.toObject();
            var _reserve = await reserve
              .findOne({
                $and: [{ renter_id: newItem._id }, { isApprove: true }],
              })
              .sort({ _id: -1 });
            if (_reserve) {
              newObject.contract_no = _reserve.contract_no;
              newObject.amount = _reserve.amount;
              newObject.start_date = _reserve.start_date;
              newObject.end_date = _reserve.end_date;
            } else {
              newObject.contract_no = "";
              newObject.amount = "";
              newObject.start_date = "";
              newObject.end_date = "";
            }
            newArray.push(newObject);
          }
          const response = {
            status_code: 200,
            status: true,
            message: "تمت العملية بنجاح",
            items: newArray,
            pagenation: {
              size: newArray.length,
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

exports.getRentersExcel = async (req, reply) => {
  try {
    console.log(req.body);
    let search_field = req.body.search_field;
    let search_value = req.body.search_value;

    let query1 = {};
    var contracts = [];
    var _renters = [];
    if (search_field == "no") {
      contracts = await reserve.find({ contract_no: search_value });
      contracts.forEach((element) => {
        _renters.push(element.renter_id);
      });
      await renters
        .find({ _id: { $in: _renters } })
        .sort({ createAt: -1 })
        .exec(async function (err, item) {
          var newArray = [];
          for await (const newItem of item) {
            var newObject = newItem.toObject();
            var _reserve = await reserve
              .findOne({
                $and: [{ renter_id: newItem._id }, { isApprove: true }],
              })
              .sort({ _id: -1 });
            if (_reserve) {
              newObject.contract_no = _reserve.contract_no;
              newObject.amount = _reserve.amount;
              newObject.start_date = _reserve.start_date;
              newObject.end_date = _reserve.end_date;
            } else {
              newObject.contract_no = "";
              newObject.amount = "";
              newObject.start_date = "";
              newObject.end_date = "";
            }

            newArray.push(newObject);
          }
          const response = {
            status_code: 200,
            status: true,
            message: "تمت العملية بنجاح",
            items: newArray,
          };
          reply.send(response);
        });
    } else {
      query1[search_field] = { $regex: new RegExp(search_value, "i") };
      await renters
        .find(query1)
        .sort({ createAt: -1 })
        .exec(async function (err, item) {
          var newArray = [];
          for await (const newItem of item) {
            var newObject = newItem.toObject();
            var _reserve = await reserve
              .findOne({
                $and: [{ renter_id: newItem._id }, { isApprove: true }],
              })
              .sort({ _id: -1 });
            if (_reserve) {
              newObject.contract_no = _reserve.contract_no;
              newObject.amount = _reserve.amount;
              newObject.start_date = _reserve.start_date;
              newObject.end_date = _reserve.end_date;
            } else {
              newObject.contract_no = "";
              newObject.amount = "";
              newObject.start_date = "";
              newObject.end_date = "";
            }
            newArray.push(newObject);
          }
          const response = {
            status_code: 200,
            status: true,
            message: "تمت العملية بنجاح",
            items: newArray,
          };
          reply.send(response);
        });
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get single renters by ID
exports.getSinglerenters = async (req, reply) => {
  try {
    const _renters = await renters.findById(req.params.id);
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _renters,
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getRenters = async (req, reply) => {
  try {
    const _renters = await renters.find();
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _renters,
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Add a new renters
exports.addrenters = async (req, reply) => {
  try {
    const _user = await renters.findOne({
      phone_number: req.body.phone_number,
    });
    if (_user) {
      if (_user.isBlock == true) {
        const response = {
          status_code: 400,
          status: false,
          message: "تم حظر المستخدم من قبل الادارة",
          items: [],
        };
        return response;
      } else {
        const response = {
          status_code: 400,
          status: false,
          message: "البريد الالكتروني او رقم الجوال موجود لدينا مسبقا",
          items: [],
        };
        return response;
      }
    } else {
      let _user = new renters({
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
        address: req.body.address,
        phone_number: req.body.phone_number,
        password: encryptPassword(req.body.phone_number),
        isBlock: false,
        createAt: getCurrentDateTime(),
        isOnlineSupport: req.body.isOnlineSupport,
        IBAN: req.body.IBAN,
        BankName: req.body.BankName,
      });
      let rs = await _user.save();

      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: rs,
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

//login
exports.login = async (req, reply) => {
  try {
    let pass = encryptPassword(req.body.password);
    console.log(pass);
    const user = await renters.findOne({
      phone_number: req.body.phone_number,
      password: pass,
    });
    if (!user) {
      const response = {
        status_code: 404,
        status: false,
        message: "خطأ في البريد الالكتروني او كلمة المرور",
        items: [],
      };
      reply.send(response);
    } else {
      const ـuser = await renters.findByIdAndUpdate(
        user._id,
        {
          fcmToken: req.body.fcmToken,
          token: jwt.sign({ _id: user.id }, config.get("jwtPrivateKey"), {
            expiresIn: "365d",
          }),
        },
        { new: true }
      );
      const response = {
        status_code: 200,
        status: true,
        message: "تم تسجيل الدخول بنجاح",
        items: ـuser,
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

//forget password
exports.forgetPassword = async (req, reply) => {
  try {
    let newPassword = makeid();
    let pass = encryptPassword(newPassword);
    const _renters = await renters.findOne({
      phone_number: req.body.phone_number,
    });
    if (_renters) {
      const update = await renters.findByIdAndUpdate(
        _renters._id,
        { password: pass },
        { new: true }
      );

      var msg = "كلمة المرور الجديدة الخاصة بكم هي : " + newPassword;
      sendSMS(_renters.phone_number, "", "", msg);
      const response = {
        status_code: 200,
        status: true,
        message: "تم ارسال كلمة المرور الى رقم الجوال بنجاح",
        items: update,
      };
      return response;
    } else {
      const response = {
        status_code: 404,
        status: false,
        message: "رقم الجوال غير مسجل لدينا",
        items: [],
      };
      return response;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing renters
exports.updateprofileFromAdmin = async (req, reply) => {
  try {
    if (req.raw.files) {
      const files = req.raw.files;
      let fileArr = [];
      for (let key in files) {
        fileArr.push({
          name: files[key].name,
          mimetype: files[key].mimetype,
        });
      }
      var data = new Buffer(files.image.data);
      fs.writeFile("./uploads/" + files.image.name, data, "binary", function (
        err
      ) {
        if (err) {
          console.log("There was an error writing the image");
        } else {
          console.log("The sheel file was written");
        }
      });

      let img = "";
      await uploadImages(files.image.name).then((x) => {
        img = x;
      });
      const categories = await renters.findByIdAndUpdate(
        req.params.id,
        {
          name: req.raw.body.name,
          image: img,
          address: req.raw.body.address,
          email: req.raw.body.email,
          phone_number: req.raw.body.phone_number,
          isOnlineSupport: req.raw.body.isOnlineSupport,
          IBAN: req.raw.body.IBAN,
          BankName: req.raw.body.BankName,
        },
        { new: true }
      );
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: categories,
      };
      return response;
    } else {
      const categories = await renters.findByIdAndUpdate(
        req.params.id,
        {
          name: req.raw.body.name,
          address: req.raw.body.address,
          email: req.raw.body.email,
          phone_number: req.raw.body.phone_number,
          isOnlineSupport: req.raw.body.isOnlineSupport,
          IBAN: req.raw.body.IBAN,
          BankName: req.raw.body.BankName,
        },
        { new: true }
      );
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: categories,
      };
      return response;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

//change password
exports.changePassword = async (req, reply) => {
  try {
    const User_id = req.body._id;
    let pass = encryptPassword(req.body.pass);
    const old_password = encryptPassword(req.body.old_password);

    const _renters = await renters.findById(User_id);
    if (_renters) {
      if (old_password == _renters.password) {
        const update = await renters.findByIdAndUpdate(
          User_id,
          { password: pass },
          { new: true }
        );
        const response = {
          status_code: 200,
          status: true,
          message: "تم تعديل كلمة المرور بنجاح بنجاح",
          items: update,
        };
        return response;
      } else {
        const response = {
          status_code: 400,
          status: false,
          message: "كلمة المرور القديمة غير صحيحة",
          items: {},
        };
        return response;
      }
    } else {
      const response = {
        status_code: 404,
        status: false,
        message: "المستخدم غير موجود",
        items: [],
      };
      return response;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateStatus = async (req, reply) => {
  try {
    const Driver_id = req.user._id;
    const user = await renters.findByIdAndUpdate(
      Driver_id,
      {
        driver_status: req.body.driver_status,
      },
      { new: true }
    );
    if (user) {
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: user,
      };
      return response;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

//logout
exports.logout = async (req, reply) => {
  try {
    const Driver_id = req.user._id;
    const user = await renters.findByIdAndUpdate(
      Driver_id,
      {
        fcmToken: "",
        token: "",
      },
      { new: true }
    );

    if (!user) {
      const response = {
        status_code: 404,
        status: false,
        message: "حدث خطأ الرجاء المحاولة مرة اخرى",
        items: [],
      };
      reply.send(response);
    } else {
      const response = {
        status_code: 200,
        status: true,
        message: "تم تسجيل الخروج بنجاح",
        items: user,
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

//refresh token
exports.refreshTokenDriver = async (req, reply) => {
  try {
    const Driver_id = req.user._id;
    const _user = await renters.findByIdAndUpdate(
      Driver_id,
      {
        fcmToken: req.body.fcmToken,
      },
      { new: true }
    );

    if (!_user) {
      const response = {
        status_code: 404,
        status: false,
        message: "حدث خطأ الرجاء المحاولة مرة اخرى",
        items: [],
      };
      reply.send(response);
    } else {
      const response = {
        status_code: 200,
        status: true,
        message: "",
        items: _user,
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// cPanel
exports.rentersearch = async (req, reply) => {
  try {
    var result = [];
    await renters
      .find({
        $or: [
          { full_name: { $regex: ".*" + req.body.full_name + ".*" } },
          { phone_number: { $regex: ".*" + req.body.phone_number + ".*" } },
        ],
      })
      .exec(function (err, xx) {
        result = xx;
        const response = {
          items: result,
          status_code: 200,
          message: "returned successfully",
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.Driverlist = async (req, reply) => {
  try {
    const _Users = await renters
      .find()
      .sort({ createAt: -1 })
      .select(["-token", "-password"]);
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _Users,
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.userlistInfo = async (req, reply) => {
  try {
    const ـrenters = await renters.find().sort({ createAt: -1 });
    const response = {
      items: ـrenters,
      status_code: 200,
      message: "returned successfully",
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.block = async (req, reply) => {
  try {
    const user = await renters.findByIdAndUpdate(
      req.body._id,
      {
        isBlock: req.body.isBlock,
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: user,
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.ApproveCode = async (req, reply) => {
  try {
    var code = makeCode();
    const user = await renters.findByIdAndUpdate(
      req.body.id,
      {
        ApproveCode: code,
        isApproveCode: false,
      },
      { new: true }
    );

    let _reserve = await reserve
      .find({ renter_id: req.body.id })
      .sort({ _id: -1 });
    let contract_no = "";
    if (_reserve.length > 0) {
      contract_no = _reserve[0].contract_no;
    }
    var msg = `تم إنشاء/تجديد عقد رقم ${contract_no} نرجو مشاركة رقم الكود ${code} مع موظف المتجر لتأكيد الموافقة على العقد.`;

    sendSMS(user.phone_number, "", "", msg);
    var data = {
      full_name: user.name,
      msg: msg,
    };
    mail_general(req, user.email, "ادارة منصة رفوف مقتنياتي", "", data);

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: user,
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.CheckApproveCode = async (req, reply) => {
  try {
    const user = await renters.findById(req.body.id);
    if (user.ApproveCode == req.body.ApproveCode) {
      const _user = await renters.findByIdAndUpdate(
        req.body.id,
        {
          isApproveCode: true,
        },
        { new: true }
      );

      let url = "https://rofof-client-7f0e7.firebaseapp.com";
      let username = _user.email;
      let password = decryptPassword(_user.password);
      var msg = `تم تفعيل حسابكم بنجاح رابط الدخول هو: ${url} \n اسم المستخدم: ${username} \n كلمة المرور: ${password} \n نتمنى لكم تجارة مربحة معنا`;
      sendSMS(_user.phone_number, "", "", msg);

      var data = {
        full_name: _user.name,
        msg: msg,
      };
      mail_general(req, _user.email, "ادارة منصة رفوف مقتنياتي", "", data);

      let _reserve = await reserve
        .find({ renter_id: req.body.id })
        .sort({ _id: -1 });
      let contract_no = "";
      if (_reserve.length > 0) {
        contract_no = _reserve[0].contract_no;
        start_date = moment(_reserve[0].start_date).format("DD/MM/YYYY");
        end_date = moment(_reserve[0].end_date).format("DD/MM/YYYY");
      }
      var msg2 = `تم تفعيل عقد رقم ${contract_no} بنجاح \n بداية العقد: ${start_date} \n نهاية العقد: ${end_date} \n`;
      sendSMS(_user.phone_number, "", "", msg2);

      var data2 = {
        full_name: _user.name,
        msg: msg2,
      };
      mail_general(req, _user.email, "ادارة منصة رفوف مقتنياتي", "", data2);

      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: _user,
      };
      return response;
    } else {
      const response = {
        status_code: 400,
        status: false,
        message: "كود التفعيل خاطئ",
        items: {},
      };
      return response;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.userprofile = async (req, reply) => {
  try {
    const user = await renters
      .findById(req.params.id)
      .populate("supplier_id")
      .select(["-token"]);
    const response = {
      status_code: 200,
      status: true,
      message: "",
      items: user,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.uploadRenterPhoto = async (req, reply) => {
  if (req.raw.files) {
    const files = req.raw.files;
    let fileArr = [];
    for (let key in files) {
      fileArr.push({
        name: files[key].name,
        mimetype: files[key].mimetype,
      });
    }
    var data = new Buffer(files.image.data);
    fs.writeFile("./uploads/" + files.image.name, data, "binary", function (
      err
    ) {
      if (err) {
        console.log("There was an error writing the image");
      } else {
        console.log("The sheel file was written");
      }
    });

    cloudinary.v2.uploader.upload("./uploads/" + files.image.name, function (
      error,
      result
    ) {
      console.log(result, error);
      reply.send(result);
    });
  }
};

exports.sendSMSRender = async (req, reply) => {
  try {
    const user = await renters.findById(req.body.id);
    var msg = req.body.msg;
    sendSMS(user.phone_number, "", "", msg);
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: {},
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.sendEmailRender = async (req, reply) => {
  try {
    const user = await renters.findById(req.body.id);
    var data = {
      full_name: user.name,
      msg: req.body.msg,
    };
    mail_general(req, user.email, "ادارة منصة رفوف مقتنياتي", "", data);

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: {},
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};
