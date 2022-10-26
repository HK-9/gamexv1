const mongoose = require('mongoose')
const CategoryModel = require('../../model/categorySchema')

exports.categoryRoute = async (req, res, next) => {
    
    const category = await CategoryModel.find().lean()
    res.render("admin/dashboard/category", {
      admin: true,
      layout: "adminLayout",
      category,
      isEmpty: false
    }); 
  
    if(CategoryModel.findById()){
      isEmpty = false
    }

  };


//category page render
exports.addCategoryRoute = (req,res,next) => {
  res.render('admin/dashboard/add_category',{
    admin:true,
    layout: 'adminLayout',
   
  })
}
//-------------------------ADD CATEGORY-----------------------------------
exports.uploadCategoryRoute = async (req,res,next) => {
  category = JSON.parse(JSON.stringify(req.body));
  console.log('6666666',category);
  try{
newCategoryModel = await CategoryModel.create(category)
res.status(200).redirect('/admin/category')
}catch(err){
  res.status(200)
  .json({
    status:'fail',
    message:'Category field already exists',
    data:err
  })
}
}

//-------------------------DELETE CATEGORY-----------------------------------

exports.delete_category = async (req,res,next) =>{
  catId = req.params.id
  await CategoryModel.findByIdAndDelete({_id: catId})
  res.redirect('/admin/category')

}                                        

//------------------------EDIT CATEGORY-----------------------------------

exports.editCategoryRoute = async (req,res,next) => {
  const category = await CategoryModel.find().lean() 
  const id = req.params.id

  res.render('admin/dashboard/edit_category',{
    admin: true,
    layout: 'adminLayout',
    category,
    id
  })
 
  console.log(req.params.id)
  

}


exports.editedCategoryRoute = async (req,res,next) => {
//  res.render
try{
  let dbCat = await CategoryModel.find().lean()
  let id = req.params.id
  const newCat = req.body
  // newCat = JSON.parse(JSON.stringify(req.body));
 
  await CategoryModel.findByIdAndUpdate(id,req.body)
  res.redirect('/admin/category')
}catch(err){
  res.send(err)
}

}

