const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")

const  { isValid,isValidBody, validString, isValidObjectId} = require('../utils/validation')


//---------------------------------------------------Post Api------------------------------------------------------

const addCart = async(req, res) => {
    try{
        const userId = req.params.userId
        const data = req.body

        const {cartId, productId, quantity} = data

        if(isValidBody(data)) return res.status(400).send({status: false, message: "Enter the detail in request body"})

        if(!productId) return res.status(400).send({status: false, message: "Please Enter a product Id"})
        if(!isValidObjectId(productId)) return res.status(400).send({status: false, message:"ProductId is invalid"})

       if(!quantity) return res.status(400).send({status: false, message: "Please Enter a quantity atleast 1"})
       if(!/^[0-9]+$/.test(quantity)) return res.status(400).send({status: false, message:"Please Enter quantity in a Number"})

       let checkProduct = await productModel.findOne({productId: productId, isDeleted: false })
       if(!checkProduct) return res.status(400).send({status: false, message: "Product does not Exist"})

 //if cartId is not present
 if(!cartId){
     const findCart = await cartModel.findOne({userId: userId})
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
     console.log("1----",findRealCart)
     if(findRealCart._id != cartId) return res.status(400).send({status: false, message: "cartId is incorrect"})

     const findCart = await cartModel.findOne({_id: cartId})
     console.log("2--->", findCart)
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


//-----------------------------------------------------update Api--------------------------------------------------

const updateCart = async (req, res) => {
    try{

    }catch(err){
        return res.status(500).send({status: false, Error: err.message})
    }
}

//------------------------------get api-----------------------------------

const getCart = async function (req, res) {

    try {
        let userId = req.params.userId

        const findCart = await cartModel.findOne({ userId: userId })

        if (!findCart) {
            return res.status(400).send({ status: false, message: "User's cart doesn't exist" })
        }

        return res.status(200).send({ status: true, message: "Cart details", data: findCart })
    }
    catch (error) {
        res.status(500).send({ status: false, Error: "Server not responding", message: error.message, });
    }

}

//---------------------------------------delete api-------------------------------------

const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Invalid userId" })

        let findUser = await userModel.findById({ _id: userId })
        if (!findUser) return res.status(400).send({ status: false, message: "userId doesn't exist" })

        let findCart = await cartModel.findOne({ userId })
        if (!findCart) return res.status(400).send({ status: false, message: "cart doesn't exist by this userId" })

        let cartDeleting = await cartModel.findOneAndUpdate({ userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } })
        console.log(cartDeleting)
        return res.status(204).send({ status: true, message: "cart deleted Successfully"})

    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}


module.exports = {addCart, updateCart, getCart, deleteCart}



