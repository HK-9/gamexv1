const AdminModel = require("../../model/adminsSchema");
const UsersModel = require("../../model/usersSchema");
const ProductsModel = require("../../model/productsSchema");
const OrderModel = require("../../model/orderSchema");
const utils = require('../../util/utils'); 

//--------------------VIEW ROUTES------------------------------------------
exports.loginRoute = (req, res) => {
  res.render("admin/login", { 
    layout: "adminLayout",
    title: 'title' 
  });
};
exports.indexRoute = async (req, res, next) => {
  const codCount = await OrderModel.countDocuments({paymentType:"cod"}).exec()
  const creditCardCount = await OrderModel.countDocuments({paymentType:"creditCard"}).exec()
  const totalSales = codCount + creditCardCount

  const orderData = await OrderModel.find().lean()
  let placed,shipped,delivered,cancelled;
  let UorderData = await OrderModel.find().lean()
  if(UorderData.orderStatus == 'confirmed') {placed=true}
  else if(UorderData.orderStatus=='shipped') {shipped = true;}
  else if(UorderData.orderStatus=='delivered') {delivered = true}
  else if(UorderData.orderStatus=='cancelled') {cancelled = true}
  // cont onlinePayement = await OrderModel.findOne({paymentStatus:"card"}) 

  let orderData1 = await OrderModel.find().populate('products.product').lean()
   
  const deliveredOrder = orderData1.filter(e=>e.orderStatus=='delivered')
  console.log("deliveredOrder",deliveredOrder);
  
  const TotalRevenue = deliveredOrder.reduce((accr,crr)=>accr+crr.subTotal,0)
  
  console.log("subTotal",TotalRevenue);
  
  const users = UsersModel.countDocuments().exec()
  const usersCount = users.length; 

  const eachDaySale = await OrderModel.aggregate([{$match:{orderStatus:"delivered"}},{$group: {_id: {day: {$dayOfMonth: "$createdAt"},month: {$month: "$createdAt"}, year:{$year: "$createdAt"}},total: {$sum: "$subTotal"}}}]).sort({createdAt: -1})
  res.render("admin/index", { admin: true,
     layout: "adminLayout",
     title:"Admin | Login",
     codCount,placed,shipped,delivered,cancelled,orderData,creditCardCount,eachDaySale,TotalRevenue,orderData1,totalSales,usersCount
     });
};

exports.allUsersRoute = async (req, res, next) => {
  const users = await UsersModel.find().lean();
  console.log(users);
  res.render("admin/dashboard/users", {
    admin: true,
    layout: "adminLayout",
    users
  });                                                                                                                                                                                                                   
};
//==================== O R D E R S   V I E W ========================

exports.ordersRoute = async (req, res, next) => {
  const orderData = await OrderModel.find().lean()
  let placed,shipped,delivered,cancelled;
  let UorderData = await OrderModel.find().lean()
  if(UorderData.orderStatus == 'confirmed') {placed=true}
  else if(UorderData.orderStatus=='shipped') {shipped = true;}
  else if(UorderData.orderStatus=='delivered') {delivered = true}
  else if(UorderData.orderStatus=='cancelled') {cancelled = true}
  
  // const userData = await OrderModel.find().populate("users").lean()
  res.render("admin/dashboard/orders",
  { 
    admin: true, layout: "adminLayout",
    orderData,
    placed,shipped,delivered,cancelled,orderData
  });
};

exports.ordersEditRoute = async (req, res, next) => {
  
  let placed,shipped,delivered,cancelled;
  let orderId = req.params.id
  let orderData = await OrderModel.findOne({_id:orderId}).lean()

  if(orderData.orderStatus == 'confirmed') {placed=true}
  else if(orderData.orderStatus =='shipped') {shipped = true;}
  else if(orderData.orderStatus =='delivered') {delivered = true}
  else if(orderData.orderStatus =='cancelled') {cancelled = true}
  
  
  res.render('admin/dashboard/editOrderStatus',{
    admin: true, layout: "adminLayout",
    placed,shipped,delivered,cancelled,orderData
  })
}


    //-------------------------ACTION ROUTES------------------------------------------
    
    exports.editStatusButton=async(req,res)=>{
      let orderId = req.params.id
      // console.log("params id:",orderId)
      // console.log("req.body",req.body)
      await OrderModel.findOneAndUpdate({_id:orderId},{$set:{orderStatus:req.body.status}})
      res.redirect('/admin/orders');
    }

    //----------------------USER BLOCK/UNBLOCK--------------------------------
exports.blockUserRoute = async (req, res, next) => {
  try {
    const userId = req.params.id;

    await UsersModel.updateOne({ _id: userId }, { $set: { status: false } });

    res.redirect("/admin/allUsers");
  } catch (err) {
    res.send(err);
  }
};

exports.unblockUserRoute = async (req, res, next) => {
  try {
    const userId = req.params.id;

    await UsersModel.updateOne({ _id: userId }, { $set: { status: true } });

    res.redirect("/admin/allUsers");
  } catch (err) {
    res.send(err);
  }
};

//---------------------- S A L E S   R E P O R T ---------------------------------------

exports.salesReportRoute = async (req,res,next) => {
  try {
    const orderData = OrderModel.findOne().lean()
    res.render("admin/dashboard/salesReport",{
      admin: true, layout: "adminLayout",
      orderData
    })
    
  } catch (error) {
    console.log(error)
  }
}

