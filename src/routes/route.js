const express = require('express');
const router = express.Router();

const {createUser, loginUser, getProfile, updateUserProfile} = require("../controllers/userController")
const {createProduct, getProduct, getProductById, updateProduct, deleteProduct} = require("../controllers/productController")
const {addCart} = require("../controllers/cartController")
const {authentication, authorization} = require("../middleware/auth")

//usreApi
router.post("/register", createUser)
router.post("/login", loginUser)
router.get("/user/:userId/profile",authentication, getProfile)
router.put("/user/:userId/profile",authentication, authorization, updateUserProfile)

//product api
router.post("/products", createProduct)
router.get("/products", getProduct)
router.get("/products/:productId", getProductById)
router.put("/products/:productId",updateProduct)
router.delete("/products/:productId", deleteProduct)

//cart API
router.post("/users/:userId/cart", addCart)

module.exports = router;