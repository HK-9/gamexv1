const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  phone: {
    type: Number,
    required: [true, "phone number shold contain a field"],
    unique: true,
    maxlength: [10, "a phone number should have atleast 10 charecters"],
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    select: false,
  },
  conpassword: {
    type: String,
  },
  addresses:[
    {
    address:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "address"
    }
  }
  ],
  couponId:{
    type:String
  },
  date:{
   type:Date,
   default: Date.now 
  },
  status:{
    type:Boolean,
    default:true
  },
  IsOtpVerified:{
    type:Boolean,
    default:false
  },isCouponUsed:{
    type:Boolean,
    default:false
  }


},{timestamps:true});
 userSchema.plugin(uniqueValidator);

//Only run if the password modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  //delete the password confirm field
  this.conpassword = undefined;
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //compare the unhashed password candidate entered and hash it by the compare(unhashed,hashed) method
  return await bcrypt.compare(candidatePassword, userPassword);
};

const UsersModel = mongoose.model("User", userSchema);
module.exports = UsersModel