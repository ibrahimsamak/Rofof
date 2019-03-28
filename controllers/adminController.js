// External Dependancies
const boom = require('boom')
const jwt = require('jsonwebtoken');
const config = require('config');
const util = require('util');
const redis = require('redis');
const host = 'redis-11505.c99.us-east-1-4.ec2.cloud.redislabs.com'
const port = 11505
const password = 'gazredis'
const client = redis.createClient({
    port: port, host: host, password: password
})




// Get Data Models
const { Admin } = require('../models/Admin')

// Get all Admins
exports.getAdmins = async (req, reply) => {
    try {
        client.get = util.promisify(client.get)
        const cachedObj = await client.get('Admins')
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
        const Admins = await Admin.find().sort({ _id: -1 });
        client.set('Admins', JSON.stringify(Admins))
        client.expire('Admins', 86400)
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: Admins
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Get single Admin by ID
exports.getSingleAdmin = async (req, reply) => {
    try {
        const Admins = await Admin.findById((req.params.id))

        const response = {
            status_code: 200,
            status: true,
            message: 'تمت العملية بنجاح',
            items: Admins
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Add a new Admin
exports.addAdmin = async (req, reply) => {
    try {
        let Admins = new Admin({
            full_name: req.body.full_name,
            email: req.body.email,
            password: req.body.password,
            phone_number: req.body.phone_number,
            roles: req.body.roles,
            token: jwt.sign({ _id: req.body.id }, config.get('jwtPrivateKey'), {
                expiresIn: '365d'
            })
        });

        let rs = await Admins.save();
        const response = {
            status_code: 200,
            status: true,
            message: 'تمت العملية بنجاح',
            items: rs
        }
        return response

    } catch (err) {
        throw boom.boomify(err)
    }
}

//login
exports.login = async (req, reply) => {
    try {

        const Admins = await Admin.findOne({ $and: [{ email: req.body.email }, { password: req.body.password }] })

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

        const user = await Admin.findByIdAndUpdate((req.body._id), {
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

// delete admin
exports.deleteAdmin = async (req, reply) => {
    const Admins = await Admin.findByIdAndRemove(req.params.id);
    const response = {
        status_code: 200,
        status: true,
        message: 'تمت العملية بنجاح',
        items: []
    }
    return response

}

// Update an existing Admin
exports.updateAdmin = async (req, reply) => {
    try {
        const Admins = await Admin.findByIdAndUpdate((req.params.id), {
            full_name: req.body.full_name,
            email: req.body.email,
            password: req.body.password,
            phone_number: req.body.phone_number,
            roles: req.body.roles
        }, { new: true })

        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: Admins
        }
        return response

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
