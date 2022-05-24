const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")
const  { isValid,isValidBody, validString, validMobileNum, validEmail, validPwd, isValidObjectId} = require('../utils/validation')
//const {uploadFiles} = require("../utils/awss3")
const AWS= require("aws-sdk")
const jwt = require("jsonwebtoken")

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

  //----------------------------------------------------------POST /register----------------------------------------------------------------

const createUser= async function(req, res) {
    try{

        let files= req.files
        if(files && files.length>0){
          var uploadedFileURL= await uploadFiles( files[0] )
      }
      else{
          res.status(400).send({ msg: "Profile Image is required" })
      }
    let data= req.body

    if(isValidBody(data)) return res.status(400).send({status: false, message: "Enter user details"})

    //Data is Present or not
    if(!data.fname) return res.status(400).send({status: false, message: "FirstName is required"}) 
    if(!data.lname) return res.status(400).send({status: false, message: "LastName is required"})
    if(!data.email) return res.status(400).send({status: false, message: "Email ID is required"})
    if(!data.phone) return res.status(400).send({status: false, message: "Mobile number is required"})
    //if(files.length == 0) return res.status(400).send({status: false, message: "Profile Image is not found"})
    if(!data.password) return res.status(400).send({status: false, message: "Password is required"})
    if(!data.address) return res.status(400).send({status: false, message: "Address is required"})

    data.address = JSON.parse(data.address)

    //shipping
    if(isValid(data.address.shipping) && isValidBody(data.address.shipping)) return res.status(400).send({status: false, message: "shipping address should be with street, city and pincode"})
    if(!data.address.shipping.street) return res.status(400).send({status: false, message: "shipping street is required"})
    if(!data.address.shipping.city) return res.status(400).send({status: false, message: "shipping city is required"})
    if(!data.address.shipping.pincode) return res.status(400).send({status: false, message: "shipping pincode is required"})

    //billing
    if(isValid(data.address.billing) && isValidBody(data.address.billing)) return res.status(400).send({status: false, message: "billing address should be with street, city and pincode"})
    if(!data.address.billing.street) return res.status(400).send({status: false, message: "billing street is required"})
    if(!data.address.billing.city) return res.status(400).send({status: false, message: "billing city is required"})
    if(!data.address.billing.pincode) return res.status(400).send({status: false, message: "billing pincode is required"})


    
    //Data is valid or not
    if(validString(data.fname) ||validString(data.lname) ) return res.status(400).send({status: false, message: "Name should be characters and should not contains any numbers"})
    if(validEmail(data.email)) return res.status(400).send({status: false, message: "Enter a valid email-id"})
    if(validMobileNum(data.phone)) return res.status(400).send({status: false, message: "Enter a 10-digit phone number exluding (+91)"})
    if(validPwd(data.password)) return res.status(400).send({status: false, message: "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters"})

    data.password = await bcrypt.hash(data.password, 10)
    
    

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

//---------------------------------------------------------------POST /login-------------------------------------------------------------------

const loginUser = async (req, res) => {
    try{
        let data = req.body;
        const {email, password} = data

        //check data is present or not
        if(Object.keys(data).length == 0) return res.status(400).send({status: false, message: "Email and Password is required for login"})

        //check email or password is present or not
        if(!data.email) return res.status(400).send({status: false, message: "Email field is empty"})
        if(!data.password) return res.status(400).send({status: false, message: "Password field is empty"})

        //validate email and password
        if(validEmail(data.email)) return res.status(400).send({status: false, message: "Enter a valid email-id"})
        if(validPwd(data.password)) return res.status(400).send({status: false, message: "Enter a valid password"})

        //check email and password is in same or not
        let getEmailData = await userModel.findOne({email})
        if(!getEmailData) return res.status(400).send({status: false, message: "Email is incorrect"})

        //password
        let passwordData = await bcrypt.compare(password, getEmailData.password)
        if(!passwordData) return res.status(400).send({status: false, message: "Password is incorrect"})

        let userId = getEmailData._id
        let token = jwt.sign({ userId: getEmailData._id }, "Uranium Project-5", {expiresIn: '1d'});

        //set the headers
        res.status(200).setHeader("x-api-key", token);

        res.status(200).send({status: true, message: "user login successfully", data: {userId: userId, token: token}})
        
    }catch(err){
        res.status(500).send({status: false, Error: err.message})
    }
}

//--------------------------------------------GET /user/:userId/profile -----------------------------------------------------------------

const getProfile = async function (req, res) {
    try {
        let userId = req.params.userId

        if(!userId) return res.status(400).send({status: false , message: "userId must be required"})

        // validating userId        
        if(!isValidObjectId(userId)) return res.status(400).send({status: false, message: "Invalid userId"})

        let userProfile = await userModel.findById({_id: userId})
        if(!userProfile)
        return res.status(400).send({status: false, message: "User doesn't exist"})
        else
        return res.status(200).send({status: true, message: "User profile details", data: userProfile})
        

    }catch(err){
        res.status(500).send({status: false, Error: err.message})
    }
}

//-------------------------------------------------------/user/:userId/profile----------------------------------------------------------

// const updateUserProfile = async function (req, res) {
//     try {
//       let userId = req.params.userId
//       let data = req.body
//       let files = req.files
//       if(files && files.length>0){
//         var uploadedFileURL= await uploadFiles( files[0] )
//     }
//     else{
//         res.status(400).send({ msg: "Profile Image is required to update" })
//     }
  
//       if (!userId) return res.status(400).send({status: false,message: "userId must be required"})
//       if (!data) return res.status(400).send({status: false,message: "Required Details"})
  
     
//       data.profileImage = uploadedFileURL

//       let changeDetails = await userModel.findOneAndUpdate({_id: userId}, data, {new: true})
//       res.status(200).send({status: true,message: "User Profile Updated", data: changeDetails})
//     } catch (err) {
//       return res.status(500).send({status: false,Error: err.message})
//     }
//   }

const updateUserProfile = async(req, res) => {
    try {
        let files = req.files
        let data = req.body
        let userId = req.params.userId
        //let userIdFromToken = req.userId

        //Validation starts.
        if (!isValidObjectId(userId)) 
        return  res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
        if (isValidBody(data)) 
        return res.status(400).send({status: false,message: "Invalid request parameters. Please provide user's details to update." })

        const findUserProfile = await userModel.findOne({ _id: userId })
        if (!findUserProfile) 
        return res.status(400).send({status: false,message: `User doesn't exists by ${userId}`})
       
         //let { fname, lname, email, phone, password, address, profileImage } = requestBody;

         //validations for updatation details.
         
         if (data.fname) {
             if (!isValid(data.fname)) 
             return res.status(400).send({ status: false, message: "Invalid request parameter, please provide fname" })
        }
         
         if (data.lname) {
             if (!isValid(data.lname)) 
             return res.status(400).send({ status: false, message: "Invalid request parameter, please provide lname" }) 
         }
         //email validation
        
         if (data.email) {
             if (validEmail(data.email)) 
                 return res.status(400).send({ status: false, message: "Invalid request parameter, please provide email" })
             
             let isEmailAlredyPresent = await userModel.findOne({ email: data.email })
             if (isEmailAlredyPresent) 
                 return res.status(400).send({ status: false, message: `Unable to update email. ${email} is already registered.` });
        }
        //phone validation
         
         if (data.phone) {
             if (validMobileNum(data.phone)) 
                 return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Phone number." })
             let isPhoneAlredyPresent = await userModel.findOne({ phone: data.phone })
             if (isPhoneAlredyPresent) 
                 return res.status(400).send({ status: false, message: `Unable to update phone. ${phone} is already registered.` });
             }
         //password validation and setting range of password.
             if(data.password){
            if(validPwd(data.password))
            return res.status(400).send({ status: false, message: 'Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters' })
        //  let tempPassword = password
        //  var encryptedPassword = await bcrypt.hash(tempPassword,10)
        data.password = await bcrypt.hash(data.password, 10)
             }
        

        //validating user's profile image.
        // if(profileImage){
        // if (files) {
        //     if (isValidBody(files)) {
        //         if (!(files && files.length > 0)) {
        //             return res.status(400).send({ status: false, message: "Invalid request parameter, please provide profile image" })
        //         }
        //         var updatedProfileImage = await uploadFiles(files[0])
        //     }
        // }}
        //Address
        if(files && files.length>0){
                    var uploadedFileURL= await uploadFiles( files[0] )
                    data.profileImage = uploadedFileURL
                }
                else{
                    res.status(400).send({ msg: "Profile Image is required to update" })
                }
        if(data.address) {

        
        if(!data.address) return res.status(400).send({status: false, message: "Address is required"})

        data.address = JSON.parse(data.address)

        //shipping
        // if(isValid(address.shipping) && isValidBody(address.shipping)) return res.status(400).send({status: false, message: "shipping address should be with street, city and pincode"})
        // if(!address.shipping.street) return res.status(400).send({status: false, message: "shipping street is required"})
        // if(!address.shipping.city) return res.status(400).send({status: false, message: "shipping city is required"})
        // if(!address.shipping.pincode) return res.status(400).send({status: false, message: "shipping pincode is required"})
    
        // //billing
        // if(isValid(address.billing) && isValidBody(address.billing)) return res.status(400).send({status: false, message: "billing address should be with street, city and pincode"})
        // if(!address.billing.street) return res.status(400).send({status: false, message: "billing street is required"})
        // if(!address.billing.city) return res.status(400).send({status: false, message: "billing city is required"})
        // if(!address.billing.pincode) return res.status(400).send({status: false, message: "billing pincode is required"})

         }
           
        //Validation ends


        //object destructuring for response body.
        let changeProfileDetails = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true })
        return res.status(200).send({ status: true,message: "updated successfully", data: changeProfileDetails })
    }    
        
    catch(err){
        res.status(500).send({status: false, Error: err.message})
    }
}


  module.exports = {createUser, loginUser, getProfile,updateUserProfile}