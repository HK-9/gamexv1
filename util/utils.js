const jwt = require('jsonwebtoken')
const UsersModel = require("../model/usersSchema");
const ProductsModel = require('../model/productsSchema');
const CartModel = require('../model/cartSchenma');
const WhishlistModel = require('../model/whishlistSchema');
const CouponModel = require('../model/couponSchema');
const AddressModel = require('../model/addressSchema')
const OrderModel = require('../model/orderSchema')

utils = {
    getUser: async function (req) {
      try {
      token = await req.headers.cookie.split("=")[1];
      const payLoad = await jwt.verify(token, process.env.JWT_SECRET);
      userId = await UsersModel.findById(payLoad.id)
      return userId;        
      } catch (error) {
        // console.log('USER NOT LOGGED IN',error)
      }
        
    },
  getProduct: async function(req){
    productId = req.params.id
  },

  partialCheck: async (req)=>{
    let logged;
    const products = await ProductsModel.find().lean();
    partialCheck = req.headers.cookie 
    if(partialCheck){
     logged = true
    }else if (!partialCheck) {
      logged = false
    }
    return logged
  },

  cartDetails: async (userId)=>{
    const cartData = await CartModel.findOne({userId}).populate('products.product').lean()
    return cartData
  },
  getPopulatedOrder: async (userId) =>{
    const populatedOrderData = await OrderModel.findOne({userId}).populate('products.product').lean()
    return populatedOrderData
  },
  getWhislistData:async (userId)=>{
    const whishlistData = await WhishlistModel.findOne({userId}).populate('products.product').lean()
    return whishlistData
  },

  getProductsGrandTotal: async (userId) =>{
    
    const cartData = await CartModel.findOne({userId}).populate('products.product').lean()
    let products = cartData.products;
    //console.log('total---------------:',products[0].total)
    let total = products[0].total
    total = total*2
    total = products.reduce((acc,curr)=>{
      return acc += curr.total;
    },0)
    await CartModel.updateOne({userId})
    return total
  },
  getCartDataNotify: async (userId)=>{
    const cartData = await CartModel.findOne({userId}).populate('products.product').lean()
    const dataNotifyCount = cartData.products.length; 
    // console.log('hai',dataNotifyCount)
    return dataNotifyCount;
  },
  getUserAddress: async(userId) => {
    // const userAddressData = await UsersModel.findOne({_id:userId}).populate('addresses.address').lean()
    // //  console.log('populatedAddress',userAddressData)
    // return userAddressData;
    const activeAddressData = await AddressModel.findOne({userId:userId ,isActive:true},{_id:0}).lean()
    return activeAddressData
  },
  getCouponOffer: async(userId) => { //populated method 
    const user = await UsersModel.findById(userId)
    const couponId = user.couponId;
    const couponData = await CouponModel.findById(couponId)
    const couponOffer = couponData.offer
    return couponOffer
  },
  getCouponDiscount: async (couponOffer) =>{ //call utils.getCoupnOffer and pass the data while calling this function as parameter
    const couponDiscountPrice =  ProductsGrandTotal - (ProductsGrandTotal * couponOffer/100);
    return couponDiscountPrice
  },  
  findDiscount: async(userId) => {
    const cartData = await CartModel.findOne({userId}).populate('products.product').lean()
    let couponDiscountedTotal = cartData.grandTotal
    couponDiscountedTotal = ProductsGrandTotal - couponDiscountedTotal
    const finalTotal = cartData.grandTotal;
    return couponDiscountedTotal
  },
  isCouponUsed: async(userId) =>{
    const userData = await UsersModel.findById(userId).lean()
    const couponUsed = userData.isCouponUsed;
    return couponUsed
  },

  // getCouponDiscount: async() 



}
//HOW TO USE >> getResult = utils.getGrandTotal(userId) 
module.exports = utils;
