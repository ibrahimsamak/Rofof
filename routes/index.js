// Import our Controllers
const userController = require('../controllers/userController')
const notificationController = require('../controllers/notificationController')
const constantController = require('../controllers/constantController')
const auth = require('../controllers/auth')
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')
const adminController = require('../controllers/adminController')
const driverController = require('../controllers/driverController')
const pointController = require('../controllers/pointController')
const fastify = require('fastify')({
  logger: true
})
// Import Swagger documentation
// const documentation = require('./documentation/carApi')


const routes = [
  {
    method: 'GET',
    url: '/api/product/:id',
    handler: productController.getSingleProduct
  },
  {
    method: 'DELETE',
    url: '/api/product/:id',
    handler: productController.deleteProduct
  },
  {
    method: 'PUT',
    url: '/api/product/:id',
    handler: productController.updateProduct
  },
  {
    method: 'POST',
    url: '/api/product',
    handler: productController.addProduct
  },
  {
    method: 'GET',
    url: '/api/productbysubcategoryid',
    handler: productController.productbysubcategoryid
  },
  {
    method: 'POST',
    url: '/api/productSearch',
    handler: productController.productSearch
  },
  {
    method: 'GET',
    url: '/api/product',
    handler: productController.getAllProducts
  },
  {
    method: 'POST',
    url: '/api/upload_file',
    handler: productController.uploadPhoto
  },
  {
    method: 'GET',
    url: '/api/admin',
    handler: adminController.getAdmins
  },
  {
    method: 'GET',
    url: '/api/admin/:id',
    handler: adminController.getSingleAdmin
  },
  {
    method: 'POST',
    url: '/api/admin',
    handler: adminController.addAdmin
  },
  {
    method: 'PUT',
    url: '/api/admin/:id',
    handler: adminController.updateAdmin
  },
  {
    method: 'DELETE',
    url: '/api/admin/:id',
    handler: adminController.deleteAdmin
  },
  {
    method: 'POST',
    url: '/api/loginAdmin',
    handler: adminController.login
  },
  {
    method: 'POST',
    url: '/api/refreshtokenAdmin',
    handler: adminController.refreshToken
  },
  {
    method: 'GET',
    url: '/api/supplier',
    handler: productController.getSupplier
  },
  {
    method: 'GET',
    url: '/api/supplier/:id',
    handler: productController.getSingleSupplier
  },
  {
    method: 'POST',
    url: '/api/supplier',
    handler: productController.addSupplier
  },
  {
    method: 'PUT',
    url: '/api/supplier/:id',
    handler: productController.updateSupplier
  },
  {
    method: 'DELETE',
    url: '/api/supplier/:id',
    handler: productController.deleteSupplier
  },

  {
    method: 'GET',
    url: '/api/category/:id',
    handler: productController.getSingleCategory
  },
  {
    method: 'POST',
    url: '/api/category',
    handler: productController.addCategory
  },
  {
    method: 'PUT',
    url: '/api/category/:id',
    handler: productController.updateCategory
  },
  {
    method: 'DELETE',
    url: '/api/category/:id',
    handler: productController.deleteCategory
  },
  {
    method: 'POST',
    url: '/api/settings',
    handler: constantController.addSetting
  },
  {
    method: 'PUT',
    url: '/api/settings/:id',
    handler: constantController.updateSetting
  },
  {
    method: 'POST',
    url: '/api/DeliveryOption',
    handler: constantController.addCity
  },
  {
    method: 'PUT',
    url: '/api/DeliveryOption/:id',
    handler: constantController.updateCity
  },
  {
    method: 'DELETE',
    url: '/api/DeliveryOption/:id',
    handler: constantController.deleteCity
  },
  {
    method: 'GET',
    url: '/api/SocialOption/:id',
    handler: constantController.getSocialOption
  },
  {
    method: 'POST',
    url: '/api/SocialOption',
    handler: constantController.addSocial
  },
  {
    method: 'PUT',
    url: '/api/SocialOption/:id',
    handler: constantController.updateSocial
  },
  {
    method: 'DELETE',
    url: '/api/SocialOption/:id',
    handler: constantController.deleteSocial
  },
  {
    method: 'GET',
    url: '/api/ContactOption/:id',
    handler: constantController.getContactOption
  },
  {
    method: 'POST',
    url: '/api/ContactOption',
    handler: constantController.addContact
  },
  {
    method: 'PUT',
    url: '/api/ContactOption/:id',
    handler: constantController.updateContact
  },
  {
    method: 'DELETE',
    url: '/api/ContactOption/:id',
    handler: constantController.deleteContact
  },
  {
    method: 'GET',
    url: '/api/staticpage/:id',
    handler: constantController.getSingleStatic
  },
  {
    method: 'POST',
    url: '/api/staticpage',
    handler: constantController.addStatic
  },
  {
    method: 'PUT',
    url: '/api/staticpage/:id',
    handler: constantController.updateStatic
  },
  {
    method: 'DELETE',
    url: '/api/staticpage/:id',
    handler: constantController.deleteStatic
  },
  {
    method: 'GET',
    url: '/api/category',
    handler: productController.getCategories
  },
  {
    method: 'POST',
    url: '/api/search',
    handler: productController.getProductBySearch
  },
  {
    method: 'GET',
    url: '/api/getSingleProduct/:id',
    handler: productController.getSingleProductClient
  },
  {
    method: 'POST',
    url: '/api/productscategory',
    handler: productController.getProductCateroy
  },
  {
    method: 'GET',
    url: '/api/top20prodcuts',
    handler: productController.getProducts
  },
  {
    method: 'GET',
    url: '/api/settings',
    handler: constantController.getSettings
  },
  {
    method: 'GET',
    url: '/api/city',
    handler: constantController.getCity
  },
  {
    method: 'GET',
    url: '/api/social',
    handler: constantController.getSocialOption
  },
  {
    method: 'GET',
    url: '/api/buyunits',
    handler: constantController.getBuyUnits
  },
  {
    method: 'GET',
    url: '/api/Contact',
    handler: constantController.getContactOption
  },
  {
    method: 'GET',
    url: '/api/getStaticPage',
    handler: constantController.getStaticPage
  },
  {
    method: 'GET',
    url: '/api/users',
    handler: userController.getUsers
  },
  {
    method: 'GET',
    url: '/api/showprofile',
    beforeHandler: [auth.getToken],
    handler: userController.getSingleUsers
  },
  {
    method: 'POST',
    url: '/api/users',
    handler: userController.addUsers
  },
  {
    method: 'POST',
    url: '/api/userrefreshToken',
    beforeHandler: [auth.getToken],
    handler: userController.refreshToken
  },
  {
    method: 'POST',
    url: '/api/login',
    handler: userController.login
  },
  {
    method: 'POST',
    url: '/api/forgetPassword',
    beforeHandler: [auth.getToken],
    handler: userController.forgetPassword
  },
  {
    method: 'POST',
    url: '/api/changePassword',
    beforeHandler: [auth.getToken],
    handler: userController.changePassword
  },
  {
    method: 'POST',
    url: '/api/logout',
    beforeHandler: [auth.getToken],
    handler: userController.logout
  },

  {
    method: 'PUT',
    url: '/api/updateprofile',
    beforeHandler: [auth.getToken],
    handler: userController.updateUsers
  },
  {
    method: 'PUT',
    url: '/api/verfiy',
    handler: userController.verfiy
  },
  {
    method: 'GET',
    url: '/api/notifications',
    beforeHandler: [auth.getToken],
    handler: notificationController.getNotfications
  },
  {
    method: 'POST',
    url: '/api/notifications/:id',
    beforeHandler: [auth.getToken],
    handler: notificationController.readNotifications
  },
  {
    method: 'POST',
    url: '/api/userSearch',
    handler: userController.userSearch
  },
  {
    method: 'GET',
    url: '/api/userslist',
    handler: userController.userslist
  },
  {
    method: 'GET',
    url: '/api/userlistInfo',
    handler: userController.userlistInfo
  },
  {
    method: 'PUT',
    url: '/api/block/:id',
    handler: userController.block
  },
  {
    method: 'GET',
    url: '/api/userprofile/:id',
    handler: userController.userprofile
  },
  {
    method: 'POST',
    url: '/api/order',
    beforeHandler: [auth.getToken],
    handler: orderController.addOrder
  },
  {
    method: 'POST',
    url: '/api/updateOrderByDriver',
    beforeHandler: [auth.getToken],
    handler: orderController.updateOrderByDriver
  },
  {
    method: 'POST',
    url: '/api/updateOrderByUser',
    beforeHandler: [auth.getToken],
    handler: orderController.updateOrderByUser
  },
  {
    method: 'POST',
    url: '/api/addRate',
    beforeHandler: [auth.getToken],
    handler: orderController.addRate
  },
  {
    method: 'GET',
    url: '/api/getUserOrder',
    handler: orderController.getUserOrder
  },
  {
    method: 'GET',
    url: '/api/getDriverOrder',
    handler: orderController.getDriverOrder
  },
  {
    method: 'GET',
    url: '/api/getOrderDetails',
    handler: orderController.getOrderDetails
  },
  {
    method: 'GET',
    url: '/api/checkAvailableDrivers',
    handler: orderController.checkAvailableDrivers
  },
  {
    method: 'GET',
    url: '/api/getOrders',
    handler: orderController.getOrders
  }, {
    method: 'POST',
    url: '/api/getOrdersSeacrh',
    handler: orderController.getOrdersSeacrh
  }, {
    method: 'GET',
    url: '/api/getRatedOrders',
    handler: orderController.getRatedOrders
  },
  {
    method: 'GET',
    url: '/api/getNewOrder',
    handler: orderController.getNewOrder
  },
  {
    method: 'GET',
    url: '/api/getNewRatedOrder',
    handler: orderController.getNewRatedOrder
  }, {
    method: 'PUT',
    url: '/api/updateRate/:id',
    handler: orderController.updateRate
  },
  {
    method: 'POST',
    url: '/api/addDriver',
    handler: driverController.addDrivers
  },
  {
    method: 'PUT',
    url: '/api/blockDriver/:id',
    handler: driverController.block
  },
  {
    method: 'GET',
    url: '/api/DriverList',
    handler: driverController.Driverlist
  },
  {
    method: 'POST',
    url: '/api/loginDriver',
    handler: driverController.login
  },
  {
    method: 'POST',
    url: '/api/logoutDriver',
    beforeHandler: [auth.getToken],
    handler: driverController.logout
  },
  {
    method: 'PUT',
    url: '/api/refreshtokenDriver',
    beforeHandler: [auth.getToken],
    handler: driverController.refreshTokenDriver
  },
  {
    method: 'GET',
    url: '/api/DriverProfile/:id',
    handler: driverController.userprofile
  },
  {
    method: 'PUT',
    url: '/api/updateprofile/:id',
    beforeHandler: [auth.getToken],
    handler: driverController.updateDrivers
  },
  {
    method: 'PUT',
    url: '/api/updateprofileFromAdmin/:id',
    handler: driverController.updateprofileFromAdmin
  },
  {
    method: 'POST',
    url: '/api/uploadDriverPhoto',
    handler: driverController.uploadDriverPhoto
  },
  {
    method: 'POST',
    url: '/api/addPoint',
    handler: pointController.addPoint
  },
  {
    method: 'PUT',
    url: '/api/updatePoint/:id',
    handler: pointController.updatePoint
  },
  {
    method: 'DELETE',
    url: '/api/deletePoint/:id',
    handler: pointController.deletePoint
  },
  {
    method: 'GET',
    url: '/api/getSupplierPoint/:id',
    handler: pointController.getSupplierPoint
  },
  {
    method: 'GET',
    url: '/api/getSinglePoint/:id',
    handler: pointController.getSinglePoint
  },
  {
    method: 'GET',
    url: '/api/UserPointById/:id',
    handler: pointController.UserPointById
  },
  {
    method: 'GET',
    url: '/api/updateUserPoint/:id',
    beforeHandler: [auth.getToken],
    handler: pointController.updateUserPoint
  },
  {
    method: 'GET',
    url: '/api/test',
    beforeHandler: [auth.getToken],
    handler: orderController.testGeoFire
  }
]

module.exports = routes
