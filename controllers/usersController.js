const UsersModel = require("./../model/usersSchema");
const ProductsModel = require("../model/productsSchema")
const jwt = require("jsonwebtoken");
const utils = require('../util/utils');
const CartModel = require("../model/cartSchenma");
const { findById } = require("../model/categorySchema");

exports.indexRoute =  async (req, res, next) => {
  try {
    const userId = await utils.getUser(req);
    const user = await UsersModel.findById(userId).lean()
    const cartData = await utils.cartDetails(userId)
    // const user = UsersModel.find().lean()
    const logged = await utils.partialCheck(req)
    const products = await ProductsModel.find().lean();
    res.render("users/index", { 
      userLoggedIn:logged,
      products,cartData,user,userId   
    });
    
      // res.render('admin/dashboard/products',{admin:true, layout: 'adminLayout',products})
  } catch (error) {
    next(error)
  }
};
exports.loginRoute = function (req, res, next) {

  res.render("users/login");
};
exports.productDetailRoute = async function(req,res,next){
  const logged = await utils.partialCheck(req)
  const user = await utils.userDetails(req)
  console.log('',user)
  res.render('users/productDetail',{
    userLoggedIn:logged,user
  }),
  next()
}
exports.registerRoute = function (req, res, next) {
  res.render("users/register");
};

exports.regSubmitRoute = async (req, res) => {
  console.log(req.body);

  try {
    const newUserModel = await UsersModel.create(req.body);
    res.status(201).json({
      staus: "success",
      data: {
        newUserModel,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
    console.log(err);
  }
};

//deleteuser
exports.deleteUserRouter = async (req, res, next) => {
  try {
    await UsersModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      dara: null,
    });
    await UsersModel.findByIdAndDelete(req.params.id);
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
  console.log(req.params);
};

//get all users
// exports.getAllUsers = async (req,res,next)=>{
//   const allUsers = await UsersModel.find(UsersModel)
// }

//====================================== P R O D U C T   D E T A I L   R  O U T E =============================//
try {
  exports.productDetailRoute =async (req,res,next) => {
  
    const userId = await utils.getUser(req);
    const cartData = await utils.cartDetails(userId)  
    const logged = await utils.partialCheck(req)
    let productId = req.params.id;  
    const byId = await ProductsModel.findById(productId).lean()
    const product = await ProductsModel.find().lean()
    token = await req.headers.cookie.split("=")[1];
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    user = await UsersModel.findById(decoded.id);
    
    res.render('users/products_detail',{
      product,byId,user,userLoggedIn:logged,
      layout: 'tempLayout',cartData,userId
    })
  } 
    
} catch (error) {
  next(error)
}

try {
  
  exports.testRoute = async (req,res,next) => {
    res.status(200).json({
      message:'ethilo'
    })
  },
  exports.cartDataNotifyRoute = async (req,res,next)=>{
    const userId = req.body.userId
    const getCartDataNotify = await utils.getCartDataNotify(userId);
    console.log('xxxxxxxxxx',getCartDataNotify);
    
    res.status(200).json({
      message:'Route is Successfull',
      data: getCartDataNotify
    })
  }
} catch (error) {
  next(error)
}