const WhishlistModel = require('../model/whishlistSchema')
const CartData = require('../model/cartSchenma')
const CartModel = require('../model/cartSchenma');
const ProductsModel = require('../model/productsSchema');
const { findById } = require('../model/categorySchema');

//=========================================================== V I E W   W H I S H L I S T ====================================================

exports.whishlistRoute = async (req,res,next) =>{
    try {
        const logged = await utils.partialCheck(req);
        const user = await utils.getUser(req);
        const userId = user._id;
        const whislistData = await utils.getWhislistData(userId);
        console.log('//////////////////////////////',whislistData)
        res.render('users/whishlist',{
            userLoggedIn:logged,
            userId,whislistData
        });
    
    } catch (error) {
      next(error)
    }
}

//=========================================================== A D D   W H I S H L I S T ====================================================


exports.addWishlistRoute = async (req,res,next)=>{
    try {
        
        const user = await utils.getUser(req)
        const userId = user._id
        const productId = req.body.productId
    
        const whishlist = await WhishlistModel.findOne({ userId: userId }).lean()
        
        if (whishlist) {
            const productExist = await WhishlistModel.findOne({ userId: user,"products.product": productId })
        
            if (productExist) {
                await WhishlistModel.updateOne({ userId: user})
            }
            else {
                await WhishlistModel.findOneAndUpdate({ userId: user }, {
                    $push: {
                        products: {
                            product: productId
                        },
                    }
                })
            }
    
        } 
        else{
        await WhishlistModel.create({
            userId: user,
            products: { product: productId}
        })
    
        }
     
        // const isAdded = await CartModel.findById(productId)
        // if(isAdded){
        //    flag == true
        // }
        const hai=true
        
    
        res.status(200).json({
            message:'ethi',
           WhishlistModel
        })
    } catch (error) {
        next(error)
    }
}

//=========================================================== R E M O V E  W H I S H L I S T ====================================================

exports.removeWishlistRoute = async (req,res,next) => {

    // try {
        try {
            const user = await utils.getUser(req)
            const userId = user.id
            const productId = req.body.product
        
        
            await WhishlistModel.updateOne({
                userId: userId
            }, {
                $pull: {
                    products: {
                        product: productId
                    }
                }
            })
      
        
        
             res.status(200).json({ message: 'server success' })
            
        } catch (error) {
            next(error)
        }
        
    }

//=========================================================== A D D  T O  C A R T ====================================================

exports.pushCartRoute = async (req,res,next)=>{
    try {
        
        const user = await utils.getUser(req)
        const productId = req.body.productId
        const userId = user.id;
        const product = await ProductsModel.findById(productId);
        console.log('products>>:',product)
        const productPrice = product.price;
        const total = productPrice;
        
      
        
        const cart = await CartModel.findOne({ userId: userId }).lean()
      
      
        if (cart) {
          const productExist = await CartModel.findOne({ userId: user,"products.product": productId })
      
      
          if (productExist) {
              console.log('if products exists');
              await CartModel.updateOne({ userId: user, "products.product": productId },
              { $inc: {
                   "products.$.quantity": 1,
                   "products.$.total": total
                  }})
          }
      
          else {
              console.log("first else if condition-If products not exists");
              await CartModel.findOneAndUpdate({ userId: user }, {
                  $push: {
                      products: {
                          product: productId, quantity: 1,
                          total: total
                      },
                  }
              })
          }
      
      
      
      } else {
        console.log('else condition')
      
          await CartModel.create({
              userId: userId,
              products: { product: productId, quantity: 1, total: total },
              quantity:1
          })
      }
        console.log('ypppp',req.body)
    
        res.status(200).json({ message: 'server success' })
    } catch (error) {
        next(error)
    }
}
