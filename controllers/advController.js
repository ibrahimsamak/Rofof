// External Dependancies
const boom = require("boom");
const fs = require("fs");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "dkos8ethw",
  api_key: "375638313668992",
  api_secret: "fsgng51R49_1TQlUbKbbFa4_FbM"
});

// Get Data Models
const { Adv } = require("../models/adv");
const { getCurrentDateTime } = require("../models/Constant");

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

// Get all advs
exports.getAdv = async (req, reply) => {
  try {
    var page = parseFloat(req.query.page, 10);
    var limit = parseFloat(req.query.limit, 10);

    const _Advs = await Adv.find()
      .sort({ _id: -1 })
      .skip(page * limit)
      .limit(limit);
    const total = await Adv.find().count();
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _Advs,
      pagenation: {
        size: _Advs.length,
        totalElements: total,
        totalPages: Math.floor(total / limit),
        pageNumber: page
      }
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get single advs by ID
exports.getSingleAdv = async (req, reply) => {
  try {
    const Advs = await Adv.findById(req.params.id);
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: Advs
    };
    return response;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Add a new advs
exports.addAdv = async (req, reply) => {
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

      let Advs = new Adv({
        ads_for: req.raw.body.ads_for,
        is_ads_redirect_to_store: req.raw.body.is_ads_redirect_to_store,
        image: img,
        url: req.raw.body.url,
        store_id: req.raw.body.store_id,
        product_id: req.raw.body.product_id,
        is_ads_have_expiry_date: req.raw.body.is_ads_have_expiry_date,
        by: req.raw.body.by,
        createAt: getCurrentDateTime(),
        name: req.raw.body.name
      });

      let rs = await Advs.save();
      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: rs
      };

      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// delete adv
exports.deleteAdv = async (req, reply) => {
  const Advs = await Adv.findByIdAndRemove(req.params.id);
  const response = {
    status_code: 200,
    status: true,
    message: "تمت العملية بنجاح",
    items: []
  };
  // await updateCacheWithDelete('Advs', req.params.id)

  return response;
};

// Update an existing adv
exports.updateAdv = async (req, reply) => {
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

      const Advs = await Adv.findByIdAndUpdate(
        req.params.id,
        {
          ads_for: req.raw.body.ads_for,
          is_ads_redirect_to_store: req.raw.body.is_ads_redirect_to_store,
          image: img,
          url: req.raw.body.url,
          store_id: req.raw.body.store_id,
          product_id: req.raw.body.product_id,
          is_ads_have_expiry_date: req.raw.body.is_ads_have_expiry_date,
          by: req.raw.body.by,
          name: req.raw.body.name
        },
        { new: true }
      );
      // await updateCacheWithUpdate('Advs', Advs, req.params.id)

      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: Advs
      };
      return response;
    } else {
      const Advs = await Adv.findByIdAndUpdate(
        req.params.id,
        {
          ads_for: req.raw.body.ads_for,
          is_ads_redirect_to_store: req.raw.body.is_ads_redirect_to_store,
          url: req.raw.body.url,
          store_id: req.raw.body.store_id,
          product_id: req.raw.body.product_id,
          is_ads_have_expiry_date: req.raw.body.is_ads_have_expiry_date,
          by: req.raw.body.by,
          name: req.raw.body.name
        },
        { new: true }
      );
      // await updateCacheWithUpdate('Advs', Advs, req.params.id)

      const response = {
        status_code: 200,
        status: true,
        message: "تمت العملية بنجاح",
        items: Advs
      };
      return response;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};
