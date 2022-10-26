const mongoose = require("mongoose")
const uniqueValidator = require('mongoose-unique-validator')
const categorySchema = new mongoose.Schema({
    category:{
        type:String,
        unique:true
    }
})
categorySchema.plugin(uniqueValidator);
const CategoryModel = mongoose.model('category',categorySchema);
module.exports = CategoryModel