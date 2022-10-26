const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      // required:true
    },
    fname: {
      type: String,
      // unique:true
    },
    lname: {
      type: String,
      // unique:true
    },

    phone: {
      type: Number,
    },
    zip: {
      type: String,
      // unique:true
    },

    address: {
      type: String,
      // unique:true
    },
    email: {
      type: String,
      // unique:true
    },
    city: {
      type: String,
    },
    state: {
      type: String,
      // unique:true
    },
    landMark: {
      type: String,
    },
    orderStatus: {
      type: String,
      default: "Pending",
    },
    paymentType: {
      type: String,
    },
    paymentStatus: {
      type: String,
      default: "Pending",
    },
    orderId: {
      type: String,
    },
    grandTotal: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    //--------------------------------------------------
    couponDiscount: {
        type: Number,
      },
      subTotal:{
          type: Number
      },
      totalPaid:{
          type:Number
      },
      orderId:{
        type:String
      },
      razorId:{
        type:String
      },
    products: [

      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);
// couponSchema.plugin(uniqueValidator);
const OrderModel = mongoose.model("order", orderSchema);
module.exports = OrderModel;
