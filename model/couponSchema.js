const mongoose = require("mongoose")
const uniqueValidator = require('mongoose-unique-validator')
const couponSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    couponName:{
        type:String
    },
    code:{
        type:String,
        unique:true
    },
    offer:{
        type:Number
    },
    isUsed:{
        type:Boolean,
        default:false
    }
})
couponSchema.plugin(uniqueValidator);
const CouponModel = mongoose.model('coupon',couponSchema);
module.exports = CouponModel