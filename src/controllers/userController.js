const userModel = require("../controllers/userController")

const  { isValid, isValidBody, validString, validMobileNum, validEmail, validPwd} = require('../utils/validation')


const createUser= async function(req, res) {
    try{
    let data= req.body

    if(isValidBody(data)) return res.status(400).send({status: false, message: "Enter user details"})

    //Data is Present or not
    if(!data.fname) return res.status(400).send({status: false, message: "FirstName is required"}) 
    if(!data.lname) return res.status(400).send({status: false, message: "LastName is required"})
    if(!data.email) return res.status(400).send({status: false, message: "Email ID is required"})
    if(!data.profileImage) return res.status(400).send({status: false, message: "Profile Image is required"})
    if(!data.phone) return res.status(400).send({status: false, message: "Mobile number is required"})
    if(!data.password) return res.status(400).send({status: false, message: "Password is required"})
    if(!data.address) return res.status(400).send({status: false, message: "Address is required"})
    if(!data.address.shipping) return res.status(400).send({status: false, message: "Shipping Address is required"})
    if(!data.address.shipping.street || !data.address.shipping.city || !data.address.shipping.pincode) return res.status(400).send({status: false, message: "shipping must be required with street,city,pincode"})
    if(!data.address.billing) return res.status(400).send({status: false, message: "Billing Address is required"})
    if(!data.address.billing.street || !data.address.billing.city || !data.address.billing.pincode) return res.status(400).send({status: false, message: "billing must be required with street,city,pincode"})
    
    //Data is valid or not
    if(validString(data.fname) ||validString(data.lname) ) return res.status(400).send({status: false, message: "Name should be characters and should not contains any numbers"})
    if(validEmail(data.email)) return res.status(400).send({status: false, message: "Enter a valid email-id"})
    if(validMobileNum(data.phone)) return res.status(400).send({status: false, message: "Enter a 10-digit phone number exluding (+91)"})
    if(validPwd(data.password)) return res.status(400).send({status: false, message: "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters"})

    if(!isValid(data.address.street)) return res.status(400).send({status: false, message: "streetis only alphanumeric"})
    if(validString(data.address.city)) return res.status(400).send({status: false, message: "city contains only character"})
    if(!isValid(data.address.pincode)) return res.status(400).send({status: false, message: "Pincode contains only Number"})
    
    

    //check email and password
    let checkUniqueValues = await userModel.findOne({$or: [{phone: data.phone}, {email: data.email}]})
    if(checkUniqueValues) return res.status(400).send({status: false, message: "E-Mail or phone number already exist"})

    // here we can start user creation
    let userData= await userModel.create(data)
    res.status(201).send({status: true, message: "User created successfully", data: userData})
    }catch(err){
        res.status(500).send({status: false, Error: err.message})
    }
}

  module.exports = {createUser}