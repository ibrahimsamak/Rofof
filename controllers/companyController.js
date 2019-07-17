const _ = require('underscore');
const lodash = require('lodash');
const boom = require('boom')
const concat = require('concat-stream')
const pump = require('pump')
const cloudinary = require('cloudinary');
const multer = require('multer');
const fs = require('fs');

const { Order } = require('../models/Order');
const { Product, Supplier } = require('../models/Product');
const { Drivers } = require('../models/Driver');
const { Users } = require('../models/User');
const { Point } = require('../models/Point');
const { UserPoint } = require('../models/userPoint');
const { getCurrentDateTime } = require('../models/Constant');
const moment = require('moment')
const momentTZ = require('moment-timezone');

cloudinary.config({
    cloud_name: 'diszvlmqq',
    api_key: '626239833572272',
    api_secret: '1ZkJK1IN2eUhF2qVEc-M2QOAI0I'
});


//Driver
exports.userprofile = async (req, reply) => {
    try {
        const user = await Drivers.findById(req.params.id).populate('supplier_id').select(['-token', '-password']);
        const response = {
            status_code: 200,
            status: true,
            message: '',
            items: user
        }
        reply.send(response);
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.addDrivers = async (req, reply) => {
    try {

        let _user = new Drivers({
            name: req.body.name,
            images: req.body.images,
            dt_dob: req.body.dt_dob,
            email: req.body.email,
            image: req.body.image,
            address: req.body.address,
            phone_number: req.body.phone_number,
            password: req.body.phone_number,
            supplier_id: req.params.id,
            isBlock: false,
            createAt: getCurrentDateTime(),
            car_name: req.body.car_name,
            car_number: req.body.car_number,
            car_color: req.body.car_color,
        });
        let rs = await _user.save();

        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: rs
        }
        reply.send(response);

    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.Driversearch = async (req, reply) => {
    try {
        var result = []
        const supplier_id = req.params.id

        await Drivers.find({
            $and: [{ supplier_id: supplier_id }, {
                $or: [
                    { full_name: { $regex: '.*' + req.body.full_name + '.*' } },
                    { phone_number: { $regex: '.*' + req.body.phone_number + '.*' } }]
            }]
        }).exec(function (err, xx) {
            result = xx
            const response = {
                items: result,
                status_code: 200,
                message: 'returned successfully'
            }
            reply.send(response)
        });

    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.Driverlist = async (req, reply) => {
    try {
        const _Users = await Drivers.find({ supplier_id: req.params.id }).populate('supplier_id')
            .sort({ createAt: -1 })
            .select(['-token', '-password'])
        const response = {
            items: _Users,
            status_code: 200,
            message: 'returned successfully',
        }
        reply.send(response);

    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.userlistInfo = async (req, reply) => {
    try {
        const Advs = await Drivers.find({ supplier_id: req.params.id }).sort({ createAt: -1 });
        const response = {
            items: Advs,
            status_code: 200,
            message: 'returned successfully'
        }
        return response

    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.block = async (req, reply) => {
    try {
        const user = await Drivers.findByIdAndUpdate((req.params.id), {
            isBlock: req.body.isBlock
        }, { new: true })

        const response = {
            status_code: 200,
            status: true,
            message: 'تمت العملية بنجاح',
            items: user
        }
        return response

    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.userprofile = async (req, reply) => {
    try {
        const user = await Drivers.findById(req.params.id).populate('supplier_id').select(['-token', '-password']);
        const response = {
            status_code: 200,
            status: true,
            message: '',
            items: user
        }
        reply.send(response);
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updateprofileFromAdmin = async (req, reply) => {
    try {
        const Driver_id = req.params.id
        console.log(Driver_id)
        const user = await Drivers.findByIdAndUpdate((Driver_id), {
            name: req.body.name,
            images: req.body.images,
            dt_dob: req.body.dt_dob,
            // email: req.body.email,
            image: req.body.image,
            // supplier_id: req.body.supplier_id,
            address: req.body.address,
            phone_number: req.body.phone_number,
            car_name: req.body.car_name,
            car_number: req.body.car_number,
            car_color: req.body.car_color,
        }, { new: true })
        if (!user) {

            const response = {
                status_code: 404,
                status: false,
                message: 'حدث خطأ الرجاء المحاولة مرة اخرى',
                items: []
            }
            reply.send(response);
        }
        else {

            const response = {
                status_code: 200,
                status: true,
                message: '',
                items: user
            }
            reply.send(response);
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.uploadDriverPhoto = async (req, reply) => {
    if (req.raw.files) {
        const files = req.raw.files
        let fileArr = []
        for (let key in files) {
            fileArr.push({
                name: files[key].name,
                mimetype: files[key].mimetype
            })
        }
        var data = new Buffer(files.image.data);
        fs.writeFile('./uploads/' + files.image.name, data, 'binary', function (err) {
            if (err) {
                console.log("There was an error writing the image")
            }
            else {
                console.log("The sheel file was written")
            }
        });

        cloudinary.v2.uploader.upload('./uploads/' + files.image.name,
            function (error, result) {
                console.log(result, error)
                reply.send(result)
            });
    }
}


//Reports
exports.rpt_getOrderswithstatus = async (req, reply) => {
    try {
        var query = {}
        if (req.body.dt_start && req.body.dt_end) {
            query = { $and: [{ createAt: { $lte: new Date(req.body.dt_end) } }, { createAt: { $gte: new Date(req.body.dt_start) } }] }
        }
        if (req.body.StatusId) {
            query['StatusId'] = req.body.StatusId
        }
        if (req.body.driver_id) {
            query['driver_id'] = req.body.driver_id
        }

        query['supplier_id'] = req.body.supplier_id

        // if (req.body.supplier_id) {
        //     var arr = []
        //     const supplier_id = req.body.supplier_id
        //     const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        //     _drivers_ids.forEach(element => {
        //         arr.push(element._id)
        //     });
        //     console.log(arr)
        //     query['driver_id'] = { $in: arr }
        // }

        console.log(query)
        var page = parseInt(req.query.page, 10)
        var limit = parseInt(req.query.limit, 10)
        const total = await Order.find(query).count();

        await Order.find(query).sort({ _id: -1 })
            .populate('user_id')
            .populate('driver_id')
            .populate('delivery_id')
            .populate('deliveryOption_id')
            .populate({ path: 'items.product_id', populate: { path: 'product_id' } })
            .populate({ path: 'driver_id', populate: { path: 'supplier_id' } })
            .skip((page) * limit)
            .limit(limit)
            .exec(function (err, item) {

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
                reply.send(response)
            });

    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.rpt_getRevenu = async (req, reply) => {
    try {
        var query = {}

        if (req.body.dt_start && req.body.dt_end) {
            query = { $and: [{ createAt: { $lte: new Date(req.body.dt_end) } }, { createAt: { $gte: new Date(req.body.dt_start) } }] }
        }
        if (req.body.driver_id) {
            query['driver_id'] = req.body.driver_id
        }
        // if (req.body.supplier_id) {
        //     var arr = []
        //     const supplier_id = req.body.supplier_id
        //     const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        //     _drivers_ids.forEach(element => {
        //         arr.push(element._id)
        //     });
        //     console.log(arr)
        //     query['driver_id'] = { $in: arr }
        // }

        query['StatusId'] = 4
        query['supplier_id'] = req.body.supplier_id

        var page = parseInt(req.query.page, 10)
        var limit = parseInt(req.query.limit, 10)
        const total = await Order.find(query).count();
        const all = await Order.find(query);

        await Order.find(query).sort({ _id: -1 })
            .populate('user_id')
            .populate('driver_id')
            .populate('delivery_id')
            .populate('deliveryOption_id')
            .populate({ path: 'items.product_id', populate: { path: 'product_id' } })
            .populate({ path: 'items.supplier_id', populate: { path: 'supplier_id' } })
            .skip((page) * limit)
            .limit(limit)
            .exec(function (err, item) {
                const response = {
                    status_code: 200,
                    status: true,
                    message: 'return succssfully',
                    items: item,
                    sum: lodash.sumBy(all, function (o) { return o.Total; }),
                    pagenation: {
                        size: item.length,
                        totalElements: total,
                        totalPages: Math.floor(total / limit),
                        pageNumber: page
                    }
                }
                reply.send(response)
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.rpt_getOrderMaps = async (req, reply) => {
    try {
        var query = {}
        console.log(req.body.supplier_id)
        if (req.body.dt_start && req.body.dt_end) {
            query = { $and: [{ createAt: { $lte: new Date(req.body.dt_end) } }, { createAt: { $gte: new Date(req.body.dt_start) } }] }
        }

        query['StatusId'] = 4
        query['supplier_id'] = req.body.supplier_id

        await Order.find(query)
            .sort({ _id: -1 })
            .select({ 'lat': 1, 'lng': 1 })
            .populate('user_id')
            // .skip((page) * limit)
            // .limit(limit)
            .exec(function (err, item) {
                const response = {
                    status_code: 200,
                    status: true,
                    message: 'return succssfully',
                    items: item
                }
                reply.send(response)
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}


//charts
exports.getDailyRevenu = async (req, reply) => {
    try {
        // var arr = []
        // const supplier_id = req.params.id
        // const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        // _drivers_ids.forEach(element => {
        //     arr.push(element._id)
        // });


        let cc = momentTZ().tz("Asia/Riyadh").format('YYYY-MM-DD');
        console.log(cc)
        var _items = []
        const dt = new Date()
        console.log(dt.toISOString().slice(0, 10))

        const today = moment().startOf('day')
        const today_val = today.add(-3, 'hours').toDate()
        const today_val2 = moment(today.add(-3, 'hours')).endOf('day').toDate()
        console.log(today.toDate())

        // var all = await Order.find({ StatusId: 4 })
        // var DailyRevenu = lodash.sumBy(all, function (o) { return o.Total; })
        // var newComments = await Order.find({ isRate: true, isOpen: false }).count();

        // const order =
        // console.log(order)

        console.log('today1' + new Date(new Date().setHours(00, 00, 00)))
        console.log('today2' + new Date(new Date().setHours(23, 59, 59)))
        // const test = await Order.find({ $or: [{ StatusId: 3 }, { StatusId: 4 }] })
        // var vvv = []
        // const  x =  test.filter(element=>{
        //     return element.createAt.toISOString().slice(0, 10) == cc
        // })
        // // test.forEach(element => {
        // //     console.log(element.createAt.toISOString().slice(0, 10), cc)
        // //     if (element.createAt.toISOString().slice(0, 10) == cc) {
        // //         vvv.push(element)
        // //     }
        // // });
        // console.log(x.length)
        const newOrders = await Order.find({
            $and: [{
                createAt: {
                    $gte: new Date(new Date().setHours(00, 00, 00)),
                    $lt: new Date(new Date().setHours(23, 59, 59))
                }
            }, { supplier_id: req.params.id }, { StatusId: 2 }]
        }).count()
        const _all = await Order.find({
            $and: [{

                createAt: {
                    $gte: new Date(new Date().setHours(00, 00, 00)),
                    $lt: new Date(new Date().setHours(23, 59, 59))
                }
            }, { supplier_id: req.params.id }, { $or: [{ StatusId: 3 }, { StatusId: 4 }] }]
        }).count()
        const cancelOrder_drivers = await Order.find({
            $and: [{
                createAt: {
                    $gte: new Date(new Date().setHours(00, 00, 00)),
                    $lt: new Date(new Date().setHours(23, 59, 59))
                }
            }, { supplier_id: req.params.id }, { StatusId: 6 }]
        }).count()
        const cancelOrder_users = await Order.find({
            $and: [{
                createAt: {
                    $gte: new Date(new Date().setHours(00, 00, 00)),
                    $lt: new Date(new Date().setHours(23, 59, 59))
                }
            }, { supplier_id: req.params.id }, { StatusId: 5 }]
        }).count()

        _items.push(
            { _all: _all },
            { newOrders: newOrders },
            { cancelOrder_drivers: cancelOrder_drivers },
            { cancelOrder_users: cancelOrder_users })

        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: _items,
        }

        reply.send(response)
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getProductsCount = async (req, reply) => {
    try {

        // var arr = []
        // const supplier_id = req.params.id
        // const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        // _drivers_ids.forEach(element => {
        //     arr.push(element._id)
        // });

        var _items = []
        var Products = await Product.find({ supplier_id: supplier_id }).count();
        var Suppliers = await Supplier.find().count()

        var allOrders = await Order.find({ $and: [{ $or: [{ StatusId: 4 }, { StatusId: 3 }] }, { supplier_id: req.params.id }] })
        var DailyRevenu = lodash.sumBy(allOrders, function (o) { return o.Total; })
        var deliveryCostRevenu = lodash.sumBy(allOrders, function (o) { return o.deliveryCost; })


        _items.push(
            { revenu: DailyRevenu.toFixed(2) - deliveryCostRevenu.toFixed(2) },
            { deliveryCostRevenu: deliveryCostRevenu.toFixed(2) },
            { Suppliers: Suppliers },
            { Products: Products }
        )
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: _items,
        }
        reply.send(response)
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getTop3Category = async (req, reply) => {
    try {
        var products = []
        // var arr = []
        // const supplier_id = req.params.id
        // const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        // _drivers_ids.forEach(element => {
        //     arr.push(element._id)
        // });
        // console.log(arr)


        await Order.find({ $and: [{ StatusId: 4 }, { supplier_id: req.params.id }] })
            .populate({ path: 'items.product_id', populate: { path: 'product_id' } }).select('items')
            .exec(function (err, item) {
                item.forEach(element => {
                    if (element.items) {
                        element.items.forEach(elm => {
                            products.push(elm)
                            console.log(elm)
                        });
                    }
                });

                // var result = lodash.countBy(products, 'product_id.name');
                // console.log(result);

                var _result = lodash(products)
                    .groupBy('product_id.name')
                    .map(function (items, _name) {
                        return { name: _name, count: items.length }
                    }).value()

                var orderedResult = lodash.orderBy(_result, ['count'], ['desc']);
                var FinalResult = lodash.take(orderedResult, 4)

                const response = {
                    status_code: 200,
                    status: true,
                    message: 'return succssfully',
                    items: FinalResult,
                }
                reply.send(response)
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getTop5Suppliers = async (req, reply) => {
    try {
        var products = []
        await Order.find({ StatusId: 4 })
            .populate({ path: 'driver_id', populate: { path: 'supplier_id' } })
            .exec(function (err, item) {
                item.forEach(element => {
                    // if (element.items) {
                    // element.forEach(elm => {
                    if (element.driver_id) {
                        products.push(element.driver_id.supplier_id)
                        console.log(element.driver_id.supplier_id)
                    }
                    // });
                    // }
                });

                // var result = lodash.countBy(products, 'product_id.name');
                // console.log(result);

                var _result = lodash(products)
                    .groupBy('name')
                    .map(function (items, _name) {
                        return { name: _name, count: items.length }
                    }).value()

                var orderedResult = lodash.orderBy(_result, ['count'], ['desc']);
                var FinalResult = lodash.take(orderedResult, 4)

                const response = {
                    status_code: 200,
                    status: true,
                    message: 'return succssfully',
                    items: FinalResult,
                }
                reply.send(response)
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getTop10Cities = async (req, reply) => {
    try {
        var products = []
        await Order.find({ StatusId: 4 })
            .exec(function (err, item) {
                item.forEach(element => {
                    // if (element.items) {
                    // element.forEach(elm => {
                    products.push(element)
                    console.log(element)
                    // });
                    // }
                });

                // var result = lodash.countBy(products, 'product_id.name');
                // console.log(result);

                var _result = lodash(products)
                    .groupBy('city')
                    .map(function (items, _name) {
                        return { name: _name, value: items.length }
                    }).value()

                var orderedResult = lodash.orderBy(_result, ['count'], ['desc']);
                var FinalResult = lodash.take(orderedResult, 10)

                const response = {
                    status_code: 200,
                    status: true,
                    message: 'return succssfully',
                    items: FinalResult,
                }
                reply.send(response)
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.importantCounters = async (req, reply) => {
    try {
        // var arr = []
        // const supplier_id = req.params.id
        // const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        // _drivers_ids.forEach(element => {
        //     arr.push(element._id)
        // });

        var _items = []
        var allPostOrders = await Order.find({ $and: [{ isRate: true }, { supplier_id: req.params.id }] }).count()
        var all = await Order.find({ $and: [{ $or: [{ StatusId: 4 }, { StatusId: 3 }] }, { supplier_id: req.params.id }] }).count()
        var allOrders = await Order.find({ $and: [{ $or: [{ StatusId: 4 }, { StatusId: 3 }] }, { supplier_id: req.params.id }] })
        var DailyRevenu = lodash.sumBy(allOrders, function (o) { return o.Total; })

        var refillOrders = await Order.find({ $and: [{ orderType: 2 }, { StatusId: 4 }, { supplier_id: req.params.id }] }).count()
        var canceledOrder = await Order.find({ $and: [{ $or: [{ StatusId: 5 }, { StatusId: 6 }] }, { supplier_id: req.params.id }] }).count();
        var newComments = await Order.find({ StatusId: 1 }).count();
        // var coupons = await Order.find({ coupon: { $ne: '' } }).count();
        var basket = await Order.find({ $and: [{ supplier_id: req.params.id }, { paymentType: 3 }] }).count();
        var Userss = await Users.find().count();
        var _Drivers = await Drivers.find({ supplier_id: supplier_id }).count();

        _items.push(
            { name: 'الطلبات المنجزة', value: all },
            { name: 'الطلبات الملغية', value: canceledOrder },
            { name: 'الطلبات المعلقة', value: newComments },
            { name: 'التقييمات', value: allPostOrders },
            { name: 'طلبات التعئبة', value: refillOrders },
            { name: 'الطلبات بالنقاط', value: basket },
            { name: 'المستخدمين', value: Userss },
            { name: 'السائقين', value: _Drivers })

        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: _items,
        }

        reply.send(response)
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.top15NewUsers = async (req, reply) => {
    try {
        var Userss = await Users.find().sort({ createAt: -1 }).limit(15)

        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: Userss,
        }

        reply.send(response)
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.UsersPerYear = async (req, reply) => {
    try {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        var items = []
        await Users.find().sort({ createAt: 1 })
            .exec(function (err, result) {
                result.forEach(element => {
                    var month_number = new Date(element.createAt).getMonth();
                    var month_name = monthNames[month_number];
                    items.push({ month: month_name, user: element._id })
                });

                var _result = lodash(items)
                    .groupBy('month')
                    .map(function (items, _name) {
                        return { name: _name, value: items.length }
                    }).value()

                var orderedResult = lodash.orderBy(_result, ['count'], ['desc']);

                const response = {
                    name: 'مستخدم جديد',
                    series: orderedResult
                }
                reply.send(response)
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getTop5RegisterCities = async (req, reply) => {
    try {
        var products = []
        await Users.find().sort({ createAt: -1 })
            .exec(function (err, item) {
                item.forEach(element => {
                    products.push(element)
                });

                // var result = lodash.countBy(products, 'product_id.name');
                // console.log(result);

                var _result = lodash(products)
                    .groupBy('city')
                    .map(function (items, _name) {
                        return { name: _name, value: items.length * 10 }
                    }).value()

                var orderedResult = lodash.orderBy(_result, ['count'], ['desc']);
                var FinalResult = lodash.take(orderedResult, 10)

                const response = {
                    status_code: 200,
                    status: true,
                    message: 'return succssfully',
                    items: FinalResult,
                }
                reply.send(response)
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}


exports.revenuPerYear = async (req, reply) => {
    try {
        // var arr = []
        // const supplier_id = req.params.id
        // const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        // _drivers_ids.forEach(element => {
        //     arr.push(element._id)
        // });


        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        var items = []
        await Order.find({ $and: [{ supplier_id: req.params.id }, { StatusId: 4 }] })
            .exec(function (err, result) {
                result.forEach(element => {
                    var month_number = new Date(element.createAt).getMonth();
                    var month_name = monthNames[month_number];
                    items.push({ month: month_name, Total: element.Total })
                });

                var _result = lodash(items)
                    .groupBy('month')
                    .map(function (items, _name) {
                        return { name: _name, value: lodash.sumBy(items, function (o) { return o.Total; }), }
                    }).value()

                var orderedResult = lodash.orderBy(_result, ['count'], ['desc']);

                const response = {
                    name: 'العائدات',
                    items: orderedResult
                }
                reply.send(response)
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.SupplierPerYear = async (req, reply) => {
    try {
        const supplier_id = req.params.id


        var supplier_arr = []
        var orderedResult = []
        var count = 0;
        var sup = await Supplier.find().count()
        await Drivers.find({ supplier_id: supplier_id })
            .populate('supplier_id')
            .exec(async function (err, result) {
                result.forEach(async function (element) {
                    var cancelOrder = await Order.find({ $and: [{ driver_id: element._id }, { $or: [{ StatusId: 5 }, { StatusId: 6 }] }] }).count();
                    var DoneOrder = await Order.find({ $and: [{ StatusId: 4 }, { driver_id: element._id }] }).count();
                    var allOrders = await Order.find({ driver_id: element._id }).count();
                    // supplier_arr.push(element.name)
                    orderedResult.push(
                        {
                            name: 'الطلبات الملغية',
                            value: cancelOrder
                        },
                        {
                            name: 'الطلبات المنجزة',
                            value: DoneOrder
                        },
                        {
                            name: 'الطلبات الكلية',
                            value: allOrders
                        }
                    )
                    supplier_arr.push({ name: element.supplier_id.name, series: orderedResult })
                    orderedResult = []
                    count++;
                    if (count === sup) {
                        count = 0

                        reply.send(supplier_arr)
                        // reply.end()
                    }
                });
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}


//Orders
exports.getOrders = async (req, reply) => {
    try {
        // var arr = []
        // const supplier_id = req.params.id
        // const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        // _drivers_ids.forEach(element => {
        //     arr.push(element._id)
        // });

        var page = parseInt(req.query.page, 10)
        var limit = parseInt(req.query.limit, 10)
        const total = await Order.find({ $and: [{ orderType: { $ne: 3 } }, { supplier_id: req.params.id }] }).count();

        await Order.find({ $and: [{ orderType: { $ne: 3 } }, { supplier_id: req.params.id }] }).sort({ _id: -1 })
            .populate('user_id')
            .populate('driver_id')
            .populate({ path: 'items.product_id', populate: { path: 'product_id' } })
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
    }
    catch (err) {
        throw boom.boomify(err)
    }
}

exports.getOrdersSeacrh = async (req, reply) => {
    try {
        var page = parseInt(req.query.page, 10)
        var limit = parseInt(req.query.limit, 10)
        // const total = await Order.find().count();

        // var arr = []
        const supplier_id = req.params.id
        // const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        // _drivers_ids.forEach(element => {
        //     arr.push(element._id)
        // });


        await Order.find({ supplier_id: supplier_id }).sort({ _id: -1 })
            .populate('driver_id')
            .populate('user_id')
            .populate({ path: 'items.product_id', populate: { path: 'product_id' } })
            // .skip((page - 1) * limit)
            // .limit(limit)
            .exec(function (err, item) {
                var result = _.filter(item, function (itm) {
                    return (itm.user_id.full_name.indexOf(req.body.full_name) >= 0 || itm.user_id.phone_number.indexOf(req.body.phone_number) >= 0)
                });
                var result1 = lodash(result).slice((page) * limit).take(limit).value();
                const response = {
                    items: result1,
                    status_code: 200,
                    message: 'returned successfully',
                    pagenation: {
                        size: result1.length,
                        totalElements: result.length,
                        totalPages: Math.floor(result.length / limit),
                        pageNumber: page
                    }
                }
                reply.send(response);
            });
    }
    catch {
        throw boom.boomify(err)
    }
}

exports.getRatedOrders = async (req, reply) => {
    try {
        // var arr = []
        // const supplier_id = req.params.id
        // const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        // _drivers_ids.forEach(element => {
        //     arr.push(element._id)
        // });


        var page = parseInt(req.query.page, 10)
        var limit = parseInt(req.query.limit, 10)
        const total = await Order.find({ $and: [{ isRate: true }, { supplier_id: req.params.id }] }).count();

        await Order.find({ $and: [{ isRate: true }, { supplier_id: req.params.id }] }).sort({ _id: -1 })
            .populate('user_id')
            .populate('driver_id')
            .populate({ path: 'items.product_id', populate: { path: 'product_id' } })
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
    }
    catch {
        throw boom.boomify(err)
    }
}

exports.getNewOrder = async (req, reply) => {
    try {
        // var arr = []
        // const supplier_id = req.params.id
        // const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        // _drivers_ids.forEach(element => {
        //     arr.push(element._id)
        // });



        const total = await Order.find({ $and: [{ StatusId: 1 }, { supplier_id: req.params.id }] }).count();
        reply.send(total)

    }
    catch {
        throw boom.boomify(err)
    }
}

exports.getNewRatedOrder = async (req, reply) => {
    try {
        // var arr = []
        // const supplier_id = req.params.id
        // const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
        // _drivers_ids.forEach(element => {
        //     arr.push(element._id)
        // });

        const total = await Order.find({ $and: [{ isRate: true }, { isOpen: false }, { supplier_id: req.params.id }] }).count();
        reply.send(total)
    }
    catch {
        throw boom.boomify(err)
    }
}

exports.updateRate = async (req, reply) => {
    try {
        const _order = await Order.findByIdAndUpdate((req.params.id), {
            isOpen: true
        }, { new: true })
        const response = {
            status_code: 200,
            status: true,
            message: 'تم تعديل التقييم بنجاح',
            items: null
        }
        reply.send(response);

    }
    catch {
        throw boom.boomify(err)
    }
}

exports.getOrderDetails = async (req, reply) => {
    try {
        const ord = await Order.find({ _id: req.query.id })
        console.log(ord)
        if (ord.StatusId == 1) {
            await Order.find({ _id: req.query.id })
                .sort({ _id: -1 })
                .populate('user_id')
                .populate({ path: 'items.product_id', populate: { path: 'product_id' } })
                .exec(async function (err, item) {
                    const response = {
                        status_code: 200,
                        status: true,
                        message: 'return succssfully',
                        items: item
                    }
                    reply.send(response)
                });
        } else {
            const ord = await Order.find({ _id: req.query.id })
                .sort({ _id: -1 })
                .populate('user_id')
                .populate('driver_id')
                .populate({ path: 'items.product_id', populate: { path: 'product_id' } })
                .exec(async function (err, item) {
                    const response = {
                        status_code: 200,
                        status: true,
                        message: 'return succssfully',
                        items: item
                    }
                    reply.send(response)
                });
        }
    }
    catch{
        throw boom.boomify(err)
    }
}


//Points
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
        reply.send({ msg: "success" });
    } catch (err) {
        throw boom.boomify(err)
    }
}


//auth 
exports.login = async (req, reply) => {
    try {

        const Admins = await Supplier.findOne({ $and: [{ email: req.body.email }, { password: req.body.password }] })

        if (Admins) {
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: Admins
            }
            return response
        } else {
            const response = {
                status_code: 404,
                status: false,
                message: 'return succssfully',
                items: null
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

// refresh token
exports.refreshToken = async (req, reply) => {
    try {

        const user = await Supplier.findByIdAndUpdate((req.body._id), {
            fcmToken: req.body.fcmToken
        }, { new: true })

        if (!user) {
            const response = {
                status_code: 404,
                status: false,
                message: 'حدث خطأ الرجاء المحاولة مرة اخرى',
                items: []
            }
            return response
        }
        else {
            const response = {
                status_code: 200,
                status: true,
                message: '',
                items: user
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

//change password
exports.changePassword = async (req, reply) => {
    try {

        const user = await Supplier.findByIdAndUpdate((req.body._id), {
            password: req.body.password
        }, { new: true })

        if (!user) {
            const response = {
                status_code: 404,
                status: false,
                message: 'حدث خطأ الرجاء المحاولة مرة اخرى',
                items: []
            }
            return response
        }
        else {
            const response = {
                status_code: 200,
                status: true,
                message: '',
                items: user
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}