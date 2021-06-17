// External Dependancies
const boom = require("boom");
const jwt = require("jsonwebtoken");
const config = require("config");
const fs = require("fs");
const NodeGeocoder = require("node-geocoder");
const concat = require("concat-stream");
const pump = require("pump");
const cloudinary = require("cloudinary");
const multer = require("multer");
var moment = require("moment-timezone");
var nodemailer = require("nodemailer");
const { Notifications } = require("../models/Notifications");
require("dotenv").config();

cloudinary.config({
  cloud_name: "dsz57mpwt",
  api_key: "798849627961531",
  api_secret: "mluiA31CtWFTj5E5EMPRS5tvQXw",
});

var transporter = nodemailer.createTransport({
  host: "webhosting2035.is.cc",
  port: 465,
  secure: true,
  auth: {
    user: "no-reply@souqgaz.com",
    pass: "no-reply@souqgaz.com",
  },
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
const { Users, validateUsers } = require("../models/User");
const { getCurrentDateTime } = require("../models/Constant");
const {
  encryptPassword,
  sendSMS,
  makeid,
  uploadImages,
  handleError,
} = require("../utils/utils");

// Get all Users
exports.getUsers = async (req, reply) => {
  try {
    console.log(req.body);
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    let search_field = req.body.search_field;
    let search_value = req.body.search_value;

    let query1 = {};
    query1[search_field] = { $regex: new RegExp(search_value, "i") };

    const total = await Users.find(query1).count();
    var item = await Users.find(query1)
      .skip(page * limit)
      .limit(limit);
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
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get single Users by ID
exports.getSingleUsers = async (req, reply) => {
  try {
    const id = req.user._id;
    const _Users = await Users.findById(id);
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

// Add a new Users
exports.addUsers = async (req, reply) => {
  try {
    var current_city = "";
    const _user = await Users.findOne({
      $or: [{ phone_number: req.body.phone_number }, { email: req.body.email }],
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
          message: "البريد الالكتروني او رقم الجوال موجود لدينا مسبقا",
          items: [],
        };
        reply.send(response);
      }
    } else {
      let user = new Users({
        phone_number: req.body.phone_number,
        verify_code: 1234,
        full_name: req.body.full_name,
        email: req.body.email,
        password: encryptPassword(req.body.password),
        image: "",
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        createAt: getCurrentDateTime(),
        city: current_city,
        isVerify: false,
        isBlock: false,
        wallet: 0,
        gender: req.body.gender,
        currentCity: req.body.currentCity,
        RegisterType: req.body.RegisterType,
      });
      var _return = handleError(user.validateSync());
      if (_return.length > 0) {
        reply.code(200).send({
          status_code: 400,
          status: false,
          message: _return[0],
          items: _return,
        });
        return;
      }
      let rs = await user.save();

      const response = {
        status_code: 200,
        status: true,
        message: "أهلا وسهلا بكم .. تسجيل حسابكم بنجاح",
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
    const _Users = await Users.findOne({
      $and: [{ email: req.body.email, password: pass }],
    });
    if (_Users) {
      const user = await Users.findByIdAndUpdate(
        _Users.id,
        {
          fcmToken: req.body.fcmToken,
          token: jwt.sign({ _id: _Users._id }, process.env.jwtPrivateKey, {
            expiresIn: "365d",
          }),
        },
        { new: true }
      );

      const response = {
        status_code: 200,
        status: true,
        message: "تم التحقق بنجاح",
        items: user,
      };
      reply.send(response);
    } else {
      const response = {
        status_code: 404,
        status: false,
        message: "خطأ في الايميل او كلمة المرور",
        items: _Users,
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

//verfy code
exports.verfiy = async (req, reply) => {
  const _user = await Users.findOne({ _id: req.body.id }).select("verify_code");
  console.log(_user);

  if (_user.verify_code === req.body.verify_code) {
    const user = await Users.findByIdAndUpdate(
      req.body.id,
      {
        isVerify: true,
        fcmToken: req.body.fcmToken,
        token: jwt.sign({ _id: req.body.id }, process.env.jwtPrivateKey, {
          expiresIn: "365d",
        }),
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
  } else {
    const response = {
      status_code: 404,
      status: false,
      message: "خطأ!! في رقم التفعيل",
      items: [],
    };
    reply.send(response);
  }
};

//forget password
exports.forgetPassword = async (req, reply) => {
  try {
    let pass = encryptPassword(makeid());
    const _Users = await Users.findOne({ email: req.body.email });
    if (_Users) {
      var newPassword = makeid();
      const update = await Users.findByIdAndUpdate(
        _Users._id,
        { password: pass },
        { new: true }
      );
      var msg = `
           <!DOCTYPE html>
<html>
<head>
    <title></title>
</head>
<body>
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;background-color:#f8fafc;color:#74787e;height:100%;line-height:1.4;margin:0;width:100%!important;word-break:break-word">


    <table class="m_1006477609114479258wrapper" width="100%" cellpadding="0" cellspacing="0"
           style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;background-color:#f8fafc;margin:0;padding:0;width:100%">
        <tbody>
        <tr>
            <td align="center"
                style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box">
                <table class="m_1006477609114479258content" width="100%" cellpadding="0" cellspacing="0"
                       style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;margin:0;padding:0;width:100%">
                    <tbody>
                    <tr>
                        <td class="m_1006477609114479258header"
                            style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;padding:25px 0;text-align:center">
                            <a href="www.souqgaz.com"
                               style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;color:#bbbfc3;font-size:19px;font-weight:bold;text-decoration:none"
                               target="_blank"
                               data-saferedirecturl="www.souqgaz.com">
                                Souqgaz
                            </a>
                        </td>
                    </tr>


                    <tr>
                        <td class="m_1006477609114479258body" width="100%" cellpadding="0" cellspacing="0"
                            style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;background-color:#ffffff;border-bottom:1px solid #edeff2;border-top:1px solid #edeff2;margin:0;padding:0;width:100%">
                            <table class="m_1006477609114479258inner-body" align="center" width="570" cellpadding="0"
                                   cellspacing="0"
                                   style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;background-color:#ffffff;margin:0 auto;padding:0;width:570px">

                                <tbody>
                                <tr>
                                    <td class="m_1006477609114479258content-cell"
                                        style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;padding:35px">
                                        <h1 style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;color:#3d4852;font-size:19px;font-weight:bold;margin-top:0;text-align:left">
                                            Hello ${_Users.full_name}!</h1>
                                        <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;color:#3d4852;font-size:16px;line-height:1.5em;margin-top:0;text-align:left">
                                            we received your request to reset password</p>
                                        <table class="m_1006477609114479258action" align="center" width="100%"
                                               cellpadding="0" cellspacing="0"
                                               style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;margin:30px auto;padding:0;text-align:center;width:100%">
                                            <tbody>
                                            <tr>
                                                <td align="center"
                                                    style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box">
                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0"
                                                           style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box">
                                                        <tbody>
                                                        <tr>
                                                            <td align="center"
                                                                style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box">
                                                                <table border="0" cellpadding="0" cellspacing="0"
                                                                       style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box">
                                                                    <tbody>
                                                                    <tr>
                                                                        <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box">
                                                                            <a class="m_1006477609114479258button m_1006477609114479258button-primary"
                                                                               style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;border-radius:3px;color:#fff;display:inline-block;text-decoration:none;background-color:#3490dc;border-top:10px solid #3490dc;border-right:18px solid #3490dc;border-bottom:10px solid #3490dc;border-left:18px solid #3490dc">Your
                                                                                new password is: ${newPassword}</a>
                                                                        </td>
                                                                    </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;color:#3d4852;font-size:16px;line-height:1.5em;margin-top:0;text-align:left">
                                            Thank you for using our application!</p>
                                        <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;color:#3d4852;font-size:16px;line-height:1.5em;margin-top:0;text-align:left">
                                            Regards,<br>Souqgaz</p>

                                        <table class="m_1006477609114479258subcopy" width="100%" cellpadding="0"
                                               cellspacing="0"
                                               style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;border-top:1px solid #edeff2;margin-top:25px;padding-top:25px">
                                            <tbody>
                                            <tr>
                                                <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box">
                                                    <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;color:#3d4852;line-height:1.5em;margin-top:0;text-align:left;font-size:12px">
                                                        If you’re having trouble clicking the "Your password is: ${newPassword}"
                                                        button</p>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box">
                            <table class="m_1006477609114479258footer" align="center" width="570" cellpadding="0"
                                   cellspacing="0"
                                   style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;margin:0 auto;padding:0;text-align:center;width:570px">
                                <tbody>
                                <tr>
                                    <td class="m_1006477609114479258content-cell" align="center"
                                        style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;padding:35px">
                                        <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';box-sizing:border-box;line-height:1.5em;margin-top:0;color:#aeaeae;font-size:12px;text-align:center">
                                            © 2019 Souqgaz. All rights reserved.</p>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        </tbody>
    </table>
    <div class="yj6qo"></div>
    <div class="adL">
    </div>
</div>
</body>
</html>
           `;

      var mailOptions = {
        from: '"Souqgaz" <no-reply@souqgaz.com>',
        to: req.body.email,
        subject: "Forget Password",
        html: msg,
      };
      transporter.sendMail(mailOptions);
      const response = {
        status_code: 200,
        status: true,
        message: "تم ارسال كلمة المرور الى البريد الالكتروني بنجاح",
        items: update,
      };
      reply.send(response);
    } else {
      const response = {
        status_code: 404,
        status: false,
        message: "البريد الالكتروني غير مسجل لدينا",
        items: [],
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing Users
exports.updateprofileFromAdmin = async (req, reply) => {
  try {
    console.log(req.raw.body);
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
      const categories = await Users.findByIdAndUpdate(
        req.params.id,
        {
          full_name: req.raw.body.full_name,
          image: img,
          address: req.raw.body.address,
          phone_number: req.raw.body.phone_number,
          email: req.raw.body.email,
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
      const userPrev = await Users.findById(req.params.id);
      var pass;
      if (req.raw.body.password) {
        pass = encryptPassword(req.raw.body.password);
      } else {
        pass = userPrev.password;
      }
      const categories = await Users.findByIdAndUpdate(
        req.params.id,
        {
          full_name: req.raw.body.full_name,
          email: req.raw.body.email,
          phone_number: req.raw.body.phone_number,
          address: req.raw.body.address,
          password: pass,
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
        message: "تم تعديل الاعدادات بنجاح",
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
    const User_id = req.user._id;
    let pass = encryptPassword(req.body.password);
    const _Users = await Users.findById(User_id);
    if (_Users) {
      const update = await Users.findByIdAndUpdate(
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

//refresh token
exports.refreshToken = async (req, reply) => {
  try {
    const User_id = req.user._id;
    const user = await Users.findByIdAndUpdate(
      User_id,
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

//android
exports.uploadUserPhoto = async (req, reply) => {
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

exports.updateUserAndroid = async (req, reply) => {
  try {
    const user_id = req.user._id;
    if (req.body.image) {
      const user = await Users.findByIdAndUpdate(
        user_id,
        {
          image: req.body.image,
          address: req.body.address,
          full_name: req.body.full_name,
          gender: req.body.gender,
          currentCity: req.body.currentCity,
          phone_number: req.body.phone_number,
        },
        { new: true }
      );

      const response = {
        status_code: 200,
        status: true,
        message: "",
        items: user,
      };
      reply.send(response);
    } else {
      const user = await Users.findByIdAndUpdate(
        user_id,
        {
          address: req.body.address,
          full_name: req.body.full_name,
          gender: req.body.gender,
          currentCity: req.body.currentCity,
          phone_number: req.body.phone_number,
        },
        { new: true }
      );

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

// cPanel
exports.userSearch = async (req, reply) => {
  try {
    var result = [];
    var xx = await Users.find({
      $or: [
        { full_name: { $regex: ".*" + req.body.full_name + ".*" } },
        { phone_number: { $regex: ".*" + req.body.phone_number + ".*" } },
      ],
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

exports.userslist = async (req, reply) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const total = await Users.find().count();
    var result = [];
    const xx = await Users.find()
      .select(["-token", "-password"])
      .sort({ createAt: -1 })
      .skip(page * limit)
      .limit(limit);
    result = xx;
    const response = {
      items: result,
      status_code: 200,
      message: "returned successfully",
      pagenation: {
        size: result.length,
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

exports.userlistInfo = async (req, reply) => {
  try {
    const Advs = await Users.find().sort({ createAt: -1 });
    const response = {
      items: Advs,
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
    const user = await Users.findByIdAndUpdate(
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
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.userprofile = async (req, reply) => {
  try {
    const user = await Users.findById(req.params.id).select([
      "-token",
      "-password",
    ]);
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

exports.getUserByCity = async (req, reply) => {
  try {
    var result = [];
    var xx = await Users.find({ currentCity: req.params.id });
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

exports.getAllUsers = async (req, reply) => {
  try {
    var result = [];
    var xx = await Users.find();
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
