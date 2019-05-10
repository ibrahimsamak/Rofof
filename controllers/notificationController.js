const boom = require('boom')

// Get Data Models
const { Notifications } = require('../models/Notifications')

// Get all notfications
exports.getNotfications = async (req, reply) => {
  try {
    const user_id = req.user._id
    const _Notification = await Notifications.find({ $and: [{ user_id: user_id }, { isRead: false }] })
      .sort({ _id: -1 })
    const response = {
      status_code: 200,
      status: true,
      message: 'return succssfully',
      items: _Notification
    }
    return response
  } catch (err) {
    throw boom.boomify(err)
  }
}

//read notifications
exports.readNotifications = async (req, reply) => {
  try {
    const _Notification = await Notifications.findByIdAndUpdate((req.params.id), {
      isRead: true
    }, { new: true })

    const response = {
      status_code: 200,
      status: true,
      message: 'تم تعديل حالة التنبيه بنجاح',
      items: _Notification
    }
    return response
  } catch (err) {
    throw boom.boomify(err)
  }
}
