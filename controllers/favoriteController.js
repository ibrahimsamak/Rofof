/**
 * @module controllers/favoriteController
 * @description
 * Manages a customer's list of favorite products/racks — retrieving the
 * favorites for a user and adding or removing individual entries.
 *
 * Exposed handlers:
 * - getFav      List the authenticated user's favorites.
 * - addFav      Add an item to the user's favorites.
 * - deleteFav   Remove an item from the user's favorites.
 */

const boom = require("boom");

// Get Data Models
const { Favorit } = require("../models/favorit");
const { getCurrentDateTime } = require("../models/Constant");

// Get all fav
exports.getFav = async (req, reply) => {
  try {
    const user_id = req.params.id;
    const _Notification = await Favorit.find({
      user_id: user_id,
    })
      .sort({ _id: -1 })
      .populate("user_id")
      .populate("product_id");
    const response = {
      status_code: 200,
      status: true,
      message: "تمت العملية بنجاح",
      items: _Notification,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

//delete fav
exports.deleteFav = async (req, reply) => {
  try {
    await Favorit.findByIdAndRemove(req.params.id);
    const response = {
      status_code: 200,
      status: true,
      message: "تم ازالة المنتج من المفضلة",
      items: null,
    };
    reply.send(response);
  } catch (err) {
    throw boom.boomify(err);
  }
};

//add fav
exports.addFav = async (req, reply) => {
  try {
    const checkObj = await Favorit.findOne({
      $and: [
        { user_id: req.body.user_id },
        { product_id: req.body.product_id },
      ],
    });
    if (!checkObj) {
      let _Favorit = new Favorit({
        user_id: req.body.user_id,
        product_id: req.body.product_id,
        createAt: getCurrentDateTime(),
      });

      let rs = await _Favorit.save();
      const response = {
        status_code: 200,
        status: true,
        message: "تم اضافة المنتج الى المفضلة",
        items: rs,
      };
      reply.send(response);
    } else {
      const response = {
        status_code: 200,
        status: false,
        message: "المنتج موجود مسبقا",
        items: [],
      };
      reply.send(response);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};
