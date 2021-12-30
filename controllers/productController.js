// External Dependancies
const boom = require("boom");
const config = require("config");
const fs = require("fs");
const NodeGeocoder = require("node-geocoder");
const concat = require("concat-stream");
const pump = require("pump");
const cloudinary = require("cloudinary");
const multer = require("multer");
const util = require("util");
const async = require("async");

cloudinary.config({
  cloud_name: "dsz57mpwt",
  api_key: "798849627961531",
  api_secret: "mluiA31CtWFTj5E5EMPRS5tvQXw",
});

// Get Data Models
const { Product, Category } = require("../models/Product");
const { getCurrentDateTime } = require("../models/Constant");
const { setting } = require("../models/Constant");
const { rack, reserve } = require("../models/Rack");
const { uploadImages, makeid, handleError } = require("../utils/utils");
const { renters } = require("../models/Renter");
const { PaymnetLog, Transaction } = require("../models/Payment");
const { Order } = require("../models/Order");

// Get All Categories
exports.getCategories = async (req, reply) => {
  try {
    const Categories = await Category.find();
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: Categories,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getProducts = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    let search_field = req.body.search_field;
    let search_value = req.body.search_value;
    let sort_field = req.body.sort_field;
    let sort_value = req.body.sort_value;

    let query1 = {};
    query1[search_field] = { $regex: new RegExp(search_value, "i") };
    query1["by_admin_id"] = req.body.by_admin_id;
    query1["isDeleted"] = false
    const total = await Product.countDocuments(query1);
    var item = await Product.find(query1)
      .sort({ [sort_field]: sort_value })
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

exports.getProductsByRackId = async (req, reply) => {
  try {
    // const renter = await reserve.findOne({
    //   $and: [{ rack_id: { $in: [req.params.id] } }],
    // });
    // if (renter) {
    var item = await Product.find({
      $and: [{ status: true }, { rack_id: req.params.id },{isDeleted:false}],
    }).sort({_id:-1});
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
    // } else {
    //   const response = {
    //     status_code: 200,
    //     status: true,
    //     message: "تمت العملية بنجاح",
    //     items: [],
    //   };
    //   reply.send(response);
    // }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getProductsByCategory = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await Product.countDocuments({ $and:[{category_id: req.params.id},{isDeleted:false}] });

    var item = await Product.find({ $and:[{category_id: req.params.id},{isDeleted:false}] })
      .sort({ _id: 1 })
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

exports.getAllProducts = async (req, reply) => {
  try {
    var item = await Product.find({isDeleted:false}).sort({_id:-1});
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getRandomProducts = async (req, reply) => {
  try {
    // var count = await Product.find().count();
    // var random = Math.floor(Math.random() * count);
    var item = await Product.find({isDeleted:false}).sort({ createat: -1 }).limit(20);
    // .skip(random)
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// --New
exports.getTop4RatedProducts = async (req, reply) => {
  try {
    var item = await Product.find({ rate: 5,isDeleted:false }).limit(4);
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getProductsRenters = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    let search_field = req.body.search_field;
    let search_value = req.body.search_value;
    let sort_field = req.body.sort_field;
    let sort_value = req.body.sort_value;
    let reserve_id = req.body.reserve_id;

    let query1 = {};
    query1[search_field] = { $regex: new RegExp(search_value, "i") };
    query1["by_user_id"] = req.body.by_user_id;
    if (reserve_id && reserve_id != "") {
      query1["reserve_id"] = reserve_id;
    }
    query1["isDeleted"] = false
    const total = await Product.countDocuments(query1);
    var item = await Product.find(query1)
      .sort({ [sort_field]: sort_value })
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

exports.getProductsForRenter = async (req, reply) => {
  try {
    // var page = parseFloat(req.query.page, 10);
    // var limit = parseFloat(req.query.limit, 10);
    let search_field = req.body.search_field;
    let search_value = req.body.search_value;
    let sort_field = req.body.sort_field;
    let sort_value = req.body.sort_value;
    let by_user_id = req.body.by_user_id;
    let reserve_id = req.body.reserve_id;

    let query1 = {};
    query1[search_field] = { $regex: new RegExp(search_value, "i") };
    query1["by_user_id"] = by_user_id;
    if (reserve_id && reserve_id != "") {
      query1["reserve_id"] = reserve_id;
    }
    query1["isDeleted"] = false
    const total = await Product.countDocuments(query1);
    var item = await Product.find(query1).sort({ [sort_field]: sort_value });
    // .skip(page * limit)
    // .limit(limit)
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
      // pagenation: {
      //   size: item.length,
      //   totalElements: total,
      //   totalPages: Math.floor(total / limit),
      //   pageNumber: page,
      // },
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getProductsForRenterById = async (req, reply) => {
  try {
    var item = await Product.find({ $and:[{by_user_id: req.body.by_user_id },{isDeleted:false}]}).sort({_id:-1})
      .populate("by_user_id")
      .populate("rack_id")
      .populate("reserve_id")
      .populate("category_id");
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get single Product by ID
exports.getSingleProductClient = async (req, reply) => {
  try {
    const id = req.params.id;
    const _Product = await Product.findById(id);
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _Product,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

//cPanel
exports.getCategoriesAdmin = async (req, reply) => {
  try {
    const Categories = await Category.find();
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: Categories,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.uploadPhoto = async (req, reply) => {
  cloudinary.v2.uploader.upload(
    "./public/" + req.files[0].filename,
    function (error, result) {
      reply.send(result);
    }
  );
};

exports.getSingleCategory = async (req, reply) => {
  try {
    const categories = await Category.findById(req.params.id);
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: categories,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addCategory = async (req, reply) => {
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

      let category = new Category({
        name: req.raw.body.name,
        image: img,
      });
      var _return = handleError(category.validateSync());
      if (_return.length > 0) {
        reply.code(200).send({
          status_code: 400,
          status: false,
          message: _return[0],
          items: _return,
        });
        return;
      }
      let rs = await category.save();
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

exports.updateCategory = async (req, reply) => {
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
      const categories = await Category.findByIdAndUpdate(
        req.params.id,
        {
          name: req.raw.body.name,
          image: img,
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
      const categories = await Category.findByIdAndUpdate(
        req.params.id,
        {
          name: req.raw.body.name,
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

exports.deleteCategory = async (req, reply) => {
  try {
    const categories = await Category.findByIdAndDelete(req.params.id);

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

exports.addProduct = async (req, reply) => {
  try {
    if (req.raw.files) {
      var img = [];
      var img_url = "";
      async.eachSeries(
        req.raw.files,
        async function updateObject(data, done) {
          var _data = new Buffer(data.data);
          let rand = makeid();

          fs.writeFile(
            "./uploads/" + rand + data.name,
            _data,
            "binary",
            function (err) {
              if (err) {
                console.log("There was an error writing the image");
              } else {
                console.log("The sheel file was written");
              }
            }
          );
          await uploadImages(rand + data.name).then((x) => {
            img.push(x);
          });
          // await uploadImages(data.name).then(x => {
          //   img_url = x;
          // });
        },
        async function allDone(err) {
          let products = new Product({
            name: req.raw.body.name,
            description: req.raw.body.description,
            images: img,
            image: img[0],
            qty: req.raw.body.qty,
            price: req.raw.body.price,
            by_user_id: req.raw.body.by_user_id,
            // by_admin_id: req.raw.body.by_admin_id,
            barcode: req.raw.body.barcode,
            category_id: req.raw.body.category_id,
            discountPrice: req.raw.body.discountPrice,
            createat: getCurrentDateTime(),
            status: false,
            rate: 0,
            rack_id: req.raw.body.rack_id,
            reserve_id: req.raw.body.reserve_id,
            isDeleted:false
          });
          var _return = handleError(products.validateSync());
          if (_return.length > 0) {
            reply.code(200).send({
              status_code: 400,
              status: false,
              message: _return[0],
              items: _return,
            });
            return;
          }

          await products.save();
        }
      );
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: "",
      };
      reply.send(response);
    } else {
      let products = new Product({
        name: req.raw.body.name,
        description: req.raw.body.description,
        images: [],
        image:
          "https://res.cloudinary.com/diszvlmqq/image/upload/v1602175350/logo.png",
        qty: req.raw.body.qty,
        price: req.raw.body.price,
        by_user_id: req.raw.body.by_user_id,
        // by_admin_id: req.raw.body.by_admin_id,
        barcode: req.raw.body.barcode,
        category_id: req.raw.body.category_id,
        discountPrice: req.raw.body.discountPrice,
        createat: getCurrentDateTime(),
        status: false,
        rate: 0,
        rack_id: req.raw.body.rack_id,
        reserve_id: req.raw.body.reserve_id,
        isDeleted:false
      });
      await products.save();
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: "",
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateProduct = async (req, reply) => {
  try {
    if (req.raw.files) {
      var img = [];
      async.eachSeries(
        req.raw.files,
        async function updateObject(data, done) {
          var _data = new Buffer(data.data);
          let rand = makeid();

          fs.writeFile(
            "./uploads/" + rand + data.name,
            _data,
            "binary",
            function (err) {
              if (err) {
                console.log("There was an error writing the image");
              } else {
                console.log("The sheel file was written");
              }
            }
          );
          await uploadImages(rand + data.name).then((x) => {
            img.push(x);
          });
        },
        async function allDone(err) {
          Product.update(
            { _id: req.params.id },
            {
              name: req.raw.body.name,
              description: req.raw.body.description,
              $addToSet: { images: { $each: img } },
              image: img[0],
              // qty: req.raw.body.qty,
              price: req.raw.body.price,
              // by_user_id: req.raw.body.by_user_id,
              // by_admin_id: req.raw.body.by_admin_id,
              barcode: req.raw.body.barcode,
              category_id: req.raw.body.category_id,
              discountPrice: req.raw.body.discountPrice,
              rack_id: req.raw.body.rack_id,
              reserve_id: req.raw.body.reserve_id,
            },
            { upsert: true, new: true, runValidators: true },
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

          // const products = await Product.findByIdAndUpdate(
          //   req.params.id,
          //   {
          //     name: req.raw.body.name,
          //     description: req.raw.body.description,
          //     images: { $push: { values: { $each: img } } },
          //     image: img[0],
          //     qty: req.raw.body.qty,
          //     price: req.raw.body.price,
          //     by_user_id: req.raw.body.by_user_id,
          //     by_admin_id: req.raw.body.by_admin_id
          //   },
          //   { new: true }
          // );
        }
      );
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: null,
      };
      reply.send(response);
    } else {
      const products = await Product.findByIdAndUpdate(
        req.params.id,
        {
          name: req.raw.body.name,
          description: req.raw.body.description,
          qty: req.raw.body.qty,
          price: req.raw.body.price,
          by_user_id: req.raw.body.by_user_id,
          by_admin_id: req.raw.body.by_admin_id,
          barcode: req.raw.body.barcode,
          category_id: req.raw.body.category_id,
          discountPrice: req.raw.body.discountPrice,
          rack_id: req.raw.body.rack_id,
          reserve_id: req.raw.body.reserve_id,
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
        items: products,
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updatePriceQty = async (req, reply) => {
  try {
    const products = await Product.findByIdAndUpdate(
      req.params.id,
      {
        qty: req.body.qty,
        price: req.body.price,
      },
      { new: true }
    );
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: products,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.approveAllProducts = async (req, reply) => {
  try {
    Product.updateMany(
      { $and:[{ by_user_id: req.params.id },{ reserve_id: req.body.reserve_id }]},
      { status: true },
      function (err, res) {
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
            message: "تمت الموافقة على المنتجات بنجاح",
            items: [],
          };
          reply.send(response);
        }
      }
    );
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteProduct = async (req, reply) => {
  try {
    const products = await Product.findByIdAndUpdate(req.params.id,{isDeleted:true},{new:true});
    reply.send(products);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteProductImage = async (req, reply) => {
  try {
    Product.findByIdAndUpdate(
      req.params.id,
      { $pull: { images: req.body.image } },
      { safe: true, upsert: true },
      function (err, node) {
        if (err) {
          const response = {
            status_code: 400,
            status: false,
            message: "تمت العملية بنجاح",
            items: null,
          };
          reply.send(response);
        }
        const response = {
          status_code: 200,
          status: true,
          message: "تمت العملية بنجاح",
          items: null,
        };
        reply.send(response);
      }
    );
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getSingleProduct = async (req, reply) => {
  try {
    const products = await Product.findById(req.params.id);
    reply.send(products);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getProductDetailsByBarCode = async (req, reply) => {
  try {
    const products = await Product.findOne({
      $and: [
        { status: true },
        { isDeleted: false  },
        { qty: { $gt: 0 } },
        { $or: [{ barcode: req.body.barcode }, { name: req.body.name }] },
      ],
    });

    if (products) {
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: products,
      };
      reply.send(response);
    } else {
      const response = {
        status_code: 400,
        status: false,
        message:
          "عذرا .. لم يتم العثور على منتج او قد يكون نفذ مخزون هذا المنتج",
        items: null,
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateProductStatus = async (req, reply) => {
  try {
    const products = await Product.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: products,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.makeCoverImage = async (req, reply) => {
  try {
    let index = req.body.index;
    const products = await Product.findById(req.params.id);
    let img = products.images[index];
    const _products = await Product.findByIdAndUpdate(
      req.params.id,
      { image: img },
      { new: true }
    );

    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _products,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.searchWeb = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await Product.countDocuments({
      $and:[
        {isDeleted:false},
        { category_id: req.body.category_id},
        {name: { $regex: ".*" + req.body.name + ".*" }
       }]
    });

    var xx = await Product.find({
     $and:[
       {isDeleted:false},
       { category_id: req.body.category_id},
       {name: { $regex: ".*" + req.body.name + ".*" }
      }]
    })
      .populate("category_id")
      .populate("product_id")
      .sort({ id: -1 })
      .skip(page * limit)
      .limit(limit);
    const response = {
      items: xx,
      status_code: 200,
      message: "returned successfully",
      pagenation: {
        size: xx.length,
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

exports.getActiveProducts = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    let by_user_id = req.body.by_user_id;
    let contract_no = req.body.contract_no;

    let query1 = {$and:[{}]};
    if (by_user_id && by_user_id != "") {
      query1.$and.push({by_user_id:by_user_id}) 
    }
    if (req.body.product_name && req.body.product_name != "") {
      query1.$and.push({name: {$regex: new RegExp(req.body.product_name, "i")}}) 
    }

    if (contract_no && contract_no != "") {
      var reserve_id = await reserve.findOne({ contract_no: contract_no });
      query1.$and.push({reserve_id:reserve_id._id}) 

    }
    query1.$and.push({status:req.body.status}) 
    query1.$and.push({isDeleted:false}) 

    const total = await Product.countDocuments(query1);
    var item = await Product.find(query1)
      .populate("by_user_id")
      .populate("category_id")
      .populate("reserve_id")
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

exports.getActiveProductsExcel = async (req, reply) => {
  try {
    let by_user_id = req.body.by_user_id;
    let contract_no = req.body.contract_no;
    
    let query1 = {$and:[{}]};
    if (by_user_id && by_user_id != "") {
      query1.$and.push({by_user_id:by_user_id}) 
    }
    if (req.body.product_name && req.body.product_name != "") {
      query1.$and.push({name: {$regex: new RegExp(req.body.product_name, "i")}}) 
    }

    if (contract_no && contract_no != "") {
      var reserve_id = await reserve.findOne({ contract_no: contract_no });
      query1.$and.push({reserve_id:reserve_id._id}) 

    }
    query1.$and.push({status:req.body.status}) 
    query1.$and.push({isDeleted:false}) 

    var item = await Product.find(query1)
      .populate("by_user_id")
      .populate("category_id")
      .populate("reserve_id")
      .sort({ _id: -1 });
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: item,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};


exports.transfer = async (req, reply) => {
  try {
    if(req.body.reserved_id && req.body.reserved_id != ""){
      Product.updateMany(
        { _id: {$in:req.body.products} },
        { reserve_id: req.body.reserved_id },
        function (err, res) {
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
              message: "تمت نقل المنتجات بنجاح ",
              items: [],
            };
            reply.send(response);
          }
        }
      );
    }else{
      let renter = await renters.findOne({name:{ $regex: new RegExp("رفوف", "i") }})
      if(!renter){
        const response = {
          status_code: 400,
          status: false,
          message: "لا يوجد مستأجر باسم متجر رفوف",
          items: {},
        };
        reply.send(response);
        return
      }
      let _reserve = await reserve.findOne({renter_id:renter._id})
      if(!_reserve){
        const response = {
          status_code: 400,
          status: false,
          message: "لا يوجد عقد متاح لمتجر رفوف",
          items: {},
        };
        reply.send(response);
        return
      }

      Product.updateMany(
        { _id: {$in:req.body.products} },
        { reserve_id: _reserve._id },
        function (err, res) {
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
              message: "تمت نقل المنتجات بنجاح ",
              items: [],
            };
            reply.send(response);
          }
        }
      );
    }

  
  } catch (err) {
    throw boom.boomify(err);
  }
};



exports.testupdatemany = async (req, reply) => {
  // let xx= await PaymnetLog.findById("5ff16fed60e845bac622458c")
  await renters.deleteMany(
    {_id:{$in:["5feddce00bcbe40aee239bcf"]} },
    function (err, res) {
    }
  );
  await Product.deleteMany(
    {by_user_id:{$in:["5feddce00bcbe40aee239bcf"]} },
    function (err, res) {
    }
  );
  await reserve.deleteMany(
    {renter_id:{$in:["5feddce00bcbe40aee239bcf"]} },
    function (err, res) {
    }
  );
  await Order.deleteMany(
    {provider_id:{$in:["5feddce00bcbe40aee239bcf"]} },
    function (err, res) {
    }
  );
  await PaymnetLog.deleteMany(
    {by_user_id:{$in:["5feddce00bcbe40aee239bcf"]} },
    function (err, res) {
    }
  );
  await Transaction.deleteMany(
    {provider_id:{$in:["5feddce00bcbe40aee239bcf"]} },
    function (err, res) {
    }
  );
 
  reply.send(xx)
}