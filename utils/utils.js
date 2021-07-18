var crypto = require("crypto");
var request = require("request");
var nodemailer = require("nodemailer");
const fs = require("fs");
var ejs = require("ejs");
const cloudinary = require("cloudinary");
const { Transaction } = require("../models/Payment");
const { getCurrentDateTime } = require("../models/Constant");
const { reserve } = require("../models/Rack");

cloudinary.config({
  cloud_name: "dsz57mpwt",
  api_key: "798849627961531",
  api_secret: "mluiA31CtWFTj5E5EMPRS5tvQXw",
});

exports.encryptPassword = function (password) {
  try {
    var mykey = crypto.createCipher("aes-128-cbc", "mypassword");
    var mystr = mykey.update(password, "utf8", "hex");
    mystr += mykey.final("hex");
    return mystr;
  } catch (error) {
    console.error(error);
  }
};

exports.decryptPassword = function (password) {
  try {
    var mykey = crypto.createDecipher("aes-128-cbc", "mypassword");
    var mystr = mykey.update(password, "hex", "utf8");
    mystr += mykey.final("utf8");
    return mystr;
  } catch (error) {
    console.error(error);
  }
};

exports.sendSMS = async function (number, from, to, message) {
  let msg = encodeURI(message);
  request.get(
    {
      url: `https://www.msegat.com/gw?userName=rufuf&apiKey=eddb27e3123f29cff4a055bb0382c881&numbers=${number}&userSender=Rufuf&msg=${msg}&By=Rufuf&msgEncoding=UTF8&reqDlr=true`,
      form: null,
    },
    (err, httpResponse, body) => {
      if (err) {
        console.log(httpResponse);
      } else {
        console.log(body);
      }
    }
  );
};

exports.mail_general = function (req, to, sub, text, data) {
  try {
    email = "info@rufuf.sa";
    psw = "FS@rufuf@2019";
    var transporter = nodemailer.createTransport({
      host: "smtp.ionos.com",
      port: 587,
      secure: false,
      auth: {
        user: "info@rufuf.sa",
        pass: "FS@rufuf@2019",
      },
    });

    var template = process.cwd() + "/emails/general.html";

    fs.readFile(template, "utf8", function (error, file) {
      if (error) {
        return error;
      } else {
        var compiledTmpl = ejs.compile(file, { filename: template });
        var context = {
          full_name: data.full_name,
          msg: data.msg,
        };

        var htmls = compiledTmpl(context);
        htmls = htmls.replace(/&lt;/g, "<");
        htmls = htmls.replace(/&gt;/g, ">");
        htmls = htmls.replace(/&#34;/g, '"');

        var mailOptions = {
          from: '" منصة رفوف مقتنياتي " <' + email + ">",
          to: to,
          subject: sub,
          text: text,
          html: htmls,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.error("error");
            console.error(error);
            // return
          } else {
            console.log(info.response);
            // return
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
};

exports.uploadImages = async function (img) {
  return new Promise(function (resolve, reject) {
    cloudinary.v2.uploader.upload("./uploads/" + img, function (error, result) {
      if (error) {
        reject(error);
      } else {
        img = result["url"];
        resolve(img);
      }
    });
  });
};

exports.makeid = function () {
  var text = "";
  var possible = "0123456789";

  for (var i = 0; i < 3; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

exports.makeCode = function () {
  var text = "";
  var possible = "0123456789";

  for (var i = 0; i < 4; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

exports.handleError = function (error) {
  var arr = [];
  if (error != null && error != undefined) {
    if (error.errors) {
      Object.keys(error.errors).forEach((element) => {
        if (error.errors[element].message != "") {
          arr.push(error.errors[element].message);
        }
      });
    }
  }
  return arr;
};

exports.addTransaction = async function(provider_id,order_no,reserve_id,amount,type,note){
  let transaction = new Transaction({
    order_no : order_no,
    reserve_id : reserve_id,
    provider_id:provider_id,
    createAt: getCurrentDateTime(),
    amount: amount,
    type:type,
    note:note,

  })    
   await transaction.save();
}

exports.Padder = async function() {
  let prev_reserve = await reserve.find({}).sort({_id:-1}).limit(1)
  let current_year = new Date().getFullYear();
  let input = String(prev_reserve[0].contract_no)
  let lastFourDigits = input.substring(input.length - 4)
  
  var str = Number(lastFourDigits)+1
  var pad = "0000"
  var ans = pad.substring(0, pad.length - String(str).length) + String(str)

  let contract_no = `${current_year}${ans}` 
  return contract_no;
}