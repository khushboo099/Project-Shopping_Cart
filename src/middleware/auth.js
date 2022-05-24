const jwt = require('jsonwebtoken');
const { isValid} = require('../utils/validation');
const userModel = require('../models/userModel');

const authentication = (req, res, next) => {
  try {
    let token = req.headers['x-Api-key'];
    if (!token) {
      token = req.headers['x-api-key'];
    }
    if (!token) return res.status(400).send({ status: false, message: "Token is not Present" });

    let decodedToken = jwt.verify(token, "Uranium Project-5");
    if (!decodedToken) return res.status(401).send({ status: false, message: "it is not a Valid Token" })
    //req.decodedToken = decodedToken;
    next();
  } catch (err) {
    if(err.message == "jwt expired") return res.status(400).send({ status: false, message: "JWT token has expired, login again" })
    if(err.message == "invalid signature") return res.status(400).send({ status: false, message: "Token is incorrect" })
    res.status(500).send({ status: false, error: err.message })
  }
}

const authorization = async (req, res, next) => {
  try {
    let loggedInUser = decodedToken.userId;
    let userLogging;

      if (!isValid(req.params.userId)) return res.status(400).send({ status: false, message: "Enter a valid user id" });
      let userData = await userModel.findById(req.params.userId);
      if (!userData) return res.status(404).send({ status: false, message: "Error! Please check user id and try again" });
      userLogging = userData._id.toString();
    

    if (!userLogging) return res.status(400).send({ status: false, message: "User Id is required" });

    if (loggedInUser !== userLogging) return res.status(403).send({ status: false, message: 'Error, authorization failed' })
    next()
  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}
module.exports = { authentication, authorization };