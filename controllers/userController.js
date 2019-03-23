// External Dependancies
const boom = require('boom')
const jwt = require('jsonwebtoken');
const config = require('config');
const fs = require('fs');
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
const { Users, validateUsers } = require('../models/User')


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

// Get all Users
exports.getUsers = async (req, reply) => {
    try {
        const user = await Users.find()
        return Users
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Get single Users by ID
exports.getSingleUsers = async (req, reply) => {
    try {
        const id = req.user._id
        const _Users = await Users.findById(id)
        const response = {
            status_code: 200,
            status: true,
            message: 'تمت العملية بنجاح',
            items: _Users
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Add a new Users
exports.addUsers = async (req, reply) => {
    try {
        var current_city = ''
        const _user = await Users.findOne({ $or: [{ phone_number: req.body.phone_number }, { email: req.body.email }] });
        if (_user) {
            if (_user.isBlock == true) {
                const response = {
                    status_code: 400,
                    status: false,
                    message: 'تم حظر المستخدم من قبل الادارة',
                    items: []
                }
                return response
            }
            else {
                const response = {
                    status_code: 400,
                    status: false,
                    message: 'البريد الالكتروني او رقم الجوال موجود لدينا مسبقا',
                    items: []
                }
                return response
            }
        }
        else {
            await getAddress(req.body.lat, req.body.lng).then((x) => {
                current_city = x;
            });
            let user = new Users({
                phone_number: req.body.phone_number,
                verify_code: 1234,
                full_name: req.body.full_name,
                email: req.body.email,
                password: req.body.password,
                image: '',
                address: '',
                lat: req.body.lat,
                lng: req.body.lng,
                createAt: new Date(),
                city: current_city,
                isVerify: false,
                isBlock: false,
                wallet: 0,
                gender: req.body.gender,
                currentCity: req.body.currentCity,
                RegisterType: req.body.RegisterType
            });
            let rs = await user.save();

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

//login
exports.login = async (req, reply) => {
    try {
        const _Users = await Users.findOne({ $and: [{ email: req.body.email, password: req.body.password }] })
        if (_Users) {
            const user = await Users.findByIdAndUpdate((_Users.id), {
                token: jwt.sign({ _id: req.body.id }, config.get('jwtPrivateKey'), {
                    expiresIn: '365d'
                })
            }, { new: true })

            const response = {
                status_code: 200,
                status: true,
                message: 'تم التحقق بنجاح',
                items: user
            }
            return response
        } else {
            const response = {
                status_code: 404,
                status: false,
                message: 'خطأ في البريد الالكتروني او كلمة المرور',
                items: _Users
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

//verfy code
exports.verfiy = async (req, reply) => {

    const _user = await Users.findOne({ _id: req.body.id }).select('verify_code');
    console.log(_user);

    if (_user.verify_code === req.body.verify_code) {
        const user = await Users.findByIdAndUpdate((req.body.id), {
            isVerify: true,
            fcmToken: req.body.fcmToken,
            token: jwt.sign({ _id: req.body.id }, config.get('jwtPrivateKey'), {
                expiresIn: '365d'
            })
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
    }
    else {
        const response = {
            status_code: 404,
            status: false,
            message: 'خطأ!! في رقم التفعيل',
            items: []
        }
        return response
    }
}

//forget password
exports.forgetPassword = async (req, reply) => {
    try {
        const _Users = await Users.findOne({ email: req.body.email })
        if (_Users) {
            const update = await Users.findByIdAndUpdate(_Users._id, { password: makeid() }, { new: true })
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

// Update an existing Users
exports.updateUsers = async (req, reply) => {
    try {

        const User_id = req.raw.body._id
        console.log(User_id)
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
            const user = await Users.findByIdAndUpdate((User_id), {
                image: img,
                address: req.raw.body.address,
                full_name: req.raw.body.full_name,
                gender: req.raw.body.gender,
                currentCity: req.raw.body.currentCity
            }, { new: true })
            console.log(user)
            if (!user) {
                const response = {
                    status_code: 404,
                    status: false,
                    message: 'حدث خطأ الرجاء المحاولة مرة اخرى',
                    items: []
                }
                return response;
            }
            else {

                const response = {
                    status_code: 200,
                    status: true,
                    message: 'تم تعديل الملف الشخصي بنجاح',
                    items: user
                }
                return response;
            }
        }
        else {
            const user = await Users.findByIdAndUpdate((User_id), {
                address: req.raw.body.address,
                full_name: req.raw.body.full_name,
                gender: req.raw.body.gender,
                currentCity: req.raw.body.currentCity
            }, { new: true })

            if (!user) {
                const response = {
                    status_code: 404,
                    status: false,
                    message: 'حدث خطأ الرجاء المحاولة مرة اخرى',
                    items: []
                }
                return response;
            } else {
                const response = {
                    status_code: 200,
                    status: true,
                    message: 'تم تعديل الملف الشخصي بنجاح',
                    items: user
                }
                return response;
            }
        }

    } catch (err) {
        throw boom.boomify(err)
    }
}

//change password
exports.changePassword = async (req, reply) => {
    try {
        const User_id = req.user._id

        const _Users = await Users.findById(User_id)
        if (_Users) {
            const update = await Users.findByIdAndUpdate(User_id, { password: req.body.password }, { new: true })
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

//logout
exports.logout = async (req, reply) => {
    try {
        const User_id = req.user._id
        const user = await Users.findByIdAndUpdate((User_id), {
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
            return response
        }
        else {
            const response = {
                status_code: 200,
                status: true,
                message: 'تم تسجيل الخروج بنجاح',
                items: user
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

//refresh token
exports.refreshToken = async (req, reply) => {
    try {
        const User_id = req.user._id
        const user = await Users.findByIdAndUpdate((User_id), {
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


// cPanel
exports.userSearch = async (req, reply) => {
    try {
        var result = []
        await Users.find({
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

exports.userslist = async (req, reply) => {
    try {
        const page = parseInt(req.query.page, 10)
        const limit = parseInt(req.query.limit, 10)
        const total = await Users.find().count();
        var result = []
        const _Users = await Users.find()
            .select(['-token', '-password'])
            .sort({ createAt: -1 })
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
            })

    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.userlistInfo = async (req, reply) => {
    try {
        const Advs = await Users.find().sort({ createAt: -1 });
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
        const user = await Users.findByIdAndUpdate((req.params.id), {
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
        const user = await Users.findById(req.params.id).select(['-token', '-password']);
        const response = {
            status_code: 200,
            status: true,
            message: '',
            items: user
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getUserByCity = async (req, reply) => {
    try {
        var result = []
        await Users.find({ currentCity: req.params.id }).exec(function (err, xx) {
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

exports.getAllUsers = async (req, reply) => {
    try {
        var result = []
        await Users.find().exec(function (err, xx) {
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