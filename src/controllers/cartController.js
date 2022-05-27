const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")

const  { isValid,isValidBody, validString, validMobileNum, validEmail, validPwd, isValidObjectId} = require('../utils/validation')


const addCart = async(req, res) => {
    try{
        let userId = req.params.userId
        let data = req.body

        const {cartId, productId} = data

        if(isValidBody(data)) return res.status(400).send({status: false, message: "Enter the detail in request body"})

        let checkUserId = await userModel.findById(userId)
        if(!checkUserId) return res.status(400).send({status: false, message: "userId does not exist"})
        if(!isValidObjectId(checkUserId)) return res.status(400).send({status: false, message: "Invalid userId"})

        if(!isValidObjectId(productId)) return res.status(400).send({status: false, message:"ProductId is invalid"})
        let checkProductId = await productModel.findOne({_id: productId, isDeleted: false })
        if(!checkProductId) return res.status(400).send({status: false, message: "ProductId does not Exist"})

        let checkCardId = await cartModel.findById(cartId)
        if(checkCardId == null) return res.status(400).send({status: false, message: "cardId does not exist"})
        if(!isValidObjectId(checkCardId)) return res.status(400).send({status: false, message:"carId is invalid"})

        if(checkUserId){
            if(checkCardId){
                //here we add product
            }
        }
        



        
        let createCart = await cartModel.create(data)
        return res.status(200).send({status: true, message: "Cart Create Successfully", data: createCart})
    }catch(err){
        return res.status(500).send({status: false, Error: err.message})
    }
}


module.exports = {addCart}