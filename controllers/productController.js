// External Dependancies
const boom = require('boom')
const config = require('config');
const fs = require('fs');
const NodeGeocoder = require('node-geocoder');
const concat = require('concat-stream')
const pump = require('pump')
const cloudinary = require('cloudinary');
const multer = require('multer');
const util = require('util');

cloudinary.config({
    cloud_name: 'diszvlmqq',
    api_key: '626239833572272',
    api_secret: '1ZkJK1IN2eUhF2qVEc-M2QOAI0I'
});

// Get Data Models
const { Product, Category, Supplier } = require('../models/Product')
const { client } = require('../models/cache')
const { getCurrentDateTime } = require('../models/Constant');


async function uploadImages(img) {
    return new Promise(function (resolve, reject) {
        cloudinary.v2.uploader.upload('./uploads/' + img,
            function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    console.log(result, error)
                    img = result['url']
                    resolve(img);
                }
            });
    });

}

// Get All Categories
exports.getCategories = async (req, reply) => {
    try {
        // client.del('Categories')
        // client.get = util.promisify(client.get)
        // const cachedObj = await client.get('Categories')
        // if (cachedObj) {
        //     console.log('serving from cach')
        //     const response = {
        //         status_code: 200,
        //         status: true,
        //         message: 'return succssfully',
        //         items: JSON.parse(cachedObj)
        //     }
        //     return response
        // }
        const Categories = await Category.find({_id: { $nin: [ '5c681f80ad8747623305f634', '5c8cb6c10a34fc002491f406' ] }})
        // client.set('Categories', JSON.stringify(Categories))
        // client.expire('Categories', 86400)
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: Categories
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Get top 20 Products
exports.getProducts = async (req, reply) => {
    try {
        // client.get = util.promisify(client.get)
        // const cachedObj = await client.get('Products')
        // if (cachedObj) {
        //     console.log('serving from cach')
        //     const response = {
        //         status_code: 200,
        //         status: true,
        //         message: 'return succssfully',
        //         items: JSON.parse(cachedObj)
        //     }
        //     return response
        // }
        const Products = await Product.find({ category_id: { $nin: [ '5c681f80ad8747623305f634', '5c8cb6c10a34fc002491f406' ] } }).sort({ rate: -1 }).limit(20)
        // client.set('Products', JSON.stringify(Products))
        // client.expire('Products', 86400)
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: Products
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Get single Product by ID
exports.getSingleProductClient = async (req, reply) => {
    try {
        const id = req.params.id
        const _Product = await Product.findById(id)
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: _Product
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Get Product by Categroy 
exports.getProductCateroy = async (req, reply) => {

    var page = parseInt(req.query.page, 10)
    var limit = parseInt(req.query.limit, 10)
    const total = await Product.find({ category_id: req.body.category_id }).count();

    var result = [];
    await Product.find({ category_id: req.body.category_id })
        .sort({ rate: -1 })
        .skip((page) * limit)
        .limit(limit)
        .exec(function (err, xx) {
            result = xx
            const response = {
                items: result,
                status_code: 200,
                message: 'returned successfully',
                pagenation: {
                    size: result.length,
                    totalElements: total,
                    totalPages: Math.floor(total / limit),
                    pageNumber: page
                }
            }
            reply.send(response)
        });
}

// Get Product by Search Key 
exports.getProductBySearch = async (req, reply) => {

    // console.log(req)
    var page = parseInt(req.query.page, 10)
    var limit = parseInt(req.query.limit, 10)
    const total = await Product.find({$and:[{ name: { $regex: '.*' + req.body.name + '.*' } } , {category_id: { $nin: [ '5c681f80ad8747623305f634', '5c8cb6c10a34fc002491f406' ] }}  ]}).count();
    var result = [];
    let prod = await Product.find({$and:[{ name: { $regex: '.*' + req.body.name + '.*' } } , {category_id: { $nin: [ '5c681f80ad8747623305f634', '5c8cb6c10a34fc002491f406' ] }}  ]})
        .sort({ rate: -1 })
        .skip((page) * limit)
        .limit(limit)
        .exec(function (err, xx) {
            result = xx;
            console.log(result)
            const response = {
                items: result,
                status_code: 200,
                message: 'returned successfully',
                pagenation: {
                    size: result.length,
                    totalElements: total,
                    totalPages: Math.floor(total / limit),
                    pageNumber: page
                }
            }
            reply.send(response)
        });
}


// cPanel
exports.getCategoriesAdmin= async (req, reply) => {
    try {
        // client.del('Categories')
        // client.get = util.promisify(client.get)
        // const cachedObj = await client.get('Categories')
        // if (cachedObj) {
        //     console.log('serving from cach')
        //     const response = {
        //         status_code: 200,
        //         status: true,
        //         message: 'return succssfully',
        //         items: JSON.parse(cachedObj)
        //     }
        //     return response
        // }
        const Categories = await Category.find()
        // client.set('Categories', JSON.stringify(Categories))
        // client.expire('Categories', 86400)
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: Categories
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.uploadPhoto = async (req, reply) => {
    cloudinary.v2.uploader.upload('./public/' + req.files[0].filename,
        function (error, result) {
            console.log(result, error)
            reply.send(result)
        });
}

exports.getSingleCategory = async (req, reply) => {
    try {
        const categories = await Category.findById(req.params.id);
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: categories
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.addCategory = async (req, reply) => {
    try {
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

            let img = '';
            await uploadImages(files.image.name).then((x) => {
                img = x;
            });
            console.log(img)

            let category = new Category({
                name: req.raw.body.name,
                image: img
            });

            let rs = await category.save();
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: rs
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updateCategory = async (req, reply) => {
    try {
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

            let img = '';
            await uploadImages(files.image.name).then((x) => {
                img = x;
            });
            const categories = await Category.findByIdAndUpdate((req.params.id), {
                name: req.raw.body.name, image: img
            }, { new: true })
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: categories
            }
            return response

        } else {
            const categories = await Category.findByIdAndUpdate((req.params.id), {
                name: req.raw.body.name
            }, { new: true })
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: categories
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.deleteCategory = async (req, reply) => {
    try {
        const categories = await Category.findByIdAndRemove(req.params.id);

        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: []
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getSupplier = async (req, reply) => {
    try {
        const Categories = await Supplier.find()
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: Categories
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getSingleSupplier = async (req, reply) => {
    try {
        const categories = await Supplier.findById(req.params.id);
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: categories
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.addSupplier = async (req, reply) => {
    try {

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

            let img = '';
            await uploadImages(files.image.name).then((x) => {
                img = x;
            });
            console.log(img)

            let category = new Supplier({
                name: req.raw.body.name,
                details: req.raw.body.details,
                password: req.raw.body.password,
                email: req.raw.body.email,
                image: img
            });

            let rs = await category.save();
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: rs
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updateSupplier = async (req, reply) => {
    try {
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

            let img = '';
            await uploadImages(files.image.name).then((x) => {
                img = x;
            });
            const categories = await Supplier.findByIdAndUpdate((req.params.id), {
                name: req.raw.body.name,
                image: img,
                details: req.raw.body.details,
                password: req.raw.body.password,
                email: req.raw.body.email
            }, { new: true })
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: categories
            }
            return response

        } else {
            const categories = await Supplier.findByIdAndUpdate((req.params.id), {
                name: req.raw.body.name,
                details: req.raw.body.details,
                password: req.raw.body.password,
                email: req.raw.body.email
            }, { new: true })
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: categories
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.deleteSupplier = async (req, reply) => {
    try {
        const categories = await Supplier.findByIdAndRemove(req.params.id);

        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: []
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}


//products
exports.getAllProducts = async (req, reply) => {
    try {
        var page = parseInt(req.query.page, 10)
        var limit = parseInt(req.query.limit, 10)
        const total = await Product.find().count();

        const products = await Product
            .find()
            .populate('category_id')
            .sort({ _id: -1 })
            .skip((page) * limit)
            .limit(limit)
            .exec(function (err, xx) {
                if (xx.length) {
                    const response = {
                        items: xx,
                        status_code: 200,
                        message: 'returned successfully',
                        pagenation: {
                            size: xx.length,
                            totalElements: total,
                            totalPages: Math.floor(total / limit),
                            pageNumber: page
                        }
                    }
                    reply.send(response);
                }
                else {
                    const response = {
                        items: xx,
                        status_code: 200,
                        message: 'returned successfully',
                        pagenation: {
                            size: 0,
                            totalElements: total,
                            totalPages: 0,
                            pageNumber: 0
                        }
                    }
                    reply.send(response);
                }
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.productSearch = async (req, reply) => {
    try {
        await Product.find({ $or: [{ name: { $regex: '.*' + req.body.name + '.*' } }] })
            .exec(function (err, xx) {
                const response = {
                    items: xx,
                    status_code: 200,
                    message: 'returned successfully'
                }
                reply.send(response);
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.productbysubcategoryid = async (req, reply) => {
    try {
        const products = await Product.find({ category_id: req.params.id }).sort({ _id: -1 })
            .populate('category_id')
            .exec(function (err, xx) {
                reply.send(xx);
            });
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.addProduct = async (req, reply) => {
    try {
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

            let img = '';
            await uploadImages(files.image.name).then((x) => {
                img = x;
            });
            console.log(img)

            let products = new Product({
                name: req.raw.body.name,
                description: req.raw.body.description,
                image: img,
                warrenty: req.raw.body.warrenty,
                category_id: req.raw.body.category_id,
                createat: getCurrentDateTime(),
                rate: 0,
                price: req.raw.body.price
            });

            let rs = await products.save();
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: rs
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updateProduct = async (req, reply) => {
    try {
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

            let img = '';
            await uploadImages(files.image.name).then((x) => {
                img = x;
            });
            const products = await Product.findByIdAndUpdate((req.params.id), {
                name: req.raw.body.name,
                description: req.raw.body.description,
                image: img,
                warrenty: req.raw.body.warrenty,
                category_id: req.raw.body.category_id,
                createat: getCurrentDateTime(),
                // rate: 0,
                price: req.raw.body.price
            }, { new: true })
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: products
            }
            return response
        } else {
            const products = await Product.findByIdAndUpdate((req.params.id), {
                name: req.raw.body.name,
                description: req.raw.body.description,
                warrenty: req.raw.body.warrenty,
                category_id: req.raw.body.category_id,
                createat: getCurrentDateTime(),
                // rate: 0,
                price: req.raw.body.price
            }, { new: true })
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: products
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.deleteProduct = async (req, reply) => {
    try {
        const products = await Product.findByIdAndRemove(req.params.id);
        reply.send(products);
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getSingleProduct = async (req, reply) => {
    try {
        const products = await Product.findById(req.params.id);
        reply.send(products);
    } catch (err) {
        throw boom.boomify(err)
    }
}