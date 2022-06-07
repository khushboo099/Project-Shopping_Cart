const express = require('express');
const router = express.Router();

const {createUser, loginUser, getProfile, updateUserProfile} = require("../controllers/userController")
const {createProduct, getProduct, getProductById, updateProduct, deleteProduct} = require("../controllers/productController")
const {addCart, getCart, updateCart, deleteCart} = require("../controllers/cartController")
const {orderCreation, updateOrder} = require("../controllers/orderController")
const {authentication, authorization} = require("../middleware/auth")

//user API
router.post("/register", createUser)
router.post("/login", loginUser)
router.get("/user/:userId/profile",authentication,  authorization, getProfile)
router.put("/user/:userId/profile",authentication, authorization, updateUserProfile)

//product API
router.post("/products", createProduct)
router.get("/products", getProduct)
router.get("/products/:productId", getProductById)
router.put("/products/:productId",updateProduct)
router.delete("/products/:productId", deleteProduct)

//cart API
router.post("/users/:userId/cart",authentication, authorization,addCart)
router.put("/users/:userId/cart",authentication, authorization, updateCart)
router.get("/users/:userId/cart",authentication, authorization, getCart)
router.delete("/users/:userId/cart",authentication, authorization, deleteCart)

//order API
router.post("/users/:userId/orders",authentication, authorization, orderCreation)
router.put("/users/:userId/orders",authentication, authorization, updateOrder)

// if API is invalid OR wrong URL
router.all("/*", function (req, res) {
    res.status(404).send({ status: false, msg: "The api you requested is not available" });
  });



module.exports = router;