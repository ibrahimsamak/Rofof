const _ = require('underscore');
const lodash = require('lodash');
const boom = require('boom')

const { Order } = require('../models/Order');
const { Product, Supplier } = require('../models/Product');
const { Drivers } = require('../models/Driver');
const { Users } = require('../models/User');
const moment = require('moment')


//pages
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
        if (req.body.supplier_id) {
            var arr = []
            const supplier_id = req.body.supplier_id
            const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
            _drivers_ids.forEach(element => {
                arr.push(element._id)
            });
            console.log(arr)
            query['driver_id'] = { $in: arr }
        }

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
        if (req.body.supplier_id) {
            var arr = []
            const supplier_id = req.body.supplier_id
            const _drivers_ids = await Drivers.find({ supplier_id: supplier_id }).select('_id')
            _drivers_ids.forEach(element => {
                arr.push(element._id)
            });
            console.log(arr)
            query['driver_id'] = { $in: arr }
        }

        query['StatusId'] = 4

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

        if (req.body.dt_start && req.body.dt_end) {
            query = { $and: [{ createAt: { $lte: new Date(req.body.dt_end) } }, { createAt: { $gte: new Date(req.body.dt_start) } }] }
        }

        query['StatusId'] = 4

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
        var _items = []
        const dt = new Date()
        console.log(dt.toISOString().slice(0, 10))

        const today = moment().startOf('day')
        const today_val = today.add(3, 'hours').toDate()
        const today_val2 = moment(today.add(3, 'hours')).endOf('day').toDate()
        console.log(today.add(3, 'hours').toDate())

        // var all = await Order.find({ StatusId: 4 })
        // var DailyRevenu = lodash.sumBy(all, function (o) { return o.Total; })
        // var newComments = await Order.find({ isRate: true, isOpen: false }).count();

        // const order =
        // console.log(order)

        const newOrders = await Order.find({ createAt: { $gte: today_val, $lte: today_val2 }, StatusId: 1 }).count()
        const _all = await Order.find({ createAt: { $gte: today_val, $lte: today_val2 }, StatusId: 4 }).count()
        const cancelOrder_drivers = await Order.find({ createAt: { $gte: today_val, $lte: today_val2 }, StatusId: 6 }).count()
        const cancelOrder_users = await Order.find({ createAt: { $gte: today_val, $lte: today_val2 }, StatusId: 5 }).count()

        _items.push(
            { _all: _all },
            { newOrders: newOrders },
            { cancelOrder_drivers: cancelOrder_drivers },
            { cancelOrder_users: cancelOrder_users }
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

exports.getProductsCount = async (req, reply) => {
    try {

        var _items = []
        var _Drivers = await Drivers.find().count();
        var Products = await Product.find().count();
        var Userss = await Users.find().count();
        var Suppliers = await Supplier.find().count()

        _items.push(
            { Drivers: _Drivers },
            { Products: Products },
            { Userss: Userss },
            { Suppliers: Suppliers }
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
        await Order.find({ StatusId: 4 })
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
        var _items = []
        var all = await Order.find({ StatusId: 4 }).count()
        var allOrders = await Order.find({ StatusId: 4 })
        var refillOrders = await Order.find({ $and: [{ orderType: 2 }, { StatusId: 4 }] }).count()
        var DailyRevenu = lodash.sumBy(allOrders, function (o) { return o.Total; })
        var canceledOrder = await Order.find({ $or: [{ StatusId: 5 }, { StatusId: 6 }] }).count();
        var newComments = await Order.find({ StatusId: 1 }).count();
        // var coupons = await Order.find({ coupon: { $ne: '' } }).count();
        var basket = await Order.find({ paymentType: 3 }).count();
        var Userss = await Users.find().count();
        var _Drivers = await Drivers.find().count();

        _items.push(
            { name: 'الطلبات المنجزة', value: all },
            { name: 'الطلبات الملغية', value: canceledOrder },
            { name: 'الطلبات المعلقة', value: newComments },
            { name: 'مجموع العائدات', value: DailyRevenu },
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
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        var items = []
        await Order.find({ StatusId: 4 })
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
        var supplier_arr = []
        var orderedResult = []
        var count = 0;
        var sup = await Supplier.find().count()
        await Drivers.find()
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
