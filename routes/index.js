// Import our Controllers
const userController = require('../controllers/userController')
const notificationController = require('../controllers/notificationController')
const constantController = require('../controllers/constantController')
const auth = require('../controllers/auth')
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')
const reportController = require('../controllers/reportController')
const companyController = require('../controllers/companyController')
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
    url: '/api/delivery_time',
    handler: constantController.adddelivery_time
  },
  {
    method: 'PUT',
    url: '/api/delivery_time/:id',
    handler: constantController.updatedelivery_time
  },
  {
    method: 'DELETE',
    url: '/api/delivery_time/:id',
    handler: constantController.deletedelivery_time
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
    url: '/api/delivery_time',
    handler: constantController.getdelivery_time
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
    method: 'PUT',
    url: '/api/updateOrderByAdmin/:id',
    handler: orderController.updateOrderByAdmin
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
    method: 'POST',
    url: '/api/checkAvailableDrivers',
    handler: orderController.checkAvailableDrivers
  },
  {
    method: 'GET',
    url: '/api/getOrders',
    handler: orderController.getOrders
  },
  {
    method: 'GET',
    url: '/api/getTunckOrders',
    handler: orderController.getTunckOrders
  },
  {
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
    method: 'POST',
    url: '/api/updateStatus',
    beforeHandler: [auth.getToken],
    handler: driverController.updateStatus
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
  },
  {
    method: 'GET',
    url: '/api/getDailyRevenu',
    handler: reportController.getDailyRevenu
  },
  {
    method: 'GET',
    url: '/api/getProductsCount',
    handler: reportController.getProductsCount
  },
  {
    method: 'GET',
    url: '/api/getTop3Category',
    handler: reportController.getTop3Category
  },
  {
    method: 'GET',
    url: '/api/getTop5Suppliers',
    handler: reportController.getTop5Suppliers
  },
  {
    method: 'GET',
    url: '/api/getTop10Cities',
    handler: reportController.getTop10Cities
  },
  {
    method: 'GET',
    url: '/api/importantCounters',
    handler: reportController.importantCounters
  },
  {
    method: 'GET',
    url: '/api/top15NewUsers',
    handler: reportController.top15NewUsers
  },
  {
    method: 'GET',
    url: '/api/UsersPerYear',
    handler: reportController.UsersPerYear
  },
  {
    method: 'GET',
    url: '/api/getTop5RegisterCities',
    handler: reportController.getTop5RegisterCities
  },
  {
    method: 'GET',
    url: '/api/revenuPerYear',
    handler: reportController.revenuPerYear
  },
  {
    method: 'GET',
    url: '/api/SupplierPerYear',
    handler: reportController.SupplierPerYear
  },
  {
    method: 'POST',
    url: '/api/rpt_getOrderswithstatus',
    handler: reportController.rpt_getOrderswithstatus
  },
  {
    method: 'POST',
    url: '/api/rpt_getRevenu',
    handler: reportController.rpt_getRevenu
  },
  {
    method: 'POST',
    url: '/api/rpt_getOrderMaps',
    handler: reportController.rpt_getOrderMaps
  },


  {
    method: 'POST',
    url: '/api/company/rpt_getOrderswithstatus',
    handler: companyController.rpt_getOrderswithstatus
  }, {
    method: 'POST',
    url: '/api/company/rpt_getRevenu',
    handler: companyController.rpt_getRevenu
  },
  {
    method: 'POST',
    url: '/api/company/rpt_getOrderMaps',
    handler: companyController.rpt_getOrderMaps
  }, 

  {
    method: 'POST',
    url: '/api/company/addDriver/:id',
    handler: companyController.addDrivers
  }, 
  {
    method: 'POST',
    url: '/api/company/Driversearch/:id',
    handler: companyController.Driversearch
  }, 
  {
    method: 'GET',
    url: '/api/company/DriverList/:id',
    handler: companyController.Driverlist
  }, {
    method: 'GET',
    url: '/api/company/userlistInfo/:id',
    handler: companyController.userlistInfo
  }, {
    method: 'PUT',
    url: '/api/company/block',
    handler: companyController.block
  }, {
    method: 'GET',
    url: '/api/company/userprofile/:id',
    handler: companyController.userprofile
  }, 
  {
    method: 'PUT',
    url: '/api/company/updateprofileFromAdmin/:id',
    handler: companyController.updateprofileFromAdmin
  }, {
    method: 'POST',
    url: '/api/company/uploadDriverPhoto',
    handler: companyController.uploadDriverPhoto
  }, 
  {
    method: 'GET',
    url: '/api/company/DriverProfile/:id',
    handler: driverController.userprofile
  },
  
  {
    method: 'GET',
    url: '/api/company/getDailyRevenu/:id',
    handler: companyController.getDailyRevenu
  }, {
    method: 'GET',
    url: '/api/company/getProductsCount/:id',
    handler: companyController.getProductsCount
  }, {
    method: 'GET',
    url: '/api/company/getTop3Category/:id',
    handler: companyController.getTop3Category
  }, {
    method: 'GET',
    url: '/api/company/getTop5Suppliers',
    handler: companyController.getTop5Suppliers
  }, {
    method: 'GET',
    url: '/api/company/getTop10Cities',
    handler: companyController.getTop10Cities
  }, {
    method: 'GET',
    url: '/api/company/importantCounters',
    handler: companyController.importantCounters
  }, {
    method: 'GET',
    url: '/api/company/top15NewUsers',
    handler: companyController.top15NewUsers
  }, {
    method: 'GET',
    url: '/api/company/UsersPerYear',
    handler: companyController.UsersPerYear
  }, 
  {
    method: 'GET',
    url: '/api/company/getTop5RegisterCities',
    handler: companyController.getTop5RegisterCities
  },
  {
    method: 'GET',
    url: '/api/company/revenuPerYear/:id',
    handler: companyController.revenuPerYear
  },
  {
    method: 'GET',
    url: '/api/company/SupplierPerYear/:id',
    handler: companyController.SupplierPerYear
  },

  {
    method: 'GET',
    url: '/api/company/getOrders/:id',
    handler: companyController.getOrders
  },
  {
    method: 'GET',
    url: '/api/company/getOrdersSeacrh/:id',
    handler: companyController.getOrdersSeacrh
  },
  {
    method: 'GET',
    url: '/api/company/getRatedOrders',
    handler: companyController.getRatedOrders
  },
  {
    method: 'GET',
    url: '/api/company/getNewOrder',
    handler: companyController.getNewOrder
  },
  {
    method: 'GET',
    url: '/api/company/getNewRatedOrder',
    handler: companyController.getNewRatedOrder
  },
  {
    method: 'PUT',
    url: '/api/company/updateRate/:id',
    handler: companyController.updateRate
  },
  {
    method: 'GET',
    url: '/api/company/getSupplierPoint/:id',
    handler: companyController.getSupplierPoint
  },
  {
    method: 'GET',
    url: '/api/company/getSinglePoint/:id',
    handler: companyController.getSinglePoint
  },
  {
    method: 'PUT',
    url: '/api/company/updatePoint/:id',
    handler: companyController.updatePoint
  },
  {
    method: 'DELETE',
    url: '/api/company/deletePoint',
    handler: companyController.deletePoint
  },
  {
    method: 'POST',
    url: '/api/company/loginAdmin',
    handler: companyController.login
  },
  {
    method: 'POST',
    url: '/api/company/refreshtokenAdmin',
    handler: companyController.refreshToken
  },
  {
    method: 'POST',
    url: '/api/company/changepassword',
    handler: companyController.changePassword
  },
  {
    method: 'POST',
    url: '/api/company/upload_file',
    handler: productController.uploadPhoto
  },
  {
    method: 'POST',
    url: '/api/company/addPoint',
    handler: pointController.addPoint
  },
  {
    method: 'GET',
    url: '/api/company/getOrderDetails',
    handler: orderController.getOrderDetails
  },
]

module.exports = routes
