const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const AdminsModel = require("./../../model/adminsSchema");
const process = require("process");
const bcrypt = require("bcryptjs");
const mongoose = require('./../../db');
const { token } = require("morgan");
const { json } = require("body-parser");

//==========================================ADMIN-REGISTRATION=========================================================//

exports.registerRoute = (req, res, next) => {

  try {
    const newAdminModel = AdminsModel.create(req.body);
    const token = jwt.sign({ id: newAdminModel._id }, process.env.JWT_SECRET, {
      expiresIn: 9000,
    });
    res.status(200).json({
      status: "sucess",
      data: token,
      message: "token assigned",
    });
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err,
    });
  }
};

//==========================================ADMIN-LOGIN=========================================================//

exports.loginRoute = async (req, res, next) => {
    // const email = req.body.email;
    // const password = req.body.password
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "please enter a email and password",
      });
    }
	    const admin = await AdminsModel.findOne({ email }).select('+password')
    //check hashed password with unhashed req.body password 
    if (!admin || !(await admin.adminCorrectPassword(password, admin.password))) {
        return res.status(200).json({
        status: "fail",
        message: "password doesen't match or the user not exist",
      });
    }
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        //token generated and issued for user
        expiresIn: 90000,
    });
    res.status(200).cookie('jwt',token)
    // .json({
    //     staus: "success", 
    //     message: "token issued",
    //     token,
    //   });
    res.redirect('/admin/dashboard')
  } catch(err) {
    console.log(err);

    res.status(400).json({
        status: "fail",
        message: "Login catch block ",
        data: err
      });
  }
};


//======================================POTECTION MIDDLEWARE===========================================

exports.adminProtect = async (req, res, next) => {
  try {
    let token1;
    
    //1) get the token and check if it is there
    if (req.headers.cookie) {
      token1 = await req.headers.cookie.split("=")[1];
    }
    if (!token1) {
      return res.status(401).json({
        status: "fail",
        message: "there no token in your header please login",
      });
    }

    //2)varification of token
    const decoded = await jwt.verify(token1, process.env.JWT_SECRET);
    // 3)check user still exists
    const freshUser = await AdminsModel.findById(decoded.id);
    if (!freshUser) {
      return res.status(401).json({
        status: "fail",
        message: "the token belongs to the user does not exists",
      });
    }
    next();
  } catch {
    res.status(401).json({
      status: "fail",
      message: "token is manipulated Access denied!",
    });
  }
};
//======================================LOG OUT===================================================
exports.loggedOut = (req,res,next) => {
  try {
    
    res.cookie('jwt', 'loggedout',{
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.redirect('/admin')
  
  } catch (error) {
    next(error)
  }
} 