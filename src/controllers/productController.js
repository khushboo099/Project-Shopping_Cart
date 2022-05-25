const productModel = require("../models/productModel")
const  { isValid,isValidBody, validString, validMobileNum, validEmail, validPwd, isValidObjectId, validPrice, validSize} = require('../utils/validation')
const {uploadFile} = require("../utils/awss3")



////=====================================product api post===================================
const createProduct= async function(req, res) {
    try{

    let files= req.files
    let data= req.body

    if(isValidBody(data)) return res.status(400).send({status: false, message: "Enter product details"})

    //title is Present or not
    if(!data.title) return res.status(400).send({status: false, message: "title is required"}) 

    //validate title
    if(validString(data.title) ) return res.status(400).send({status: false, message: "title should be characters and should not contains any numbers"})

    //check title already exist or not
    let checkUniqueTitle = await productModel.findOne({title: data.title})
    if(checkUniqueTitle) return res.status(400).send({status: false, message: "title is already exist"})

    //check description is present or not
    if(!data.description) return res.status(400).send({status: false, message: "description is required"})

    //validate description
    if(!isValid(data.description)) return res.status(400).send({status: false, message: " valid description is required"})

    //check for price
    if(!data.price) return res.status(400).send({status: false, message: "price is required"})

    //validate price
    if(validPrice(data.price)) return res.status(400).send({status: false, message: "Price is accept both number and decimal"})

    //check for currecyId
    if(!data.currencyId) return res.status(400).send({status: false, message: "currencyId is required"})
     if(data.currencyId!=="INR") return res.status(400).send({status: false, message: " valid currencyId i.e..,INR is required"})

     //check for currency format
    if(!data.currencyFormat) return res.status(400).send({status: false, message: "currency format  is required"})
    if(data.currencyFormat!=="₹") return res.status(400).send({status: false, message: " valid currencyformat i.e., ₹ is required"})

    //check for size
    if(!data.availableSizes) return res.status(400).send({status: false, message: "size is required"})

    //validate size
    if(validSize(data.availableSizes))  return res.status(400).send({status: false, message: "Size should be one of S,XS,M,X,L,XXL,XL"})
   
    //check for style
    if(data.style){
    if(!isValid(data.style)) return res.status(400).send({status: false, message: "style is required"})
    }

    //check for installment
      if(data.installments){
        if(!isValid(data.installments)) return res.status(400).send({status: false, message: "installments is required"})   
      }


    if(files && files.length>0){
        let uploadedFileURL= await uploadFile( files[0] )
        data.productImage=uploadedFileURL
    }
    else{
        res.status(400).send({status: false, message: "Product Image is required" })
    }

    // here we can start user creation

    let productData= await productModel.create(data)
    res.status(201).send({status: true, message: "created successfully", data: productData})
    }catch(err){
        res.status(500).send({status: false, Error: err.message})
    }
}
module.exports = {createProduct}