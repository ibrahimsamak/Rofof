/**
 * @module controllers/renterController
 * @description
 * Manages renters (rack/shelf tenants) who list products on the Rufuf
 * marketplace. Covers renter onboarding and login, profile management, password
 * reset/change, SMS/email verification codes, blocking, Excel exports and the
 * search/listing endpoints used by the admin dashboard.
 *
 * Exposed handlers:
 * - getrenters / getSinglerenters / getRenters / RenterList / userlistInfo  List and fetch renters.
 * - getRentersExcel                                   Export the renter list to Excel.
 * - addrenters                                        Register a new renter account.
 * - login / forgetPassword / changePassword           Authenticate and manage credentials.
 * - updateprofileFromAdmin / updateAdd / updateEdit / userprofile  Update renter profiles.
 * - ApproveCode / CheckApproveCode                    Issue and validate verification codes.
 * - sendSMSRender / sendEmailRender                   Send SMS / email notifications to a renter.
 * - uploadRenterPhoto                                 Upload a renter profile photo.
 * - rentersearch / block                              Search and moderate renters.
 */

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
require("dotenv").config();

cloudinary.config({
  cloud_name: "dsz57mpwt",
  api_key: "798849627961531",
  api_secret: "mluiA31CtWFTj5E5EMPRS5tvQXw",
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
const { renters } = require("../models/Renter");
const { getCurrentDateTime } = require("../models/Constant");
const {
  encryptPassword,
  decryptPassword,
  sendSMS,
  mail_general,
  makeid,
  uploadImages,
  makeCode,
  handleError,
} = require("../utils/utils");
const { reserve, rack } = require("../models/Rack");
const { Product } = require("../models/Product");
const { Order } = require("../models/Order");
const { PaymnetLog, Transaction } = require("../models/Payment");

// Get all renters
exports.getrenters = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    let search_field = req.body.search_field;
    let search_value = req.body.search_value;
    let sort_value = req.body.sort_value;
    let sort_field = req.body.sort_field;

    let sort = {};
    sort[sort_field] = Number(sort_value);

    let query1 = {};
    var contracts = [];
    var _renters = [];
    if (search_field == "no") {
      contracts = await reserve.find({ contract_no: search_value });
      contracts.forEach((element) => {
        _renters.push(element.renter_id);
      });
      const total = await renters.countDocuments({$and:[{ _id: { $in: _renters }},{isDeleted: false}] })
      var item = await renters
        .find({$and:[{ _id: { $in: _renters }},{isDeleted: false}] })
        .sort({ [sort_field]: sort_value })
        .skip(page * limit)
        .limit(limit);
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
      if (sort_field == "contract_no") {
        newArray.sort((a, b) => {
          var nameA = a.contract_no;
          var nameB = b.contract_no;
          if (Number(sort_value) == 1) return nameA > nameB;
          if (Number(sort_value) == -1) return nameA < nameB;
        });
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
    } else {
      query1[search_field] = { $regex: new RegExp(search_value, "i") };
      query1["isDeleted"] = false
      const total = await renters.countDocuments(query1);

      var item = await renters
        .find(query1)
        .sort({ [sort_field]: sort_value })
        .skip(page * limit)
        .limit(limit);
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

      if (sort_field == "contract_no") {
        newArray.sort((a, b) => {
          var nameA = a.contract_no;
          var nameB = b.contract_no;
          if (Number(sort_value) == 1) return nameA > nameB;
          if (Number(sort_value) == -1) return nameA < nameB;
        });
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
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getRentersExcel = async (req, reply) => {
  try {
    let search_field = req.body.search_field;
    let search_value = req.body.search_value;
    let sort_value = req.body.sort_value;
    let sort_field = req.body.sort_field;

    let sort = {};
    sort[sort_field] = Number(sort_value);
    let query1 = {};
    var contracts = [];
    var _renters = [];
    if (search_field == "no") {
      contracts = await reserve.find({ contract_no: search_value });
      contracts.forEach((element) => {
        _renters.push(element.renter_id);
      });
      var item = await renters
        .find({$and:[{ _id: { $in: _renters }},{isDeleted:false}] })
        .sort({ [sort_field]: sort_value });
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
      if (sort_field == "contract_no") {
        newArray.sort((a, b) => {
          var nameA = a.contract_no;
          var nameB = b.contract_no;
          if (Number(sort_value) == 1) return nameA > nameB;
          if (Number(sort_value) == -1) return nameA < nameB;
        });
      }
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: newArray,
      };
      reply.send(response);
    } else {
      query1[search_field] = { $regex: new RegExp(search_value, "i") };
      query1["isDeleted"] = false
      var item = await renters.find(query1).sort({ [sort_field]: sort_value });
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
      if (sort_field == "contract_no") {
        newArray.sort((a, b) => {
          var nameA = a.contract_no;
          var nameB = b.contract_no;
          if (Number(sort_value) == 1) return nameA > nameB;
          if (Number(sort_value) == -1) return nameA < nameB;
        });
      }
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: newArray,
      };
      reply.send(response);
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
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getRenters = async (req, reply) => {
  try {
    const _renters = await renters.find({isDeleted:false});
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _renters,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Add a new renters
exports.addrenters = async (req, reply) => {
  try {
    const _user = await renters.findOne({
     $and:[{  phone_number: req.body.phone_number},{isDeleted:false}]
    });
    if (_user) {
      if (_user.isBlock == true) {
        const response = {
          status_code: 400,
          status: false,
          message: "تم حظر المستخدم من قبل الادارة",
          items: [],
        };
        reply.send(response);
      } else {
        const response = {
          status_code: 400,
          status: false,
          message: "رقم الجوال موجود لدينا مسبقا",
          items: [],
        };
        reply.send(response);
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
        isEnableEdit:false,
        isEnableAdd:false,
        isDeleted:false
      });
      var _return = handleError(_user.validateSync());
      if (_return.length > 0) {
        reply.code(200).send({
          status_code: 400,
          status: false,
          message: _return[0],
          items: _return,
        });
        return;
      }
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

    const user = await renters.findOne({
     $and:[
      { phone_number: req.body.phone_number},
      {password: pass,},
      {isDeleted:false}]
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
          token: jwt.sign({ _id: user.id }, process.env.jwtPrivateKey, {
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
      $and:[
        {phone_number: req.body.phone_number},
        {isDeleted:false}
      ]
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
      reply.send(response);
    } else {
      const response = {
        status_code: 404,
        status: false,
        message: "رقم الجوال غير مسجل لدينا",
        items: [],
      };
      reply.send(response);
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
      let rand = makeid();

      fs.writeFile(
        "./uploads/" + rand + files.image.name,
        data,
        "binary",
        function (err) {
          if (err) {
            console.log("There was an error writing the image");
          } else {
            console.log("The sheel file was written");
          }
        }
      );

      let img = "";
      await uploadImages(rand + files.image.name).then((x) => {
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
        items: categories,
      };
      reply.send(response);
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
        items: categories,
      };
      reply.send(response);
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
        reply.send(response);
      } else {
        const response = {
          status_code: 400,
          status: false,
          message: "كلمة المرور القديمة غير صحيحة",
          items: {},
        };
        reply.send(response);
      }
    } else {
      const response = {
        status_code: 404,
        status: false,
        message: "المستخدم غير موجود",
        items: [],
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
    var xx = await renters.find({
     $and:[
      {isDeleted:false},
      { $or: [
        { full_name: { $regex: ".*" + req.body.full_name + ".*" } },
        { phone_number: { $regex: ".*" + req.body.phone_number + ".*" } }]
      }]
    });
    result = xx;
    const response = {
      items: result,
      status_code: 200,
      message: "returned successfully",
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.RenterList = async (req, reply) => {
  try {
    const _Users = await renters
      .find({isDeleted:false})
      .sort({ createAt: -1 })
      .select(["-token", "-password"]);
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _Users,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.userlistInfo = async (req, reply) => {
  try {
    const ـrenters = await renters.find({isDeleted:false}).sort({ createAt: -1 });
    const response = {
      items: ـrenters,
      status_code: 200,
      message: "returned successfully",
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.block = async (req, reply) => {
  try {
   await renters.findByIdAndUpdate(req.body._id,{ isDeleted:true },{new: true});

  //  Transaction.deleteMany(
  //   { provider_id: req.body._id },
  //   function (err, res) {}
  // );

  //  PaymnetLog.deleteMany(
  //   { by_user_id: req.body._id },
  //   function (err, res) {}
  // );


    Product.updateMany(
      { by_user_id: req.body._id },
      {isDeleted:true},
      function (err, res) {}
    );

    let reserve_rack = await reserve.find({renter_id:req.body._id})
    for await (const item of reserve_rack){
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
  

    reserve.updateMany(
      { renter_id: req.body._id },
      { isFinish: true },
      function (err, res) {}
    );

    // Order.deleteMany(
    //   { renter_id: req.body._id },
    //   function (err, res) {}
    // );

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


exports.updateAdd = async (req, reply) => {
  try {
    const user = await renters.findByIdAndUpdate(
      req.body._id,
      {
        isEnableAdd: req.body.isEnableAdd ? req.body.isEnableAdd : false,
      },
      { new: true }
    );

    var msg = ""
    if(String(req.body.isEnableAdd) == "true"){
      msg = "تم تفعيل اضافة المنتجات"
    }else{
      msg = "تم تعطيل اضافة المنتجات"
    }

    

    const response = {
      status_code: 200,
      status: true,
      message: msg,
      items: user,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateEdit = async (req, reply) => {
  try {
    const user = await renters.findByIdAndUpdate(
      req.body._id,
      {
        isEnableEdit: req.body.isEnableEdit ? req.body.isEnableEdit : false,
      },
      { new: true }
    );

    var msg = ""
    if(String(req.body.isEnableEdit) == "true"){
      msg = "تم تفعيل تعديل المنتجات"
    }else{
      msg = "تم تعطيل تعديل المنتجات"
    }

    
    const response = {
      status_code: 200,
      status: true,
      message: msg,
      items: user,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};


exports.ApproveCode = async (req, reply) => {
  try {
    var code = makeCode();
    var url = "https://rufuf.sa/خدمة-استئجار-الرفوف/page-517561797";
  
    const user = await renters.findByIdAndUpdate(
      req.body.id,
      {
        ApproveCode: code,
        isApproveCode: false,
      },
      { new: true }
    );

     await reserve.findByIdAndUpdate(
      req.body.reserve_id,
      {
        ApproveCode: code,
        isApproveCode: false,
      },
      { new: true }
    );

    let _reserve = await reserve
      .findById(req.body.reserve_id)
      .sort({ _id: -1 });
    let contract_no = "";
    if (_reserve) {
      contract_no = _reserve.contract_no;
    }
    // var msg = `تم إنشاء/تجديد عقد رقم ${contract_no} نرجو مشاركة رقم الكود ${code} مع موظف المتجر لتأكيد الموافقة على العقد.`;

    var msg = `تم إنشاء/ تجديد عقدكم رقم ${contract_no} ، نرجو قراءة الشروط و الأحكام، بالضغط على الرابط ${url}
    ملاحظة: بعد مرور إسبوعين من الإبلاغ عن موعد انتهاء العقد تسقط ملكية العميل لمقتنياته في حال عدم استلامها. 
    للموافقة نرجو مشاركة رقم الكود ${code}  مع موظف المتجر`;

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
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.CheckApproveCode = async (req, reply) => {
  try {
    const user = await renters.findById(req.body.id);
    const reserve_check = await reserve.findById(req.body.reserve_id);
    if (user.ApproveCode == req.body.ApproveCode) {
      const _user = await renters.findByIdAndUpdate(
        req.body.id,
        {
          isApproveCode: true,
        },
        { new: true }
      );
      if (reserve_check.ApproveCode == req.body.ApproveCode) {
         await reserve.findByIdAndUpdate(
          req.body.reserve_id,
          {
            isApproveCode: true,
          },
          { new: true }
        );
      }

      let url = "https://rent.rufuf.sa";
      let username = _user.phone_number;
      let password = decryptPassword(_user.password);
      var msg = `تم تفعيل حسابكم بنجاح رابط الدخول هو: ${url} \n اسم المستخدم: ${username} \n كلمة المرور: ${password} \n نتمنى لكم تجارة مربحة معنا`;
      sendSMS(_user.phone_number, "", "", msg);

      var data = {
        full_name: _user.name,
        msg: msg,
      };
      mail_general(req, _user.email, "ادارة منصة رفوف مقتنياتي", "", data);

      let _reserve = await reserve.findById(req.body.reserve_id)
        .sort({ _id: -1 });
      let contract_no = "";
      if (_reserve) {
        contract_no = _reserve.contract_no;
        start_date = moment(_reserve.start_date).format("DD/MM/YYYY");
        end_date = moment(_reserve.end_date).format("DD/MM/YYYY");
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
      reply.send(response);
    } else {
      const response = {
        status_code: 400,
        status: false,
        message: "كود التفعيل خاطئ",
        items: {},
      };
      reply.send(response);
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
    let rand = makeid();

    fs.writeFile(
      "./uploads/" + rand + files.image.name,
      data,
      "binary",
      function (err) {
        if (err) {
          console.log("There was an error writing the image");
        } else {
          console.log("The sheel file was written");
        }
      }
    );

    cloudinary.v2.uploader.upload(
      "./uploads/" + rand + files.image.name,
      function (error, result) {
        console.log(result, error);
        reply.send(result);
      }
    );
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
    reply.send(response);
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
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};
