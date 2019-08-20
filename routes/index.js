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
const advController = require('../controllers/advController')
const couponController = require('../controllers/couponController')

const fastify = require('fastify')({
  logger: true
})
// Import Swagger documentation
// const documentation = require('./documentation/carApi')


const routes = [
  
  {
    method: 'GET',
    url: '/api/updateeee',
    handler: orderController.updateeee
  },
  //#region Coupon
  {
    method: 'GET',
    url: '/api/coupon/coupon',
    handler: couponController.getcoupon
  },
  {
    method: 'GET',
    url: '/api/coupon/coupon/:id',
    handler: couponController.getSinglecoupon
  },
  {
    method: 'POST',
    url: '/api/coupon/coupon',
    handler: couponController.addcoupon
  },
  {
    method: 'POST',
    url: '/api/coupon/checkCoupon',
    beforeHandler: [auth.getToken],
    handler: couponController.checkCoupon
  },
  {
    method: 'PUT',
    url: '/api/coupon/coupon/:id',
    handler: couponController.updatecoupon
  },
  {
    method: 'POST',
    url: '/api/coupon/coupon/:id',
    handler: couponController.deletecoupon
  },
  //#endregion


  //#region Advs 
  {
    method: 'GET',
    url: '/api/adv/adv',
    handler: advController.getAdv
  },
  {
    method: 'GET',
    url: '/api/adv/adv/:id',
    handler: advController.getSingleAdv
  },
  {
    method: 'POST',
    url: '/api/adv/adv',
    handler: advController.addAdv
  },
  {
    method: 'PUT',
    url: '/api/adv/adv/:id',
    handler: advController.updateAdv
  },
  {
    method: 'POST',
    url: '/api/adv/adv/:id',
    handler: advController.deleteAdv
  },
  //#endregion

  {
    method: 'GET',
    url: '/DailyOrders',
    handler: orderController.DailyOrders
  },
  {
    method: 'GET',
    url: '/api/product/:id',
    handler: productController.getSingleProduct
  },
  {
    method: 'POST',
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
    url: '/api/products/:id',
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
    method: 'POST',
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
    method: 'POST',
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
    method: 'POST',
    url: '/api/category/:id',
    handler: productController.deleteCategory
  },
  {
    method: 'GET',
    url: '/api/getUpdates',
    handler: constantController.getUpdates
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
    method: 'POST',
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
    method: 'POST',
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
    method: 'POST',
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
    method: 'POST',
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
    method: 'POST',
    url: '/api/staticpage/:id',
    handler: constantController.deleteStatic
  },
  {
    method: 'GET',
    url: '/api/getCategoriesAdmin',
    handler: productController.getCategoriesAdmin
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
    url: '/api/settings/:id',
    handler: constantController.getSettings
  },
  {
    method: 'GET',
    url: '/api/delivery_time/:id',
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
    url: '/api/getUserByCity/:id',
    handler: userController.getUserByCity
  },
  {
    method: 'POST',
    url: '/api/uploadUserPhoto',
    handler: userController.uploadUserPhoto
  },
  {
    method: 'GET',
    url: '/api/getAllUsers',
    handler: userController.getAllUsers
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
    url: '/api/updateUserAndroid',
    beforeHandler: [auth.getToken],
    handler: userController.updateUserAndroid
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
    method: 'GET',
    url: '/api/updateNotifications/:id',
    handler: notificationController.updateNotifications
  },
  {
    method: 'POST',
    url: '/api/notifications/:id',
    // beforeHandler: [auth.getToken],
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
    url: '/api/addOrderDriver/:id',
    handler: orderController.addOrderDriver
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
    method: 'POST',
    url: '/api/checkAvailableSupplier',
    handler: orderController.checkAvailableSupplier
  },  
  {
    method: 'GET',
    url: '/api/getOrders/:id',
    handler: orderController.getOrders
  },
  {
    method: 'GET',
    url: '/api/getTunckOrders',
    handler: orderController.getTunckOrders
  },
  {
    method: 'POST',
    url: '/api/getOrdersSeacrh/:id',
    handler: orderController.getOrdersSeacrh
  }, {
    method: 'GET',
    url: '/api/getRatedOrders/:id',
    handler: orderController.getRatedOrders
  },
  {
    method: 'GET',
    url: '/api/getNewOrder/:id',
    handler: orderController.getNewOrder
  },
  {
    method: 'GET',
    url: '/api/getNewRatedOrder/:id',
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
    url: '/api/DriverList/:id',
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
    method: 'POST',
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
    url: '/api/getDailyRevenu/:id',
    handler: reportController.getDailyRevenu
  },
  {
    method: 'GET',
    url: '/api/getProductsCount/:id',
    handler: reportController.getProductsCount
  },
  {
    method: 'GET',
    url: '/api/getTop3Category/:id',
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
    url: '/api/importantCounters/:id',
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
    url: '/api/revenuPerYear/:id',
    handler: reportController.revenuPerYear
  },
  {
    method: 'GET',
    url: '/api/SupplierPerYear/:id',
    handler: reportController.SupplierPerYear
  },
  
  {
    method: 'POST',
    url: '/api/addCompanyCommission',
    handler: reportController.addCompanyCommission
  },
  {
    method: 'GET',
    url: '/api/rpt_getCompanyCommission',
    handler: reportController.rpt_getCompanyCommission
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
    method: 'GET',
    url: '/api/company/settings/:id',
    handler: constantController.getSettings
  },
  {
    method: 'GET',
    url: '/api/company/delivery_time/:id',
    handler: constantController.getdelivery_time
  },
  {
    method: 'POST',
    url: '/api/company/rpt_getOrderswithstatus',
    handler: companyController.rpt_getOrderswithstatus
  },
  {
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
    url: '/api/company/blockDriver/:id',
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
  },
  {
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
    method: 'POST',
    url: '/api/company/getOrdersSeacrh/:id',
    handler: companyController.getOrdersSeacrh
  },
  {
    method: 'GET',
    url: '/api/company/getRatedOrders/:id',
    handler: companyController.getRatedOrders
  },
  {
    method: 'GET',
    url: '/api/company/getNewOrder/:id',
    handler: companyController.getNewOrder
  },
  {
    method: 'GET',
    url: '/api/company/getNewRatedOrder/:id',
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
    method: 'POST',
    url: '/api/company/deletePoint/:id',
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
  {
    method: 'POST',
    url: '/api/company/settings',
    handler: constantController.addSetting
  },
  {
    method: 'PUT',
    url: '/api/company/settings/:id',
    handler: constantController.updateSetting
  },
  {
    method: 'POST',
    url: '/api/company/delivery_time',
    handler: constantController.adddelivery_time
  },
  {
    method: 'PUT',
    url: '/api/company/delivery_time/:id',
    handler: constantController.updatedelivery_time
  },
  {
    method: 'POST',
    url: '/api/company/delivery_time/:id',
    handler: constantController.deletedelivery_time
  },
  {
    method: 'GET',
    url: '/api/company/getCategoriesAdmin',
    handler: productController.getCategoriesAdmin
  },

  {
    method: 'GET',
    url: '/api/company/product/:id',
    handler: productController.getSingleProduct
  },
  {
    method: 'POST',
    url: '/api/company/product/:id',
    handler: productController.deleteProduct
  },
  {
    method: 'PUT',
    url: '/api/company/product/:id',
    handler: productController.updateProduct
  },
  {
    method: 'POST',
    url: '/api/company/product',
    handler: productController.addProduct
  },
  {
    method: 'GET',
    url: '/api/company/productbysubcategoryid',
    handler: productController.productbysubcategoryid
  },
  {
    method: 'POST',
    url: '/api/company/productSearch',
    handler: productController.productSearch
  },
  {
    method: 'GET',
    url: '/api/company/products/:id',
    handler: productController.getAllProducts
  },
  {
    method: 'GET',
    url: '/api/company/getDailyRevenu/:id',
    handler: companyController.getDailyRevenu
  },
  {
    method: 'GET',
    url: '/api/company/importantCounters/:id',
    handler: reportController.importantCounters
  },
  {
    method: 'PUT',
    url: '/api/company/updateOrderByAdmin/:id',
    handler: orderController.updateOrderByAdmin
  },
  {
    method: 'PUT',
    url: '/api/company/addOrderDriver/:id',
    handler: orderController.addOrderDriver
  },
]

module.exports = routes
