/**
 * @module controllers/adminController
 * @description
 * Manages back-office administrator accounts and their authentication. Covers
 * admin CRUD, credentialed login with JWT issuance, token refresh, logout and
 * password changes for the Rufuf administration dashboard.
 *
 * Exposed handlers:
 * - getAdmins / getSingleAdmin        List administrators or fetch one by id.
 * - addAdmin / updateAdmin / deleteAdmin  Create, edit and remove admin accounts.
 * - login / logout                    Authenticate an admin and end the session.
 * - refreshToken                      Issue a fresh JWT from a valid session.
 * - changePassword                    Update the authenticated admin's password.
 */

// External Dependancies
const boom = require("boom");
const jwt = require("jsonwebtoken");
const config = require("config");
const util = require("util");
require("dotenv").config();

// Get Data Models
const { Admin } = require("../models/Admin");
const {
  encryptPassword,
  decryptPassword,
  sendSMS,
  handleError,
} = require("../utils/utils");

// Get all Admins
exports.getAdmins = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await Admin.countDocuments()

    const item = await Admin.find()
      .sort({ _id: -1 })
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
    reply.send(response);
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
      token: jwt.sign({ _id: req.body.id }, process.env.jwtPrivateKey, {
        expiresIn: "365d",
      }),
    });
    var _return = handleError(Admins.validateSync);
    if (_return.length > 0) {
      reply.code(200).send({
        status_code: 400,
        status: false,
        message: _return[0],
        items: _return,
      });
      return;
    }
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
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

//login
exports.login = async (req, reply) => {
  try {
    const pass = encryptPassword(req.body.password);
    const Admins = await Admin.findOne({
      $and: [{ email: req.body.email }, { password: pass }],
    });
    if (Admins) {
      const _Admins = await Admin.findByIdAndUpdate(
        Admins._id,
        {
          token: jwt.sign({ _id: req.params.id }, process.env.jwtPrivateKey, {
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
      reply.send(response);
    } else {
      const response = {
        status_code: 404,
        status: false,
        message: "تمت العملية بنجاح",
        items: null,
      };
      reply.send(response);
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
      reply.send(response);
    } else {
      const response = {
        status_code: 200,
        status: true,
        message: "",
        items: user,
      };
      reply.send(response);
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
  reply.send(response);
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
        token: jwt.sign({ _id: req.params.id }, process.env.jwtPrivateKey, {
          expiresIn: "365d",
        }),
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
      items: Admins,
    };
    reply.send(response);
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
