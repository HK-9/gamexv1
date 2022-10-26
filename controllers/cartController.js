const { token } = require('morgan');
const { rawListeners } = require('../model/cartSchenma');
const CartModel = require('../model/cartSchenma');
const ProductsModel = require('../model/productsSchema');
const productDetailRoute = require('../controllers/usersController')
const utils = require('../util/utils'); 
const { findById } = require('../model/usersSchema');
const userId = utils.get

//============================-V I E W   C A R T-===============================

  exports.cartRoute = async function (req, res, next) {
    try {
      
      const logged = await utils.partialCheck(req)
       const user = await utils.getUser(req)
        const cartData = await utils.cartDetails(user._id)
        const cart = CartModel.find().lean()
        
        res.render("users/cart",{
            cart,
            cartData,
            userLoggedIn:logged,
            layout:'tempLayout',user
        });
    } catch (error) {
      next(error)
    }
  };


//============================ U P L O A D  C A R T ===============================

exports.uploadCartRoute = async (req,res,next)=>{
  try{
  const user = await utils.getUser(req)
  let count = req.body.quantity
  let numProduct = req.body.numProduct
  const productId = req.params.id
  const userId = user.id;
  const value = JSON.parse(JSON.stringify(req.body.numProduct));
  const product = await ProductsModel.findById(productId);
  const productPrice = product.discountPrice;
  const total = numProduct*productPrice;
  

  
  const cart = await CartModel.findOne({ userId: userId }).lean()


  if (cart) {
    const productExist = await CartModel.findOne({ userId: user,"products.product": productId })


    if (productExist) {
    let GetFinalTotal = cart.products[0].total
     let finalTotal = GetFinalTotal*numProduct;

        console.log('if products exists');
        await CartModel.updateOne({ userId: user, "products.product": productId },
        { $inc: {
             "products.$.quantity": value,
             "products.$.price":total,
             "products.$.total": total,
            }})
        await CartModel.updateOne({userId: user, "products.product": productId},{
          "products.$total": finalTotal,
          "product.$price":finalTotal
        })
    }

    else {
        console.log("first else if condition-If products not exists");
        await CartModel.findOneAndUpdate({ userId: user }, {
            $push: {
                products: {
                    product: productId, 
                    quantity: value,
                    total: total,
                    price:total
                },
            }
        })
    }



} else {
  console.log('else condition22')

    await CartModel.create({
        userId: userId,
        products: { product: productId, quantity: value, total: total, price:total },
        quantity:value
    })
}

// cartData = await CartModel.find().populate('products.product').lean()

res.status(200).redirect('/cart')

} catch (error) {

res.status(401).json({ message: "Oops! Process failed", error: `error is : ${error}` })
next(error)

}

}

//============================ I N C R E M  E N T  C A R T  P R O D U C T  Q U A N T I T Y ====================================


exports.updateQty = async (req,res,next) => {
 try {
  const userId = await utils.getUser(req)
  let productId = req.body.product
  let count = req.body.quantity
  const product = await ProductsModel.findById(productId);
  let price = product.discountPrice
  let cart = await CartModel.findOne({userId:userId}).lean()
  let total = price*count
    //increment quantity
  const updateQty = await CartModel.updateOne({userId:userId,'products.product':productId},
  {'products.$.quantity':count,
    'products.$.total':total
    })
  
  res.json({msg: 'ethi',
  cart:cart,
  productPrice:total
})
  const productData = await CartModel.findOne().populate('products.product').lean()



 } catch (error) {
  console.log('update quantity error block',error)
  next(error)
 }

}

//===============================-G R A N D  P R O D U C T  P R I C E-====================================

exports.getProductGrandTotal = async (req,res,next)  => {
  
  try {
    const user = await utils.getUser(req)
    console.log('user:',user);
     const userId = user._id 
       let productGrandTotal = await utils.getProductsGrandTotal(userId);
       const cartData = await CartModel.findOne({userId}).populate('products.product').lean()
       await CartModel.findOneAndUpdate({userId},{subTotal:productGrandTotal})
       let products = cartData.products;
       return res.json({
         status:'success',
         message:'ethi',
          price: productGrandTotal
       })
  } catch (error) {
    res.render('/login');
  }

 

}

//===============================--D E L E T E  C A R T   I T E M-====================================

exports.deleteCart = async (req,res,next) => {

  try {
    const user = await utils.getUser(req);
    const userId = user.id
    const productId = req.body.product
    await CartModel.updateOne({
        userId: userId
    }, {
        $pull: {
            products: {
                product: productId
            }
        }
    })
    return res.status(200).json({ message: 'server success' })

} catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'server failure' })


}
}










