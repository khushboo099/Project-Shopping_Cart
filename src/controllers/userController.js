const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")

const  { isValidBody, validString, validMobileNum, validEmail, validPwd} = require('../utils/validation')
//const uploadFiles = require("../utils/awss3")


const AWS= require("aws-sdk")

AWS.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
  })
  
  //   FILE  CREATION  IN  AWS  S3
  let uploadFiles = async (file) => {
    return new Promise(function (resolve, reject) {
        let s3 = new AWS.S3({ apiVersion: '2006-03-01' });
        let uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "abc/" + file.originalname, //HERE
            Body: file.buffer
        };
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                console.log(reject(err))
                return (reject({ "Error": err }))
  
            }
             //console.log(resolve(data))
             //console.log(data);
            console.log("File Uploaded SuccessFully");
            return resolve(data.Location)
        });
  
    });
  
  };

const createUser= async function(req, res) {
    try{

        let files= req.files
        if(files && files.length>0){
          var uploadedFileURL= await uploadFiles( files[0] )
      }
      else{
          res.status(400).send({ msg: "No file found" })
      }
    let data= req.body

    if(isValidBody(data)) return res.status(400).send({status: false, message: "Enter user details"})

    //Data is Present or not
    if(!data.fname) return res.status(400).send({status: false, message: "FirstName is required"}) 
    if(!data.lname) return res.status(400).send({status: false, message: "LastName is required"})
    if(!data.email) return res.status(400).send({status: false, message: "Email ID is required"})
    if(!data.phone) return res.status(400).send({status: false, message: "Mobile number is required"})
    if(!data.password) return res.status(400).send({status: false, message: "Password is required"})
    if(!data.address) return res.status(400).send({status: false, message: "Address is required"})
    // if(!data.address.shipping) return res.status(400).send({status: false, message: "Shipping Address is required"})
    // if(!data.address.shipping.street || !data.address.shipping.city || !data.address.shipping.pincode) return res.status(400).send({status: false, message: "shipping must be required with street,city,pincode"})
    // if(!data.address.billing) return res.status(400).send({status: false, message: "Billing Address is required"})
    // if(!data.address.billing.street || !data.address.billing.city || !data.address.billing.pincode) return res.status(400).send({status: false, message: "billing must be required with street,city,pincode"})
    
    //Data is valid or not
    if(validString(data.fname) ||validString(data.lname) ) return res.status(400).send({status: false, message: "Name should be characters and should not contains any numbers"})
    if(validEmail(data.email)) return res.status(400).send({status: false, message: "Enter a valid email-id"})
    if(validMobileNum(data.phone)) return res.status(400).send({status: false, message: "Enter a 10-digit phone number exluding (+91)"})
    if(validPwd(data.password)) return res.status(400).send({status: false, message: "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters"})
    
    

    //check email and password
    let checkUniqueValues = await userModel.findOne({$or: [{phone: data.phone}, {email: data.email}]})
    if(checkUniqueValues) return res.status(400).send({status: false, message: "E-Mail or phone number already exist"})

    data.profileImage = uploadedFileURL

    // here we can start user creation
    let userData= await userModel.create(data)
    res.status(201).send({status: true, message: "User created successfully", data: userData})
    }catch(err){
        res.status(500).send({status: false, Error: err.message})
    }
}

const loginUser = async (req, res) => {
    try{
        let data = req.body;

        //check data is present or not
        if(Object.keys(data).length == 0) return res.status(400).send({status: false, message: "Email and Password is required for login"})

        //check email or password is present or not
        if(!data.email) return res.status(400).send({status: false, message: "Email field is empty"})
        if(!data.password) return res.status(400).send({status: false, message: "Password field is empty"})

        //validate email and password
        if(validEmail(data.email)) return res.status(400).send({status: false, message: "Enter a valid email-id"})
        if(validPwd(data.password)) return res.status(400).send({status: false, message: "Enter a valid password"})

        //check email and password is in same or not
        let getUserData = await userModel.findOne({email: data.email, password: data.password})
        if(!getUserData) return res.status(400).send({status: false, message: "Email or password is invalid"})

        //token generation for the logged in user
        let token = jwt.sign({userId: getUserData._id,
            iat: Math.floor(Date.now() / 1000),           //issue date
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24  //expires in 24 hr
        }, 
        "Uranium Project-5"
        );
        //set the headers
        res.status(200).setHeader("x-api-key", token);

        res.status(200).send({status: true, message: "user login successfully", data: {userId: userId, token: token}})
        
    }catch(err){
        res.status(500).send({status: false, Error: err.message})
    }
}

  module.exports = {createUser,loginUser}