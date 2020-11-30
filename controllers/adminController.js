// External Dependancies
const boom = require("boom");
const jwt = require("jsonwebtoken");
const config = require("config");
const util = require("util");

// Get Data Models
const { Admin } = require("../models/Admin");
const { encryptPassword, decryptPassword, sendSMS } = require("../utils/utils");

// Get all Admins
exports.getAdmins = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await Admin.find().count();

    const Admins = await Admin.find()
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

// Get single Admin by ID
exports.getSingleAdmin = async (req, reply) => {
  try {
    const Admins = await Admin.findById(req.params.id);
    var adminObjet = Admins.toObject();
    adminObjet.password = decryptPassword(Admins.password);
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: adminObjet,
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Add a new Admin
exports.addAdmin = async (req, reply) => {
  try {
    let Admins = new Admin({
      full_name: req.body.full_name,
      email: req.body.email,
      password: encryptPassword(req.body.password),
      phone_number: req.body.phone_number,
      roles: req.body.roles,
      token: jwt.sign({ _id: req.body.id }, config.get("jwtPrivateKey"), {
        expiresIn: "365d",
      }),
    });

    let rs = await Admins.save();

    let msg =
      "تم انشاء حساب موظف على منصة رفوف \n البريد الالكتروني: " +
      rs.email +
      " كلمة المرور: " +
      decryptPassword(rs.password);

    sendSMS(rs.phone_number, "", "", msg);
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

//login
exports.login = async (req, reply) => {
  try {
    console.log(encryptPassword(req.body.password));
    const pass = encryptPassword(req.body.password);
    const Admins = await Admin.findOne({
      $and: [{ email: req.body.email }, { password: pass }],
    });
    console.log(Admins);
    if (Admins) {
      const _Admins = await Admin.findByIdAndUpdate(
        Admins._id,
        {
          token: jwt.sign({ _id: req.params.id }, config.get("jwtPrivateKey"), {
            expiresIn: "365d",
          }),
        },
        { new: true }
      );

      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: _Admins,
      };
      return response;
    } else {
      const response = {
        status_code: 404,
        status: false,
        message: "تمت العملية بنجاح",
        items: null,
      };
      return response;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// refresh token
exports.refreshToken = async (req, reply) => {
  try {
    const user = await Admin.findByIdAndUpdate(
      req.body._id,
      {
        fcmToken: req.body.fcmToken,
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
      return response;
    } else {
      const response = {
        status_code: 200,
        status: true,
        message: "",
        items: user,
      };
      return response;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// delete admin
exports.deleteAdmin = async (req, reply) => {
  const Admins = await Admin.findByIdAndRemove(req.params.id);
  const response = {
    status_code: 200,
    status: true,
    message: "تمت العملية بنجاح",
    items: [],
  };
  return response;
};

// Update an existing Admin
exports.updateAdmin = async (req, reply) => {
  try {
    const Admins = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        full_name: req.body.full_name,
        email: req.body.email,
        password: encryptPassword(req.body.password),
        phone_number: req.body.phone_number,
        roles: req.body.roles,
        token: jwt.sign({ _id: req.params.id }, config.get("jwtPrivateKey"), {
          expiresIn: "365d",
        }),
      },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: Admins,
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//logout
exports.logout = async (req, reply) => {
  try {
    const User_id = req.user._id;
    const user = await Users.findByIdAndUpdate(
      User_id,
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
      return response;
    } else {
      const response = {
        status_code: 200,
        status: true,
        message: "تم تسجيل الخروج بنجاح",
        items: user,
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
    const old_password = encryptPassword(req.body.old_password);
    const pass = encryptPassword(req.body.pass);

    const Users = await Admin.findById(User_id);
    if (Users) {
      if (old_password == Users.password) {
        const update = await Admin.findByIdAndUpdate(
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
