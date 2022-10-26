const mongoose = require('mongoose');
const categoryModel = require('../model/categorySchema')
const productsSchema = mongoose.Schema({
    image:{
        type: Array 
    },
    title:{
        type: String
    },
    price:{
        type: Number   
    },
    discount:{
        type: Number 
    }, 
    discountPrice:{
        type: Number
    },
    stock:{
        type: Number
    },
    category:{
        // type:mongoose.Schema.ObjectId,
        // ref:'CategoryModel'
        type:String
    },
    discription:{       
        type: String 
    },
    quantity:{
        type:Number,
    },
    
})
const ProductsModel = mongoose.model('products',productsSchema)
module.exports = ProductsModel