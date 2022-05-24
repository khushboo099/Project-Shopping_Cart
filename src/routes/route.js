const express = require('express');
const router = express.Router();

const {createUser,loginUser} = require("../controllers/userController")

//usreApi
router.post("/register", createUser)
router.post("/login", createUser,loginUser)



module.exports = router;