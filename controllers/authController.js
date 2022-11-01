// const jwt = require('express-jwt');
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const UsersModel = require("./../model/usersSchema");
const process = require("process");
const bcrypt = require("bcryptjs");
const AppError = require("./../util/AppError");
const { token } = require("morgan");
const { resolve } = require("path");
const { findOne, findOneAndUpdate } = require("../model/categorySchema");

// const { token } = require('morgan');

//==========================================REGISTRATION=========================================================//

exports.SubmitRoute = async (req, res) => {
  console.log(req.body);

  try {
    //UserModel holds the whole database and the schem and new fields assign to the new variable newUserModel.
    const newUserModel = await UsersModel.create(req.body);
    //payload - assigning only the object ID as payoad of the user using sign({what to add},secret,timeout)
    const token = jwt.sign({ id: newUserModel._id }, process.env.JWT_SECRET, {
      expiresIn: 9000,
    }); //token created

    //   newUserModel.token=token
    res.status(201)
    // .json({
    //   staus: "success",
    //   token,
    //   data: {
    //     user: newUserModel,
    //   },
    // });
    res.redirect('/login')
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err + "submit route error",
    });
    console.log(err);
  }
};

//=========================================LOGIN==========================================================//

exports.loginSubmit = async (req, res, next) => {
  try {
    // const emailid = req.body.emailid => here, emailid in both property and variable are same we can be destructure it into the following
    const { email, password } = req.body;
    
    //1) check if email and password exists
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "please enter a email and password",
      });
    }
    //2) check if he user exists and password is correct
    const user = await UsersModel.findOne({ email }).select("+password");
    //3) check if the user is blocked
    const blocked = user.status
    if(blocked==false){
      return res.status(401).json({
        status:'failed',
        message:'You are blocked'
      })
    }
    //check user exists DB            //check password
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.json({
        status: "fail",
        message: "Wrong password or username",
      });
    }
    //3) if user exists and a password is there send token to client
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      //token generated and issued for user
      expiresIn: 90000,
    });
     //4) check user varified OTP
    //  res.status(200).cookie('jwt',token).redirect('/')

     const otpVerify = user.IsOtpVerified;
     console.log('otpVerify:',otpVerify)
     if(otpVerify==false){
      const userId = user._id
      await UsersModel.updateOne({ _id: userId }, { $set: { IsOtpVerified: true } });
      return res.status(200).cookie('jwt',token).redirect('/otp')
     }
     res.status(200).cookie('jwt',token).redirect('/')
    
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Login catch block ",
      data:err
    });
  }
};
//======================================LOG OUT===================================================
exports.loggedOut = (req,res,next) => {
  res.cookie('jwt', 'loggedout',{
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.redirect('/login')
}
//======================================AUTH MIDDLEWARE===========================================

exports.protect = async (req, res, next) => {
  try {
    let token1
    console.log(req.cookies);
    const jwtCookie = req.cookies.jwt;
    //1) get the token and check if it is there
    if (req.headers.cookie.split(";")[1]) {
      token1 = await req.headers.cookie ;
      // console.log('after spliting',token1);
    }
    if (!token1) {
      console.log(" error");
      return res.status(401).json({
        status: "fail",
        message: "there no token in your header please login",
      });
    }

    //2)varification of token
    // console.log("msg", token1);
    const decoded = await jwt.verify(token1, process.env.JWT_SECRET);
    console.log(decoded);

    // 3)check user still exists  'id' is the token payload
    const freshUser = await UsersModel.findById(decoded.id);
    if (!freshUser) {
      return res.status(401).json({
        status: "fail",
        message: "the token belongs to the user does not exists",
      });
    }
    next();
  } catch {
    // res.status(401).json({
    //   status: "fail",
    //   message: "token is manipulated Access denied!",
    // });
    res.redirect('/login')
  }
};


//======================================OTP VARIFICATION===================================================
const serviceID = process.env.TWILO_SERVICE_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSID = process.env.TWILIO_ACCOUNT_SID;
const client = require('twilio')(accountSID,authToken);

exports.otpRoute = async (req,res,next)=>{
  // try {
    
    const user = await utils.getUser(req);  
    const phone = user.phone
  
    await client.verify
    .services(serviceID)
    .verifications
    .create({
      to:`+91${phone}`,
      channel:"sms"
    })
  
    res.render('users/otp')
  //   } catch (error) {
  //     console.log(error);
  //     res.redirect('/login')
  // }
}
exports.otpVerify = async(req,res,next) =>{
  // try {
    
    const user = await utils.getUser(req);
    const phone = user.phone
    const obj = req.body
    const otp = Object.values(obj).join('');
    console.log('otp form data:------',otp)
    client.verify
    .services(serviceID)
    .verificationChecks
    .create({
      to:`+91${phone}`,
      code: otp,
    })
    .then(resp => {
      
      console.log('otp res :',resp.valid)
      if(resp.valid){
       return res.redirect('/')
      }
      res.json({
        status:'failed',
        message:'the otp entered is not valid '
      })
    })
  // } catch (error) {
  //   console.log(error);
  //   res.redirect('/')
  // }
}