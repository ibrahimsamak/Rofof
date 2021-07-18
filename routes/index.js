// Import our Controllers
const auth = require("../controllers/auth");
const userController = require("../controllers/userController");
const notificationController = require("../controllers/notificationController");
const constantController = require("../controllers/constantController");
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");
const reportController = require("../controllers/reportController");
const adminController = require("../controllers/adminController");
const renterController = require("../controllers/renterController");
const advController = require("../controllers/advController");
const couponController = require("../controllers/couponController");
const favoriteController = require("../controllers/favoriteController");
const rackController = require("../controllers/rackController");

const fastify = require("fastify")({
  logger: false,
});

// Import Swagger documentation
// const documentation = require('./documentation/carApi')

const routes = [
  {
    method: "GET",
    url: "/api/getPaymnetLog",
    handler: orderController.getPaymnetLog,
  },
  {
    method: "POST",
    url: "/api/updatePayment/:id",
    beforeHandler: [auth.getToken],
    handler: orderController.updatePayment,
  },
  {
    method: "POST",
    url: "/api/addPayment",
    beforeHandler: [auth.getToken],
    handler: orderController.addPayment,
  },
  
  {
    method: "GET",
    url: "/api/rackList",
    handler: rackController.rackList,
  },
  {
    method: "GET",
    url: "/api/rackListNotReserved",
    handler: rackController.rackListNotReserved,
  },
  {
    method: "GET",
    url: "/api/getRackListNotReservedAndMyRacks/:id",
    handler: rackController.getRackListNotReservedAndMyRacks,
  },
  {
    method: "GET",
    url: "/api/reserve/:id",
    handler: rackController.getReserveRack,
  },
  {
    method: "GET",
    url: "/api/getReserveRackById/:id",
    handler: rackController.getReserveRackById,
  },
  {
    method: "POST",
    url: "/api/reserve",
    beforeHandler: [auth.getToken],
    handler: rackController.addReserveRack,
  },
  {
    method: "POST",
    url: "/api/renew",
    beforeHandler: [auth.getToken],
    handler: rackController.renewReservRack,
  },

  {
    method: "POST",
    url: "/api/reserve/:id",
    beforeHandler: [auth.getToken],
    handler: rackController.updateReserveRack,
  },
  {
    method: "POST",
    url: "/api/deletereserve/:id",
    beforeHandler: [auth.getToken],
    handler: rackController.deleteReserveRack,
  },
  {
    method: "GET",
    url: "/api/rack",
    handler: rackController.getrack,
  },
  {
    method: "GET",
    url: "/api/rack/:id",
    handler: rackController.getSinglerack,
  },
  {
    method: "POST",
    url: "/api/rack",
    beforeHandler: [auth.getToken],

    handler: rackController.addrack,
  },
  {
    method: "POST",
    url: "/api/rack/:id",
    handler: rackController.updaterack,
  },
  {
    method: "POST",
    url: "/api/deleterack/:id",
    beforeHandler: [auth.getToken],

    handler: rackController.deleterack,
  },
  {
    method: "POST",
    url: "/api/getRackReserveAboutToFinish",
    handler: rackController.getRackReserveAboutToFinish,
  },
  {
    method: "POST",
    url: "/api/getRackReserveAboutToFinishExcel",
    beforeHandler: [auth.getToken],
    handler: rackController.getRackReserveAboutToFinishExcel,
  },
  {
    method: "GET",
    url: "/api/Favorite/:id",
    handler: favoriteController.getFav,
  },
  {
    method: "POST",
    url: "/api/deleteFav/:id",
    beforeHandler: [auth.getToken],
    handler: favoriteController.deleteFav,
  },
  {
    method: "POST",
    url: "/api/addFav",
    beforeHandler: [auth.getToken],
    handler: favoriteController.addFav,
  },
  //#region Coupon
  {
    method: "GET",
    url: "/api/coupon",
    handler: couponController.getcoupon,
  },
  {
    method: "GET",
    url: "/api/getcoupon/:id",
    handler: couponController.getSinglecoupon,
  },
  {
    method: "POST",
    url: "/api/addcoupon",
    beforeHandler: [auth.getToken],
    handler: couponController.addcoupon,
  },
  {
    method: "POST",
    url: "/api/checkCoupon",
    beforeHandler: [auth.getToken],
    handler: couponController.checkCoupon,
  },
  {
    method: "POST",
    url: "/api/updatecoupon/:id",
    beforeHandler: [auth.getToken],
    handler: couponController.updatecoupon,
  },
  {
    method: "POST",
    url: "/api/deletecoupon/:id",
    beforeHandler: [auth.getToken],
    handler: couponController.deletecoupon,
  },
  //#endregion

  //#region Advs
  {
    method: "GET",
    url: "/api/getAdvs",
    handler: advController.getAdv,
  },
  {
    method: "GET",
    url: "/api/getadv/:id",
    handler: advController.getSingleAdv,
  },
  {
    method: "POST",
    url: "/api/addadv",
    beforeHandler: [auth.getToken],
    handler: advController.addAdv,
  },
  {
    method: "POST",
    url: "/api/updateadv/:id",
    beforeHandler: [auth.getToken],
    handler: advController.updateAdv,
  },
  {
    method: "POST",
    url: "/api/deleteadv/:id",
    beforeHandler: [auth.getToken],
    handler: advController.deleteAdv,
  },
  //#endregion
  {
    method: "GET",
    url: "/DailyOrders",
    handler: orderController.DailyOrders,
  },

  {
    method: "POST",
    url: "/api/addproduct",
    beforeHandler: [auth.getToken],
    handler: productController.addProduct,
  },
  {
    method: "POST",
    url: "/api/upload_file",
    beforeHandler: [auth.getToken],
    handler: productController.uploadPhoto,
  },
  {
    method: "GET",
    url: "/api/admin",
    handler: adminController.getAdmins,
  },
  {
    method: "GET",
    url: "/api/admin/:id",
    handler: adminController.getSingleAdmin,
  },
  {
    method: "POST",
    url: "/api/admin",
    beforeHandler: [auth.getToken],
    handler: adminController.addAdmin,
  },
  {
    method: "POST",
    url: "/api/admin/:id",
    beforeHandler: [auth.getToken],
    handler: adminController.updateAdmin,
  },
  {
    method: "POST",
    url: "/api/deleteadmin/:id",
    beforeHandler: [auth.getToken],
    handler: adminController.deleteAdmin,
  },
  {
    method: "POST",
    url: "/api/loginAdmin",
    handler: adminController.login,
  },
  {
    method: "POST",
    url: "/api/refreshtokenAdmin",
    beforeHandler: [auth.getToken],
    handler: adminController.refreshToken,
  },
  {
    method: "GET",
    url: "/api/getcategory/:id",
    handler: productController.getSingleCategory,
  },
  {
    method: "POST",
    url: "/api/addcategory",
    beforeHandler: [auth.getToken],
    handler: productController.addCategory,
  },
  {
    method: "POST",
    url: "/api/updatecategory/:id",
    beforeHandler: [auth.getToken],
    handler: productController.updateCategory,
  },
  {
    method: "POST",
    url: "/api/deletecategory/:id",
    beforeHandler: [auth.getToken],
    handler: productController.deleteCategory,
  },
  {
    method: "GET",
    url: "/api/getUpdates",
    handler: constantController.getUpdates,
  },
  {
    method: "POST",
    url: "/api/settings",
    beforeHandler: [auth.getToken],
    handler: constantController.addSetting,
  },
  {
    method: "POST",
    url: "/api/settings/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.updateSetting,
  },
  {
    method: "POST",
    url: "/api/adddelivery_time",
    beforeHandler: [auth.getToken],
    handler: constantController.adddelivery_time,
  },
  {
    method: "POST",
    url: "/api/deletedelivery_time/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.deletedelivery_time,
  },
  {
    method: "POST",
    url: "/api/addDeliveryOption",
    beforeHandler: [auth.getToken],
    handler: constantController.addCity,
  },
  {
    method: "POST",
    url: "/api/addcontract",
    beforeHandler: [auth.getToken],
    handler: constantController.addContract,
  },
  {
    method: "POST",
    url: "/api/addInventory",
    beforeHandler: [auth.getToken],
    handler: constantController.addInventory,
  },
  {
    method: "POST",
    url: "/api/addTransport",
    beforeHandler: [auth.getToken],
    handler: constantController.addTransport,
  },
  {
    method: "POST",
    url: "/api/updateDeliveryOption/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.updateCity,
  },
  {
    method: "POST",
    url: "/api/updatecontract/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.updateContract,
  },
  {
    method: "POST",
    url: "/api/updateInventory/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.updateInventory,
  },
  {
    method: "POST",
    url: "/api/updateTransport/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.updateTransport,
  },
  {
    method: "POST",
    url: "/api/deleteDeliveryOption/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.deleteCity,
  },
  {
    method: "POST",
    url: "/api/deleteContract/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.deleteContract,
  },
  {
    method: "POST",
    url: "/api/deleteinventory/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.deleteInventory,
  },
  {
    method: "POST",
    url: "/api/deleteTransport/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.deleteTransport,
  },
  {
    method: "GET",
    url: "/api/getSocialOption/:id",
    handler: constantController.getSocialOption,
  },
  {
    method: "POST",
    url: "/api/addSocialOption",
    beforeHandler: [auth.getToken],
    handler: constantController.addSocial,
  },
  {
    method: "POST",
    url: "/api/updateSocialOption/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.updateSocial,
  },
  {
    method: "POST",
    url: "/api/deleteSocialOption/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.deleteSocial,
  },
  {
    method: "GET",
    url: "/api/getContactOption/:id",
    handler: constantController.getSingleContact,
  },
  {
    method: "POST",
    url: "/api/ContactOption",
    beforeHandler: [auth.getToken],
    handler: constantController.addContact,
  },
  {
    method: "POST",
    url: "/api/updateContactOption/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.updateContact,
  },
  {
    method: "POST",
    url: "/api/deleteContactOption/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.deleteContact,
  },
  {
    method: "GET",
    url: "/api/getstaticpage/:id",
    handler: constantController.getSingleStatic,
  },
  {
    method: "POST",
    url: "/api/staticpage",
    beforeHandler: [auth.getToken],
    handler: constantController.addStatic,
  },
  {
    method: "POST",
    url: "/api/updatestaticpage/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.updateStatic,
  },
  {
    method: "POST",
    url: "/api/addstaticpage/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.deleteStatic,
  },
  {
    method: "GET",
    url: "/api/getCategoriesAdmin",
    handler: productController.getCategoriesAdmin,
  },
  {
    method: "GET",
    url: "/api/category",
    handler: productController.getCategories,
  },
  {
    method: "GET",
    url: "/api/getSingleProduct/:id",
    handler: productController.getSingleProductClient,
  },
  {
    method: "POST",
    url: "/api/getProducts",
    beforeHandler: [auth.getToken],
    handler: productController.getProducts,
  },
  {
    method: "GET",
    url: "/api/getRandomProducts",
    handler: productController.getRandomProducts,
  },
  {
    method: "GET",
    url: "/api/getAllProducts",
    handler: productController.getAllProducts,
  },
  {
    method: "POST",
    url: "/api/getProductsRenters",
    beforeHandler: [auth.getToken],
    handler: productController.getProductsRenters,
  },
  {
    method: "POST",
    url: "/api/getProductsForRenter",
    beforeHandler: [auth.getToken],
    handler: productController.getProductsForRenter,
  },
  {
    method: "POST",
    url: "/api/getProductsForRenterById",
    beforeHandler: [auth.getToken],
    handler: productController.getProductsForRenterById,
  },
  {
    method: "GET",
    url: "/api/settings/:id",
    handler: constantController.getSingleSettings,
  },
  {
    method: "GET",
    url: "/api/city",
    handler: constantController.getCity,
  },
  {
    method: "GET",
    url: "/api/contract",
    handler: constantController.getContract,
  },
  {
    method: "GET",
    url: "/api/inventory",
    handler: constantController.getInventory,
  },
  {
    method: "GET",
    url: "/api/getTransport",
    handler: constantController.getTransport,
  },
  {
    method: "GET",
    url: "/api/getSingleCity/:id",
    handler: constantController.getSingleCity,
  },
  {
    method: "GET",
    url: "/api/getContractDetails/:id",
    handler: constantController.getContractDetails,
  },
  {
    method: "GET",
    url: "/api/getSingleInventory/:id",
    handler: constantController.getSingleInventory,
  },
  {
    method: "GET",
    url: "/api/getSingleTransport/:id",
    handler: constantController.getSingleTransport,
  },
  {
    method: "GET",
    url: "/api/social",
    handler: constantController.getSocialOption,
  },
  {
    method: "GET",
    url: "/api/buyunits",
    handler: constantController.getBuyUnits,
  },
  {
    method: "GET",
    url: "/api/Contact",
    handler: constantController.getContactOption,
  },
  {
    method: "GET",
    url: "/api/getStaticPage",
    handler: constantController.getStaticPage,
  },
  {
    method: "POST",
    url: "/api/getUsers",
    beforeHandler: [auth.getToken],
    handler: userController.getUsers,
  },
  {
    method: "GET",
    url: "/api/getUserByCity/:id",
    handler: userController.getUserByCity,
  },
  {
    method: "POST",
    url: "/api/uploadUserPhoto",
    beforeHandler: [auth.getToken],
    handler: userController.uploadUserPhoto,
  },
  {
    method: "GET",
    url: "/api/getAllUsers",
    handler: userController.getAllUsers,
  },

  {
    method: "GET",
    url: "/api/showprofile",
    beforeHandler: [auth.getToken],
    handler: userController.getSingleUsers,
  },
  {
    method: "POST",
    url: "/api/users",
    beforeHandler: [auth.getToken],
    handler: userController.addUsers,
  },
  {
    method: "POST",
    url: "/api/userrefreshToken",
    beforeHandler: [auth.getToken],
    handler: userController.refreshToken,
  },
  {
    method: "POST",
    url: "/api/login",
    handler: userController.login,
  },
  {
    method: "POST",
    url: "/api/forgetPassword",
    handler: userController.forgetPassword,
  },
  {
    method: "POST",
    url: "/api/changePassword",
    beforeHandler: [auth.getToken],
    handler: userController.changePassword,
  },
  {
    method: "POST",
    url: "/api/changeRenterPassword",
    beforeHandler: [auth.getToken],
    handler: renterController.changePassword,
  },
  {
    method: "POST",
    url: "/api/renterforgetPassword",
    beforeHandler: [auth.getToken],
    handler: renterController.forgetPassword,
  },
  {
    method: "POST",
    url: "/api/changeAdminPassword",
    beforeHandler: [auth.getToken],
    handler: adminController.changePassword,
  },
  {
    method: "POST",
    url: "/api/logout",
    handler: userController.logout,
  },

  {
    method: "POST",
    url: "/api/updateprofile/:id",
    handler: userController.updateprofileFromAdmin,
  },
  {
    method: "POST",
    url: "/api/updateUserAndroid",
    beforeHandler: [auth.getToken],
    handler: userController.updateUserAndroid,
  },
  {
    method: "POST",
    url: "/api/verfiy",
    handler: userController.verfiy,
  },
  {
    method: "GET",
    url: "/api/notifications",
    beforeHandler: [auth.getToken],
    handler: notificationController.getNotfications,
  },
  {
    method: "GET",
    url: "/api/updateNotifications/:id",
    handler: notificationController.updateNotifications,
  },
  {
    method: "POST",
    url: "/api/notifications/:id",
    // beforeHandler: [auth.getToken],
    handler: notificationController.readNotifications,
  },
  {
    method: "POST",
    url: "/api/userSearch",
    beforeHandler: [auth.getToken],
    handler: userController.userSearch,
  },
  {
    method: "GET",
    url: "/api/userslist",
    handler: userController.userslist,
  },
  {
    method: "GET",
    url: "/api/userlistInfo",
    handler: userController.userlistInfo,
  },
  {
    method: "POST",
    url: "/api/block/:id",
    beforeHandler: [auth.getToken],
    handler: userController.block,
  },
  {
    method: "GET",
    url: "/api/userprofile/:id",
    handler: userController.userprofile,
  },
  {
    method: "POST",
    url: "/api/deleteOrder/:id",
    beforeHandler: [auth.getToken],
    handler: orderController.deleteOrder,
  },
  {
    method: "POST",
    url: "/api/addOrder",
    beforeHandler: [auth.getToken],
    handler: orderController.addOrder,
  },
  {
    method: "GET",
    url: "/api/getPaymentLogDetailsByRenterId/:id",
    handler: orderController.getPaymentLogDetailsByRenterId,
  },
  {
    method: "POST",
    url: "/api/updateOrderByAdmin/:id",
    beforeHandler: [auth.getToken],
    handler: orderController.updateOrderByAdmin,
  },
  {
    method: "POST",
    url: "/api/order",
    beforeHandler: [auth.getToken],
    handler: orderController.addOrder,
  },
  {
    method: "POST",
    url: "/api/addRate",
    beforeHandler: [auth.getToken],
    handler: orderController.addRate,
  },
  {
    method: "POST",
    url: "/api/addProcutComment",
    beforeHandler: [auth.getToken],
    handler: orderController.addProcutComment,
  },
  {
    method: "POST",
    url: "/api/approveRate/:id",
    beforeHandler: [auth.getToken],
    handler: orderController.approveRate,
  },
  {
    method: "POST",
    url: "/api/approveComment/:id",
    beforeHandler: [auth.getToken],
    handler: orderController.approveComment,
  },
  {
    method: "GET",
    url: "/api/getUserOrder",
    handler: orderController.getUserOrder,
  },
  {
    method: "GET",
    url: "/api/getOrderDetails/:id",
    handler: orderController.getOrderDetails,
  },
  {
    method: "GET",
    url: "/api/getOrdersByUserId/:id",
    handler: orderController.getOrdersByUserId,
  },

  {
    method: "POST",
    url: "/api/getOrdersSeacrh",
    beforeHandler: [auth.getToken],
    handler: orderController.getOrdersSeacrh,
  },
  {
    method: "GET",
    url: "/api/getTransactionSeacrh",
    beforeHandler: [auth.getToken],
    handler: orderController.getTransactionSeacrh,
  },
  {
    method: "GET",
    url: "/api/orderDetailsByUserId",
    // beforeHandler: [auth.getToken],
    handler: orderController.orderDetailsByUserId,
  },
  {
    method: "POST",
    url: "/api/getOrdersSeacrhExcel",
    beforeHandler: [auth.getToken],
    handler: orderController.getOrdersSeacrhExcel,
  },
  {
    method: "POST",
    url: "/api/getRackReserveSeacrh",
    beforeHandler: [auth.getToken],
    handler: rackController.getRackReserveSeacrh,
  },
  {
    method: "POST",
    url: "/api/getRackReserveSeacrhExcel",
    beforeHandler: [auth.getToken],
    handler: rackController.getRackReserveSeacrhExcel,
  },
  {
    method: "GET",
    url: "/api/getRatedOrders",
    handler: orderController.getRatedOrders,
  },
  {
    method: "GET",
    url: "/api/getApprovedRatedOrders",
    handler: orderController.getApproveRatedOrders,
  },
  {
    method: "GET",
    url: "/api/getRatedProducts",
    handler: orderController.getRatedProducts,
  },
  {
    method: "GET",
    url: "/api/getRatedProductsById/:id",
    handler: orderController.getRatedProductsById,
  },
  {
    method: "GET",
    url: "/api/getRenters",
    handler: renterController.getRenters,
  },
  {
    method: "GET",
    url: "/api/getNewOrder/:id",
    handler: orderController.getNewOrder,
  },
  {
    method: "GET",
    url: "/api/getNewRatedOrder/:id",
    handler: orderController.getNewRatedOrder,
  },
  {
    method: "POST",
    url: "/api/updateRate/:id",
    beforeHandler: [auth.getToken],
    handler: orderController.updateRate,
  },
  {
    method: "POST",
    url: "/api/addRenter",
    beforeHandler: [auth.getToken],
    handler: renterController.addrenters,
  },
  {
    method: "POST",
    url: "/api/getrenters",
    beforeHandler: [auth.getToken],
    handler: renterController.getrenters,
  },
  {
    method: "POST",
    url: "/api/getRentersExcel",
    beforeHandler: [auth.getToken],
    handler: renterController.getRentersExcel,
  },
  {
    method: "GET",
    url: "/api/getRenterDetails/:id",
    handler: renterController.getSinglerenters,
  },
  {
    method: "POST",
    url: "/api/blockRender",
    beforeHandler: [auth.getToken],
    handler: renterController.block,
  },
  {
    method: "POST",
    url: "/api/updateAdd",
    beforeHandler: [auth.getToken],
    handler: renterController.updateAdd,
  },
  {
    method: "POST",
    url: "/api/updateEdit",
    beforeHandler: [auth.getToken],
    handler: renterController.updateEdit,
  },
  {
    method: "POST",
    url: "/api/send_sms",
    beforeHandler: [auth.getToken],
    handler: renterController.sendSMSRender,
  },
  {
    method: "POST",
    url: "/api/send_email",
    beforeHandler: [auth.getToken],
    handler: renterController.sendEmailRender,
  },
  {
    method: "POST",
    url: "/api/ApproveCode",
    beforeHandler: [auth.getToken],
    handler: renterController.ApproveCode,
  },
  {
    method: "POST",
    url: "/api/transfer",
    beforeHandler: [auth.getToken],
    handler: productController.transfer,
  },
  {
    method: "POST",
    url: "/api/CheckApproveCode",
    beforeHandler: [auth.getToken],
    handler: renterController.CheckApproveCode,
  },
  {
    method: "GET",
    url: "/api/renterList/:id",
    handler: renterController.RenterList,
  },
  {
    method: "POST",
    url: "/api/loginRenter",
    handler: renterController.login,
  },

  {
    method: "POST",
    url: "/api/updateprofileFromAdmin/:id",
    beforeHandler: [auth.getToken],
    handler: renterController.updateprofileFromAdmin,
  },

  {
    method: "GET",
    url: "/api/getProductsCount/:id",
    handler: reportController.getProductsCount,
  },
  {
    method: "GET",
    url: "/api/getMostProductQty",
    handler: reportController.getMostProductQty,
  },
  {
    method: "GET",
    url: "/api/getMostProductQtyRenter/:id",
    handler: reportController.getMostProductQtyRenter,
  },
  {
    method: "GET",
    url: "/api/getMostRenter",
    handler: reportController.getMostRenter,
  },
  {
    method: "GET",
    url: "/api/getTop10Cities",
    handler: reportController.getTop10Cities,
  },
  {
    method: "GET",
    url: "/api/importantCounters",
    handler: reportController.importantCounters,
  },
  {
    method: "GET",
    url: "/api/importantCountersForRenter/:id",
    handler: reportController.importantCountersForRenter,
  },
  {
    method: "GET",
    url: "/api/top15NewUsers",
    handler: reportController.top15NewUsers,
  },
  {
    method: "GET",
    url: "/api/OrdersPerYear",
    handler: reportController.OrdersPerYear,
  },
  {
    method: "GET",
    url: "/api/UsersRenterPerYear",
    handler: reportController.UsersRenterPerYear,
  },
  {
    method: "GET",
    url: "/api/getMostProductSells",
    handler: reportController.getMostProductSells,
  },
  {
    method: "GET",
    url: "/api/getMostProductSellsRenter/:id",
    handler: reportController.getMostProductSellsRenter,
  },
  {
    method: "GET",
    url: "/api/getProductsByCategory/:id",
    handler: productController.getProductsByCategory,
  },
  {
    method: "POST",
    url: "/api/getActiveProducts",
    beforeHandler: [auth.getToken],
    handler: productController.getActiveProducts,
  },
  {
    method: "POST",
    url: "/api/getActiveProductsExcel",
    beforeHandler: [auth.getToken],
    handler: productController.getActiveProductsExcel,
  },
  {
    method: "POST",
    url: "/api/searchWeb",
    beforeHandler: [auth.getToken],
    handler: productController.searchWeb,
  },
  {
    method: "GET",
    url: "/api/getTop4RatedProducts",
    handler: productController.getTop4RatedProducts,
  },
  {
    method: "GET",
    url: "/api/revenuPerYear",
    handler: reportController.revenuPerYear,
  },
  {
    method: "GET",
    url: "/api/revenuPerYearRenter/:id",
    handler: reportController.revenuPerYearRenter,
  },
  {
    method: "GET",
    url: "/api/getAllSettings",
    handler: constantController.getSettings,
  },
  {
    method: "GET",
    url: "/api/getdelivery_time/:id",
    handler: constantController.getdelivery_time,
  },
  {
    method: "POST",
    url: "/api/addSettings",
    beforeHandler: [auth.getToken],
    handler: constantController.addSetting,
  },
  {
    method: "POST",
    url: "/api/deleteSetting/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.deleteSetting,
  },

  {
    method: "POST",
    url: "/api/updateSetting/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.updateSetting,
  },
  {
    method: "POST",
    url: "/api/updatedelivery_time/:id",
    beforeHandler: [auth.getToken],
    handler: constantController.updatedelivery_time,
  },
  {
    method: "GET",
    url: "/api/getproduct/:id",
    handler: productController.getSingleProduct,
  },
  {
    method: "POST",
    url: "/api/deleteproduct/:id",
    beforeHandler: [auth.getToken],
    handler: productController.deleteProduct,
  },
  {
    method: "POST",
    url: "/api/updatePriceQty/:id",
    beforeHandler: [auth.getToken],
    handler: productController.updatePriceQty,
  },
  {
    method: "POST",
    url: "/api/approveAllProducts/:id",
    beforeHandler: [auth.getToken],
    handler: productController.approveAllProducts,
  },

  {
    method: "POST",
    url: "/api/deleteProductImage/:id",
    beforeHandler: [auth.getToken],
    handler: productController.deleteProductImage,
  },
  {
    method: "POST",
    url: "/api/updateproduct/:id",
    beforeHandler: [auth.getToken],
    handler: productController.updateProduct,
  },
  {
    method: "POST",
    url: "/api/updateProductStatus/:id",
    beforeHandler: [auth.getToken],
    handler: productController.updateProductStatus,
  },
  {
    method: "POST",
    url: "/api/getProductDetailsByBarCode",
    beforeHandler: [auth.getToken],
    handler: productController.getProductDetailsByBarCode,
  },
  {
    method: "POST",
    url: "/api/makeCoverImage/:id",
    beforeHandler: [auth.getToken],
    handler: productController.makeCoverImage,
  },
  {
    method: "GET",
    url: "/api/getProductsByRackId/:id",
    handler: productController.getProductsByRackId,
  },
];

module.exports = routes;
