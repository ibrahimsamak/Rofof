// External Dependancies
const boom = require('boom')
const fs = require('fs');
const cloudinary = require('cloudinary');


cloudinary.config({
    cloud_name: 'dkos8ethw',
    api_key: '375638313668992',
    api_secret: 'fsgng51R49_1TQlUbKbbFa4_FbM'
});

// Get Data Models
const { Adv } = require('../models/adv');
// const { client, GetCache, addCache, updateCacheWithAdd, updateCacheWithUpdate, updateCacheWithDelete } = require('../models/cache')

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

// Get all advs
exports.getAdv = async (req, reply) => {
    try {
        // client.del('Advs')
        // const cachedObj = await GetCache('Advs')
        // if (cachedObj) {
        //     console.log('serving from cach')
        //     const response = {
        //         status_code: 200,
        //         status: true,
        //         message: 'return succssfully',
        //         items: cachedObj
        //     }
        //     return (response)
        // }
        const _Advs = await Adv.find().sort({ _id: -1 });
        // addCache('Advs', _Advs)
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: _Advs
        }
        return (response)
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Get single advs by ID
exports.getSingleAdv = async (req, reply) => {
    try {
        const Advs = await Adv.findById((req.params.id))

        const response = {
            status_code: 200,
            status: true,
            message: 'تمت العملية بنجاح',
            items: Advs
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Add a new advs
exports.addAdv = async (req, reply) => {
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


            let Advs = new Adv({
                name: req.raw.body.name,
                image: img,
                details: req.raw.body.details,
                type: req.raw.body.type,
                price_after: req.raw.body.price_after,
                price_before: req.raw.body.price_before
            });

            let rs = await Advs.save();
            // await updateCacheWithAdd('Advs', rs)
            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: rs
            }

            reply.send(response);

        }

    } catch (err) {
        throw boom.boomify(err)
    }
}

// delete adv
exports.deleteAdv = async (req, reply) => {
    const Advs = await Adv.findByIdAndRemove(req.params.id);
    const response = {
        status_code: 200,
        status: true,
        message: 'تمت العملية بنجاح',
        items: []
    }
    // await updateCacheWithDelete('Advs', req.params.id)

    return response

}

// Update an existing adv
exports.updateAdv = async (req, reply) => {
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

            const Advs = await Adv.findByIdAndUpdate((req.params.id), {
                name: req.raw.body.name,
                image: img,
                details: req.raw.body.details,
                type: req.raw.body.type,
                price_after: req.raw.body.price_after,
                price_before: req.raw.body.price_before
            }, { new: true })
            // await updateCacheWithUpdate('Advs', Advs, req.params.id)

            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: Advs
            }
            return response

        } else {
            const Advs = await Adv.findByIdAndUpdate((req.params.id), {
                name: req.raw.body.name,
                details: req.raw.body.details,
                type: req.raw.body.type,
                price_after: req.raw.body.price_after,
                price_before: req.raw.body.price_before
            }, { new: true })
            // await updateCacheWithUpdate('Advs', Advs, req.params.id)

            const response = {
                status_code: 200,
                status: true,
                message: 'return succssfully',
                items: Advs
            }
            return response
        }
    } catch (err) {
        throw boom.boomify(err)
    }
}

