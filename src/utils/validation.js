const mongoose = require('mongoose')

const isValid = function(value) {
  if(typeof value === 'undefined' || value === null) return false
  if(typeof value === 'string' && value.trim().length === 0) return false
  if(typeof value === "object") return false
  return true
}

const isValidBody = (object) => {
    if (Object.keys(object).length > 0) {
      return false
    }else {
      return true;
    }
  };
  
  const validString = (String) => {
    if (/\d/.test(String)) { 
      return true
    }else {
      return false;
    };
  };
  
  const validMobileNum = (Mobile) => {
    if (/^[6-9]\d{9}$/.test(Mobile)) {
      return false
    }else {
      return true;
    };
  };
  
  const validEmail = (Email) => {
    if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(Email)){
      return false
    }else {
      return true;
    }
      
  };
  
  const validPwd = (Password) => {
    if (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(Password)){
      return false
    }else {
      return true;
    }
  };

  const isValidObjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
  }
  
  module.exports = { isValid, isValidBody, validString, validMobileNum, validEmail, validPwd,isValidObjectId};