const mongoose = require('mongoose')
const ProductsModel = require('../model/productsSchema')
const whishlistSchema = new mongoose.Schema({

     userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products"
        }
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
const WhishlistModel = mongoose.model('whishlist',whishlistSchema);
module.exports = WhishlistModel