const Joi = require("joi");
const mongoose = require("mongoose");
const { getCurrentDateTime } = require("../models/Constant");

const Orderschema = mongoose.Schema(
  {
    Order_no: { type: String, required: false },
    Total: { type: Number, required: false },
    Admin_Total: { type: Number, required: false },
    Renter_Total: { type: Number, required: false },
    StatusId: { type: Number },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    items: {
      type: [
        {
          product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          qty: { type: Number },
          price: { type: Number },
          isAdminProduct: { type: Boolean },
          by_admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "admins" },
          by_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "renters" }
        }
      ]
    },
    createAt: { type: Date }
  },
  { versionKey: false }
);

Orderschema.index({ user_id: 1, StatusId: 1 });
Orderschema.index({ createAt: 1 });
// Orderschema.index({ "supplier_id": 1 })
// Orderschema.index({ by_user_id: 1, StatusId: 1 });

const Order = mongoose.model("Order", Orderschema);

exports.Order = Order;
