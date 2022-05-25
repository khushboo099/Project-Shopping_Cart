const express = require('express');
const router = express.Router();

const {createUser, loginUser, getProfile, updateUserProfile} = require("../controllers/userController")
const {createProduct} = require("../controllers/productController")
const {authentication, authorization} = require("../middleware/auth")

//usreApi
router.post("/register", createUser)
router.post("/login", loginUser)
router.get("/user/:userId/profile",authentication, getProfile)
router.put("/user/:userId/profile",authentication, authorization, updateUserProfile)

//product api
router.post("/products", createProduct)


module.exports = router;