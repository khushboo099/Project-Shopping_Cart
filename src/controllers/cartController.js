const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")

const  { isValid,isValidBody, validString, isValidObjectId} = require('../utils/validation')


const addCart = async(req, res) => {
    try{
        const userId = req.params.userId
        // console.log(userId)
        const data = req.body
      // const {cartId,items} = data

        const {cartId, productId, quantity} = data
        console.log(userId,productId,quantity)

        if(isValidBody(data)) return res.status(400).send({status: false, message: "Enter the detail in request body"})

        if(!productId) return res.status(400).send({status: false, message: "Please Enter a product Id"})
        if(!isValidObjectId(productId)) return res.status(400).send({status: false, message:"ProductId is invalid"})

       if(!quantity) return res.status(400).send({status: false, message: "Please Enter a quantity"})
       if(!/^[0-9]+$/.test(quantity)) return res.status(400).send({status: false, message:"Please Enter quantity in a Number"})

       let checkProduct = await productModel.findOne({productId: productId, isDeleted: false })
       console.log(checkProduct)
       if(!checkProduct) return res.status(400).send({status: false, message: "Product does not Exist"})

 //if cartId is not present
 if(!cartId){
     const findCart = await cartModel.findOne({userId: userId})
     console.log("1-->",findCart)
     if(findCart) return res.status(400).send({status: false, message: "cart is already created to this userId"})

     if(!findCart){
         const addToCart = {
             userId: userId,
             items: [{
                 productId: productId,
                 quantity: quantity
             }],
             totalPrice: checkProduct.price * quantity,
             totalItems: 1
         }
         const newCart = await cartModel.create(addToCart)
         return res.status(201).send({status: false, message: "cart created successfully", data: newCart})
     }
 }

 //if cartId is present
 if(cartId){
     if(!isValidObjectId(cartId))  return res.status(400).send({status: false, message: "Invalid cartId"})

     let findRealCart = await cartModel.findOne({userId: userId})
     if(findRealCart._id != cartId) return res.status(400).send({status: false, message: "cartId is incorrect"})

     const findCart = await cartModel.findOne({_id: cartId})
     if(!findCart) {
         const addToCart = {
             userId: userId,
             items: [{
                 productId: productId,
                 quantity: quantity
             }],
             totalPrice: checkProduct.price * quantity,
             totalItems: 1
         }
         const newCart = await cartModel.create(addToCart)
         return res.status(201).send({status: false, message: "cart created and product added to cart successfully", data: newCart})

     }

     if(findCart){
         //increase quantity
         for (let i = 0; i < findCart.items.length; i++) {

             if (`${findCart.items[i].productId}` == `${checkProduct._id}`) {
                 findCart.items[i].quantity = findCart.items[i].quantity + quantity
                 findCart.totalPrice = (checkProduct.price * quantity) + findCart.totalPrice
                 findCart.totalItems = findCart.items.length
                 findCart.save()
                 return res.status(200).send({ status: true, message: "product added to cart", data: findCart })
             }
         }

         //add new item in cart
         findCart.items[(findCart.items.length)] = { productId: productId, quantity: quantity }
         findCart.totalPrice = (checkProduct.price * quantity) + findCart.totalPrice
         findCart.totalItems = findCart.items.length
         findCart.save()
         return res.status(200).send({ status: true, message: "product added to cart", data: findCart })
     }
 }
     }catch(err){
         return res.status(500).send({status: false, Error: err.message})
     }
}


module.exports = {addCart}



