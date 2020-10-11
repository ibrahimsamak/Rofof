var crypto = require("crypto");
var request = require("request");
var nodemailer = require("nodemailer");
const fs = require("fs");
var ejs = require("ejs");

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
        console.log(httpResponse);
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
