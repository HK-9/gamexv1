const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({
    userId:{
        type:String
    },
    fname:{
        type:String,
    },
    lname:{
        type:String
    },
    email:{
        type:String
    },
    phone:{
        type:Number
    },
    address:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    zip:{
        type:Number
    },
    landmark:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:false
      }
    
})
const AddressModel = mongoose.model('address',addressSchema);
module.exports = AddressModel