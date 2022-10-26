
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const process = require("process");
const bcrypt = require("bcryptjs");
const mongoose = require('./../../db');
const { token } = require("morgan");
const fs = require('fs')
const { json } = require("body-parser");
const ProductsModel = require("../../model/productsSchema");
const { fstat } = require("fs");
const { categoryRoute } = require("./categoryController");
const CategoryModel = require("../../model/categorySchema");
const path=require('path'); 

//----------------------VIEW PRODUCT---------------------------------------
exports.productsRoute = async (req,res,next) => {
  const products = await ProductsModel.find().lean();
    res.render('admin/dashboard/products',{admin:true, layout: 'adminLayout',products})
  }
  exports.addProductsRoute = async function (req,res,next) {
    const category = await CategoryModel.find().lean()
    res.render('admin/dashboard/addProducts',{
      admin:true,
      layout:'adminLayout',
      category
    })
  }
    //---------ProductEdit form---------
  exports.editProductsRoute = async (req,res,next)=>{
    const id = req.params.id
   
    try {
      const dbcat = await CategoryModel.find().lean()
      const product =  await ProductsModel.findById(id).lean()
      const files = req.files
      res.render('admin/dashboard/editProduct',{
        layout: 'adminLayout',
        admin:true,
        product,
        dbcat,
        id,
        })
    } catch (error) {
      res.status(400).json({
        status:'fail',
        message:error
      })
    }
  }
//----------------------ADD PRODUCT---------------------------------------
  exports.uploadProductRoute = async (req,res,next) =>{
  productsBody = JSON.parse(JSON.stringify(req.body));
   const files= req.files
   const imageArray = files.map(el=>el.filename)
   req.body.image = imageArray
    try {
      let originalPrice = req.body.price
      let discount = req.body.discount
      let discountPrice = originalPrice - (originalPrice * discount / 100)
     let productData = req.body;
     Object.assign(productData,{discountPrice:discountPrice})
    const newProductModel = await ProductsModel.create(productData)
    res.status(200).json({
      status:'sucess',
      data:newProductModel
    })
    
    } catch(error){
      console.log(error)
      res.status(401).json({
        error
        
      })  
    }

  }

//----------------------DELETE PRODUCT---------------------------------------
exports.deleteProduct = async (req,res,next) => {
  const id = req.params.id
  const imageData = await ProductsModel.findOne({_id: req.params.id}).lean()
  // console.log("imageData:",imageData)
  imageData.image.map(function (el){
    fs.unlink('public/multerimage/' + imageData.image[el],(err =>{
      if (err) console.log(err);
      else {{
        console.log('\nDeleted file:');
      }}
    }))
  })
  await ProductsModel.findByIdAndDelete({_id: req.params.id})
  res.redirect('/admin/products')
}

//----------------------EDIT PRODUCT---------------------------------------
exports.editProduct = async (req,res,next)=>{
  
  const files = req.files
  let imageArray = files.map(el => el.filename)
  req.body.image=imageArray;
  if (imageArray[0]) {
      let imageData = await ProductsModel.findOne({ _id: req.params.id }).lean()


      imageData.image.map((i) => fs.unlinkSync('public/multerimages/'+i))
    
      await ProductsModel.findByIdAndUpdate({ _id: req.params.id }, {
          $set:
          {
              "image": req.body.image,
              "title": req.body.title,
              "price": req.body.price,
              "discount": req.body.discount,
              "stock": req.body.stock,
              "category": req.body.category,
              "discription": req.body.discription
          }
      })
  }else{

  const id = req.params.id
  
  const newProduct = {
    title: req.body.title,
    price: req.body.price,
    discount: req.body.discount,
    stock: req.body.stock,
    category: req.body.category,
    discription: req.body.discription

  }  
  await ProductsModel.findByIdAndUpdate(id,newProduct)
  res.status(200)
  .redirect('/admin/products')
  // redirect('/admin/products')
  }

  
}