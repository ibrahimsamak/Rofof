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
  cloud_name: "diszvlmqq",
  api_key: "626239833572272",
  api_secret: "1ZkJK1IN2eUhF2qVEc-M2QOAI0I"
});

// Get Data Models
const { Product, Category, Supplier } = require("../models/Product");
const { client } = require("../models/cache");
const { getCurrentDateTime } = require("../models/Constant");
const { setting } = require("../models/Constant");
const { rack, reserve } = require("../models/Rack");

async function uploadImages(img) {
  return new Promise(function(resolve, reject) {
    cloudinary.v2.uploader.upload("./uploads/" + img, function(error, result) {
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

// Get All Categories
exports.getCategories = async (req, reply) => {
  try {
    const Categories = await Category.find();
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: Categories
    };
    return response;
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

    console.log(req.body);
    let query1 = {};
    query1[search_field] = { $regex: new RegExp(search_value, "i") };
    query1["by_admin_id"] = req.body.by_admin_id;
    console.log(query1);
    const total = await Product.find(query1).count();
    await Product.find(query1)
      .sort({ [sort_field]: sort_value })
      .skip(page * limit)
      .limit(limit)
      .exec(function(err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item,
          pagenation: {
            size: item.length,
            totalElements: total,
            totalPages: Math.floor(total / limit),
            pageNumber: page
          }
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getProductsByRackId = async (req, reply) => {
  try {
    const renter = await reserve.findOne({
      rack_id: { $in: [req.params.id] }
    });
    if (renter) {
      await Product.find({ by_user_id: renter.renter_id }).exec(function(
        err,
        item
      ) {
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item
        };
        reply.send(response);
      });
    } else {
      const response = {
        status_code: 200,
        status: true,
        message: "return succssfully",
        items: []
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getProductsByCategory = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await Product.find({ category_id: req.params.id }).count();

    await Product.find({ category_id: req.params.id })
      .sort({ _id: 1 })
      .skip(page * limit)
      .limit(limit)
      .exec(function(err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item,
          pagenation: {
            size: item.length,
            totalElements: total,
            totalPages: Math.floor(total / limit),
            pageNumber: page
          }
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getAllProducts = async (req, reply) => {
  try {
    await Product.find().exec(function(err, item) {
      const response = {
        status_code: 200,
        status: true,
        message: "return succssfully",
        items: item
      };
      reply.send(response);
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getRandomProducts = async (req, reply) => {
  try {
    var count = await Product.find().count();
    var random = Math.floor(Math.random() * count);
    await Product.find()
      // .skip(random)
      .exec(function(err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// --New
exports.getTop4RatedProducts = async (req, reply) => {
  try {
    await Product.find({ rate: 5 })
      .limit(4)
      .exec(function(err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item
        };
        reply.send(response);
      });
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

    console.log(req.body);
    let query1 = {};
    query1[search_field] = { $regex: new RegExp(search_value, "i") };
    query1["by_user_id"] = req.body.by_user_id;
    console.log(query1);
    const total = await Product.find(query1).count();
    await Product.find(query1)
      .sort({ [sort_field]: sort_value })
      .skip(page * limit)
      .limit(limit)
      .exec(function(err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item,
          pagenation: {
            size: item.length,
            totalElements: total,
            totalPages: Math.floor(total / limit),
            pageNumber: page
          }
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getProductsForRenter = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    let search_field = req.body.search_field;
    let search_value = req.body.search_value;
    let sort_field = req.body.sort_field;
    let sort_value = req.body.sort_value;
    let by_user_id = req.body.by_user_id;

    let query1 = {};
    query1[search_field] = { $regex: new RegExp(search_value, "i") };
    query1["by_user_id"] = by_user_id;
    console.log(query1);
    const total = await Product.find(query1).count();
    await Product.find(query1)
      .sort({ [sort_field]: sort_value })
      .skip(page * limit)
      .limit(limit)
      .exec(function(err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item,
          pagenation: {
            size: item.length,
            totalElements: total,
            totalPages: Math.floor(total / limit),
            pageNumber: page
          }
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getProductsForRenterById = async (req, reply) => {
  try {
    await Product.find({ by_user_id: req.body.by_user_id })
      .populate("by_user_id")
      .exec(function(err, item) {
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: item
        };
        reply.send(response);
      });
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
      message: "return succssfully",
      items: _Product
    };
    return response;
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
      message: "return succssfully",
      items: Categories
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.uploadPhoto = async (req, reply) => {
  cloudinary.v2.uploader.upload("./public/" + req.files[0].filename, function(
    error,
    result
  ) {
    console.log(result, error);
    reply.send(result);
  });
};

exports.getSingleCategory = async (req, reply) => {
  try {
    const categories = await Category.findById(req.params.id);
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: categories
    };
    return response;
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
          mimetype: files[key].mimetype
        });
      }
      var data = new Buffer(files.image.data);
      fs.writeFile("./uploads/" + files.image.name, data, "binary", function(
        err
      ) {
        if (err) {
          console.log("There was an error writing the image");
        } else {
          console.log("The sheel file was written");
        }
      });

      let img = "";
      await uploadImages(files.image.name).then(x => {
        img = x;
      });
      console.log(img);

      let category = new Category({
        name: req.raw.body.name,
        image: img
      });

      let rs = await category.save();
      const response = {
        status_code: 200,
        status: true,
        message: "return succssfully",
        items: rs
      };
      return response;
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
          mimetype: files[key].mimetype
        });
      }
      var data = new Buffer(files.image.data);
      fs.writeFile("./uploads/" + files.image.name, data, "binary", function(
        err
      ) {
        if (err) {
          console.log("There was an error writing the image");
        } else {
          console.log("The sheel file was written");
        }
      });

      let img = "";
      await uploadImages(files.image.name).then(x => {
        img = x;
      });
      const categories = await Category.findByIdAndUpdate(
        req.params.id,
        {
          name: req.raw.body.name,
          image: img
        },
        { new: true }
      );
      const response = {
        status_code: 200,
        status: true,
        message: "return succssfully",
        items: categories
      };
      return response;
    } else {
      const categories = await Category.findByIdAndUpdate(
        req.params.id,
        {
          name: req.raw.body.name
        },
        { new: true }
      );
      const response = {
        status_code: 200,
        status: true,
        message: "return succssfully",
        items: categories
      };
      return response;
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
      message: "return succssfully",
      items: []
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getSupplier = async (req, reply) => {
  try {
    const Categories = await Supplier.find();
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: Categories
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getSingleSupplier = async (req, reply) => {
  try {
    const categories = await Supplier.findById(req.params.id);
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: categories
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addSupplier = async (req, reply) => {
  try {
    if (req.raw.files) {
      const files = req.raw.files;
      let fileArr = [];
      for (let key in files) {
        fileArr.push({
          name: files[key].name,
          mimetype: files[key].mimetype
        });
      }
      var data = new Buffer(files.image.data);
      fs.writeFile("./uploads/" + files.image.name, data, "binary", function(
        err
      ) {
        if (err) {
          console.log("There was an error writing the image");
        } else {
          console.log("The sheel file was written");
        }
      });

      let img = "";
      await uploadImages(files.image.name).then(x => {
        img = x;
      });
      console.log(img);

      let category = new Supplier({
        name: req.raw.body.name,
        details: req.raw.body.details,
        password: req.raw.body.password,
        email: req.raw.body.email,
        image: img
      });

      let rs = await category.save();
      let settings = await setting.find({
        supplier_id: "5c67f4ba0fb3d50d6e9f03f3"
      });
      async.each(settings, async function(data, callback) {
        let _Notification = new setting({
          name: data.name,
          value: 0,
          supplier_id: rs._id
        });

        await _Notification.save();
        console.log("saved");
      });

      const response = {
        status_code: 200,
        status: true,
        message: "return succssfully",
        items: rs
      };
      return response;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateSupplier = async (req, reply) => {
  try {
    if (req.raw.files) {
      const files = req.raw.files;
      let fileArr = [];
      for (let key in files) {
        fileArr.push({
          name: files[key].name,
          mimetype: files[key].mimetype
        });
      }
      var data = new Buffer(files.image.data);
      fs.writeFile("./uploads/" + files.image.name, data, "binary", function(
        err
      ) {
        if (err) {
          console.log("There was an error writing the image");
        } else {
          console.log("The sheel file was written");
        }
      });

      let img = "";
      await uploadImages(files.image.name).then(x => {
        img = x;
      });
      const categories = await Supplier.findByIdAndUpdate(
        req.params.id,
        {
          name: req.raw.body.name,
          image: img,
          details: req.raw.body.details,
          password: req.raw.body.password,
          email: req.raw.body.email
        },
        { new: true }
      );
      const response = {
        status_code: 200,
        status: true,
        message: "return succssfully",
        items: categories
      };
      return response;
    } else {
      const categories = await Supplier.findByIdAndUpdate(
        req.params.id,
        {
          name: req.raw.body.name,
          details: req.raw.body.details,
          password: req.raw.body.password,
          email: req.raw.body.email
        },
        { new: true }
      );
      const response = {
        status_code: 200,
        status: true,
        message: "return succssfully",
        items: categories
      };
      return response;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteSupplier = async (req, reply) => {
  try {
    const categories = await Supplier.findByIdAndDelete(req.params.id);

    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: []
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.addProduct = async (req, reply) => {
  try {
    if (req.raw.files) {
      console.log(req.raw.files);
      var img = [];
      var img_url = "";
      async.eachSeries(
        req.raw.files,
        async function updateObject(data, done) {
          console.log(data);
          var _data = new Buffer(data.data);
          fs.writeFile("./uploads/" + data.name, _data, "binary", function(
            err
          ) {
            if (err) {
              console.log("There was an error writing the image");
            } else {
              console.log("The sheel file was written");
            }
          });
          await uploadImages(data.name).then(x => {
            img.push(x);
          });
          // await uploadImages(data.name).then(x => {
          //   img_url = x;
          // });
        },
        async function allDone(err) {
          console.log("all done");
          console.log(img);
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
            rate: 0
          });
          await products.save();
        }
      );
      const response = {
        status_code: 200,
        status: true,
        message: "return succssfully",
        items: ""
      };
      return response;
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
          console.log(data.data);
          var _data = new Buffer(data.data);
          fs.writeFile("./uploads/" + data.name, _data, "binary", function(
            err
          ) {
            if (err) {
              console.log("There was an error writing the image");
            } else {
              console.log("The sheel file was written");
            }
          });
          await uploadImages(data.name).then(x => {
            img.push(x);
          });
        },
        async function allDone(err) {
          console.log("all done");
          console.log(img);
          Product.update(
            { _id: req.params.id },
            {
              name: req.raw.body.name,
              description: req.raw.body.description,
              $addToSet: { images: { $each: img } },
              image: img[0],
              qty: req.raw.body.qty,
              price: req.raw.body.price,
              // by_user_id: req.raw.body.by_user_id,
              // by_admin_id: req.raw.body.by_admin_id,
              barcode: req.raw.body.barcode,
              category_id: req.raw.body.category_id,
              discountPrice: req.raw.body.discountPrice
            },
            { upsert: true },
            function(err) {
              if (err) {
                console.log(err);
              } else {
                console.log("Successfully added");
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
        message: "return succssfully",
        items: null
      };
      return response;
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
          discountPrice: req.raw.body.discountPrice
        },
        { new: true }
      );
      const response = {
        status_code: 200,
        status: true,
        message: "return succssfully",
        items: products
      };
      return response;
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
        price: req.body.price
      },
      { new: true }
    );
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: products
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteProduct = async (req, reply) => {
  try {
    console.log(req.params.id);
    const products = await Product.findByIdAndDelete(req.params.id);
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
      function(err, node) {
        if (err) {
          const response = {
            status_code: 400,
            status: false,
            message: "return succssfully",
            items: null
          };
          reply.send(response);
        }
        const response = {
          status_code: 200,
          status: true,
          message: "return succssfully",
          items: null
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
      $or: [{ barcode: req.body.barcode }, { name: req.body.name }]
    });
    console.log(products);
    if (products) {
      const response = {
        status_code: 200,
        status: true,
        message: "return succssfully",
        items: products
      };
      return response;
    } else {
      const response = {
        status_code: 400,
        status: false,
        message: "لم يتم العثور على منتج",
        items: null
      };
      return response;
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
        status: req.body.status
      },
      { new: true }
    );
    const response = {
      status_code: 200,
      status: true,
      message: "return succssfully",
      items: products
    };
    return response;
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
      message: "return succssfully",
      items: _products
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.searchWeb = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);
    const total = await Product.find({
      category_id: req.body.category_id,
      name: { $regex: ".*" + req.body.name + ".*" }
    }).count();

    await Product.find({
      category_id: req.body.category_id,
      name: { $regex: ".*" + req.body.name + ".*" }
    })
      .populate("category_id")
      .populate("product_id")
      .sort({ id: -1 })
      .skip(page * limit)
      .limit(limit)
      .exec(function(err, xx) {
        const response = {
          items: xx,
          status_code: 200,
          message: "returned successfully",
          pagenation: {
            size: xx.length,
            totalElements: total,
            totalPages: Math.floor(total / limit),
            pageNumber: page
          }
        };
        reply.send(response);
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};
