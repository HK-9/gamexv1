const mongoose = require('mongoose')
const ProductsModel = require('../model/productsSchema')
const cartSchema = new mongoose.Schema({
     userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    grandTotal: {
      type: Number
    },
    discount:{
      type:Number
    },
    totalPayed:{
      type:Number
    },subTotal:{
      type:Number
    },
    couponDiscount:{
      type:Number 
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products"
        },
        quantity: { 
          type: Number,
        },
        total: {  //remove
          type: Number,
        },
        subTotal:{ 
          type:Number     //total sum of all products combined if no coupon
        },
        totalPaid:{
          type:Number     //total sum of all products, substracted from subtotal if couopon applied
        },
        couponDiscount:{
          type:Number
        },
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false,
    },
    ModifiedAt: {
      type: Date,
      default: Date.now(),
      // select: false,
    },
    },
    { timestamps: true }

)
const CartModel = mongoose.model('cart',cartSchema);
module.exports = CartModel