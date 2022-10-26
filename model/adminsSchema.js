const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// var uniqueValidator = require("mongoose-unique-validator");

const adminSchema = new mongoose.Schema({
  email: {
    type: String
  },
  password: {
    type: String,
    select: false,
  },
  conpassword: {
    type: String,
  }
});
//  adminSchema.plugin(uniqueValidator);

//Only run if the password modified
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  //delete the password confirm field
  this.conpassword = undefined;
  next();
});
adminSchema.methods.adminCorrectPassword = async function (

  candidatePassword,
  adminPassword
) {
  //compare the unhashed password candidate entered and hash it by the compare(unhashed,hashed) method
  return await bcrypt.compare(candidatePassword, adminPassword);
};

const AdminsModel = mongoose.model("Admin", adminSchema);
module.exports = AdminsModel;
