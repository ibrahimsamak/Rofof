// External Dependancies
const boom = require('boom')
const jwt = require('jsonwebtoken');
const config = require('config');
const fs = require('fs');
const util = require('util');
const NodeGeocoder = require('node-geocoder');
const concat = require('concat-stream')
const pump = require('pump')
const cloudinary = require('cloudinary');
const multer = require('multer');


cloudinary.config({
    cloud_name: 'diszvlmqq',
    api_key: '626239833572272',
    api_secret: '1ZkJK1IN2eUhF2qVEc-M2QOAI0I'
});


const options = {
    provider: 'google',
    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyDP-XwnS5Daa_uSFZJvY6H0hsKaOxe2ar0', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};
const geocoder = NodeGeocoder(options);


// Get Data Models
const { Drivers, validateDrivers } = require('../models/Driver')
const { client } = require('../models/cache')
const { getCurrentDateTime } = require('../models/Constant');


async function getAddress(lat, lng) {
    var current_city = ''
    return new Promise(function (resolve, reject) {
        geocoder.reverse({ lat: lat, lon: lng })
            .then(async function (res) {
                if (res) {
                    console.log(res[0]);
                    console.log(res[0]['administrativeLevels']['level1long'], res[0].country);
                    current_city = res[0]['administrativeLevels']['level1long']
                    resolve(current_city);
                }
                else {
                    current_city = ''
                    resolve(current_city);
                }
            })
            .catch(function (err) {
                console.log(err);
                reject(err);
                current_city = ''
            });
    });
}

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

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// Get all Drivers
exports.getDrivers = async (req, reply) => {
    try {
        const user = await Drivers.find()
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: user
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Get single Drivers by ID
exports.getSingleDrivers = async (req, reply) => {
    try {
        const id = req.user._id
        const _Drivers = await Drivers.findById(id)
        const response = {
            status_code: 200,
            status: true,
            message: 'تمت العملية بنجاح',
            items: _Drivers
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Add a new Drivers
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
            supplier_id: req.body.supplier_id,
            isBlock: false,
            car_name: req.body.car_name,
            car_number: req.body.car_number,
            car_color: req.body.car_color,
            createAt: getCurrentDateTime()
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

//login
exports.login = async (req, reply) => {
    try {
        const user = await Drivers.findOne(({ email: req.body.email, password: req.body.password }));
        if (!user) {
            const response = {
                status_code: 404,
                status: false,
                message: 'خطأ في البريد الالكتروني او كلمة المرور',
                items: []
            }
            reply.send(response);
        }
        else {
            const ـuser = await Drivers.findByIdAndUpdate((user._id), {
                fcmToken: req.body.fcmToken,
                token: jwt.sign({ _id: user._id }, config.get('jwtPrivateKey'), {
                    expiresIn: '365d'
                })
            }, { new: true })
            const response = {
                status_code: 200,
                status: true,
                message: 'تم تسجيل الدخول بنجاح',
                items: ـuser
            }
            reply.send(response);
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

//forget password
exports.forgetPassword = async (req, reply) => {
    try {
        const _Drivers = await Drivers.findOne({ email: req.body.email })
        if (_Drivers) {
            const update = await Drivers.findByIdAndUpdate(_Drivers._id, { password: makeid() }, { new: true })
            const response = {
                status_code: 200,
                status: true,
                message: 'تم ارسال كلمة المرور الى البريد الالكتروني بنجاح',
                items: update
            }
            return response
        } else {
            const response = {
                status_code: 404,
                status: false,
                message: 'البريد الالكتروني غير مسجل لدينا',
                items: []
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Update an existing Drivers
exports.updateDrivers = async (req, reply) => {
    try {
        const Driver_id = req.user._id
        console.log(Driver_id)
        const user = await Drivers.findByIdAndUpdate((Driver_id), {
            name: req.body.name,
            images: req.body.images,
            dt_dob: req.body.dt_dob,
            // email: req.body.email,
            image: req.body.image,
            // supplier_id: req.body.supplier_id,
            address: req.body.address,
            phone_number: req.body.phone_number
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

//change password
exports.changePassword = async (req, reply) => {
    try {
        const User_id = req.user._id

        const _Drivers = await Drivers.findById(User_id)
        if (_Drivers) {
            const update = await Drivers.findByIdAndUpdate(User_id, { password: req.body.password }, { new: true })
            const response = {
                status_code: 200,
                status: true,
                message: 'تم تعديل كلمة المرور بنجاح بنجاح',
                items: update
            }
            return response
        } else {
            const response = {
                status_code: 404,
                status: false,
                message: 'المستخدم غير موجود',
                items: []
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updateStatus = async (req, reply) => {
    try {
        const Driver_id = req.user._id
        const user = await Drivers.findByIdAndUpdate((Driver_id), {
            driver_status: req.body.driver_status
        }, { new: true })
        if (user) {
            const response = {
                status_code: 200,
                status: true,
                message: 'تمت العملية بنجاح',
                items: user
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

//logout
exports.logout = async (req, reply) => {
    try {
        const Driver_id = req.user._id
        const user = await Drivers.findByIdAndUpdate((Driver_id), {
            fcmToken: '',
            token: ''
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
                message: 'تم تسجيل الخروج بنجاح',
                items: user
            }
            reply.send(response);
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

//refresh token
exports.refreshTokenDriver = async (req, reply) => {
    try {
        const Driver_id = req.user._id
        const _user = await Drivers.findByIdAndUpdate((Driver_id), {
            fcmToken: req.body.fcmToken
        }, { new: true });

        if (!_user) {
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
                items: _user
            }
            reply.send(response);
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

// cPanel
exports.Driversearch = async (req, reply) => {
    try {
        var result = []
        await Drivers.find({
            $or: [
                { full_name: { $regex: '.*' + req.body.full_name + '.*' } },
                { phone_number: { $regex: '.*' + req.body.phone_number + '.*' } }]
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
        client.get = util.promisify(client.get)
        const cachedObj = await client.get('_Users')
        if (cachedObj) {
            console.log('serving from cach')
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: JSON.parse(cachedObj)
            }
            return response
        }
        const _Users = await Drivers.find().populate('supplier_id').sort({ createAt: -1 }).select(['-token', '-password'])
        client.set('_Users', JSON.stringify(_Users))
        client.expire('_Users', 86400)
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: _Users
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.userlistInfo = async (req, reply) => {
    try {
        const Advs = await Drivers.find().sort({ createAt: -1 });
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