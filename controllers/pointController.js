const _ = require('underscore');
const boom = require('boom')
const multer = require('multer');
const mongoose = require('mongoose');
const { Point } = require('../models/Point');
const { UserPoint } = require('../models/userPoint');


exports.getSupplierPoint = async (req, reply) => {
    try {
        await Point.find({ supplier_id: req.params.id }).sort({ _id: -1 })
            .populate('supplier_id')
            .exec(function (err, item) {
                // if (err) return handleError(err); 
                const response = {
                    status_code: 200,
                    status: true,
                    message: 'return succssfully',
                    items: item,
                    pagatination: []
                }
                reply.send(response);
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getSinglePoint = async (req, reply) => {
    try {
        const sp = await Point.findById(req.params.id);
        if (!sp) {
            const response = {
                status_code: 400,
                status: false,
                message: 'item not found',
                items: []
            }
            reply.send(response);
        }

        await Point.findById(req.params.id)
            .populate('supplier_id')
            .exec(function (err, item) {
                // if (err) return handleError(err);
                const response = {
                    status_code: 200,
                    status: true,
                    message: 'return succssfully',
                    items: item
                }
                reply.send(response);
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.addPoint = async (req, reply) => {
    try {
        let _Points = new Point({
            point_price: req.body.point_price,
            supplier_id: req.body.supplier_id,
            min_value: req.body.min_value,
            max_value: req.body.max_value,
            points: req.body.points
        });

        let rs = await _Points.save();
        reply.send(rs);
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updatePoint = async (req, reply) => {
    try {
        const sp = await Point.findByIdAndUpdate((req.params.id), {
            point_price: req.body.point_price,
            supplier_id: req.body.supplier_id,
            min_value: req.body.min_value,
            max_value: req.body.max_value,
            points: req.body.points
        }, { new: true })

        reply.send(sp);
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.deletePoint = async (req, reply) => {
    try {
        const sp = await Point.findByIdAndRemove(req.params.id);
        reply.send('sucess');
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.UserPointById = async (req, reply) => {
    try {
        var page = parseInt(req.query.page, 10)
        var limit = parseInt(req.query.limit, 10)
        const total = await UserPoint.find({ user_id: req.params.id }).count();

        await UserPoint.find({ user_id: req.params.id, points: { $gt: 0 } }).sort({ _id: -1 })
            .populate('supplier_id')
            .skip((page) * limit)
            .limit(limit)
            .exec(function (err, item) {
                // if (err) return handleError(err); 
                const response = {
                    status_code: 200,
                    status: true,
                    message: 'return succssfully',
                    items: item,
                    pagenation: {
                        size: item.length,
                        totalElements: total,
                        totalPages: Math.floor(total / limit),
                        pageNumber: page
                    }
                }
                reply.send(response);
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updateUserPoint = async (req, reply) => {
    try {
        let user_id = req.user._id
        console.log(req.user)
        const userPoints = await UserPoint.findOne({user_id:user_id});
        const points_to_mony = parseInt(userPoints.points, 10) / parseInt(userPoints.point_price, 10)
        console.log(points_to_mony, userPoints)
        // const _Users = await Users.findByIdAndUpdate((userPoints.user_id), {
        //     $inc: { wallet: points_to_mony }
        // }, { new: true })

        // const _userPoints = await UserPoint.findByIdAndUpdate((userPoints._id), {
        //     points: 0
        // }, { new: true })

        const response = {
            status_code: 200,
            status: true,
            message: 'تم حساب النقاط بنجاح',
            items: points_to_mony,
        }

        reply.send(response);
    } catch (err) {
        throw boom.boomify(err)
    }
}


