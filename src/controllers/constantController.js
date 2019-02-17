const boom = require('boom')

// Get Data Models
const { BuyUnits, ContactOption, SocialOption, StaticPage, city, setting } = require('../models/Constant')

exports.getBuyUnits = async (req, reply) => {
    try {
        const buyunits = await BuyUnits.find().sort({ _id: -1 });
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: buyunits
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getContactOption = async (req, reply) => {
    try {
        const ContactOptions = await ContactOption.find().sort({ _id: -1 });
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: ContactOptions
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getSocialOption = async (req, reply) => {
    try {
        const SocialOptions = await SocialOption.find().sort({ _id: -1 });
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: SocialOptions
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getStaticPage = async (req, reply) => {
    try {
        const staticpages = await StaticPage.find().sort({ _id: -1 });
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: staticpages
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getCity = async (req, reply) => {
    try {
        const cities = await city.find().sort({ _id: -1 });
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: cities
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.getSettings = async (req, reply) => {
    try {
        const settings = await setting.find().sort({ _id: -1 });
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: settings
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}


// cPanel
exports.addSetting = async (req, reply) => {
    try {
        let _setting = new setting({
            name: req.body.name,
            value : req.body.value
        });

        let rs = await _setting.save();
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: rs
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updateSetting = async (req, reply) => {
    try {
        const _setting = await setting.findByIdAndUpdate((req.params.id), {
            name: req.body.name,
            value: req.body.value
        }, { new: true })

        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: _setting
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.addCity = async (req, reply) => {
    try {
        let _city = new city({
            name: req.body.name
        });

        let rs = await _city.save();
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: rs
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updateCity = async (req, reply) => {
    try {
        const _city = await city.findByIdAndUpdate((req.params.id), {
            name: req.body.name
        }, { new: true })

        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: _city
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.deleteCity = async (req, reply) => {
    try {
        const _city = await city.findByIdAndRemove(req.params.id);

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


exports.addSocial = async (req, reply) => {
    try {
        let SocialOptions = new SocialOption({
            name: req.body.name,
            data: req.body.data
        });

        let rs = await SocialOptions.save();
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: rs
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updateSocial = async (req, reply) => {
    try {
        const SocialOptions = await SocialOption.findByIdAndUpdate((req.params.id), {
            name: req.body.name, data: req.body.data
        }, { new: true })

        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: SocialOptions
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.deleteSocial = async (req, reply) => {
    try {
        const SocialOptions = await SocialOption.findByIdAndRemove(req.params.id);

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

exports.getSingleStatic = async (req, reply) => {
    try {
        const StaticPages = await StaticPage.findById(req.params.id);
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: StaticPages
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.addStatic = async (req, reply) => {
    try {
        let staticpages = new StaticPage({
            title: req.body.title,
            content: req.body.content
        });

        let rs = await staticpages.save();
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: rs
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updateStatic = async (req, reply) => {
    try {
        const staticpages = await StaticPage.findByIdAndUpdate((req.params.id), {
            title: req.body.title, content: req.body.content
        }, { new: true })
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: staticpages
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.deleteStatic = async (req, reply) => {
    try {
        const staticpages = await StaticPage.findByIdAndRemove(req.params.id);

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

exports.getSingleContact = async (req, reply) => {
    try {
        const ContactOptions = await ContactOption.find().sort({ _id: -1 });
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: ContactOptions
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.addContact = async (req, reply) => {
    try {
        let ContactOptions = new ContactOption({
            name: req.body.name,
            data: req.body.data
        });


        let rs = await ContactOptions.save();
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: rs
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.updateContact = async (req, reply) => {
    try {
        const ContactOptions = await ContactOption.findByIdAndUpdate((req.params.id), {
            name: req.body.name, data: req.body.data
        }, { new: true })
        const response = {
            status_code: 200,
            status: true,
            message: 'return succssfully',
            items: ContactOptions
        }
        return response
    } catch (err) {
        throw boom.boomify(err)
    }
}

exports.deleteContact = async (req, reply) => {
    try {
        const ContactOptions = await ContactOption.findByIdAndRemove(req.params.id);
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
