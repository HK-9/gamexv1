const ProductsModel = require('../model/productsSchema');
const AddressModel = require('../model/addressSchema')
const CartModel = require('../model/cartSchenma');
const UsersModel = require('../model/usersSchema');
const CouponModel = require('../model/couponSchema')
const utils = require('../util/utils'); 
const CategoryModel = require('../model/categorySchema');
const razorpay = require('../controllers/razorpayController')
const OrderModel = require ('../model/orderSchema');
const { findOne } = require('../model/adminsSchema');

//============================-V I E W   C H E C K O U T-===============================
exports.checkoutRoute = async (req, res, next) => {
    const product = await utils.getProduct(req)

    const logged = await utils.partialCheck(req)
    const user = await utils.getUser(req)
    const userData = user
    const userId = user._id
    const addressNotExist = await user.addresses;
    if(addressNotExist.length === 0){
        res.render("users/checkout",{
            userLoggedIn:logged,
            layout:'tempLayout',userData
        });
        return
    }
    address = await AddressModel.find({userId:userId}).lean()

    const uniqueUserAddressData = await UsersModel.findOne({_id:userId}).populate('addresses.address').lean()
    const activeAddressData = await AddressModel.findOne({userId:userId ,isActive:true}).lean()
    const cartData = await utils.cartDetails(userId)
    const couponUsed = user.isCouponUsed;
    const couponData = await CouponModel.find().lean()
    const ProductsGrandTotal = await utils.getProductsGrandTotal(userId)
    const subTotal = cartData.subTotal

        if(couponUsed === true){
            const couponOffer = await utils.getCouponOffer(userId);
           const couponDiscountPrice =  subTotal - (subTotal * couponOffer/100);
           
        
           await CartModel.updateOne({userId},{grandTotal:couponDiscountPrice})
           
           let couponDiscountedTotal = cartData.grandTotal
                couponDiscountedTotal = subTotal - couponDiscountedTotal
            
            const finalTotal = cartData.grandTotal
              
           // pushing discount price into cartdata.products *access-> {{#each cartData}} {{this.couponDiscount}}
            
           await CartModel.findOneAndUpdate({ userId: user }, {
        
                    couponDiscount: couponDiscountedTotal,
                    totalPayed:finalTotal,
                    subTotal:subTotal
        
        })
    

            res.render("users/checkout",{
                userLoggedIn:logged,
                layout:'tempLayout',
                uniqueUserAddressData,address,activeAddressData,cartData,
                couponUsed,
                couponData,
                couponDiscountedTotal,
                finalTotal,couponOffer

            });
            return
        }

        res.render("users/checkout",{
            userLoggedIn:logged,
            layout:'tempLayout',
            uniqueUserAddressData,address,activeAddressData,cartData,
            couponData,
        });
}

//============================ U P L O A D  A D D R E S S ===============================

exports.uploadAddress = async(req,res,next) => {
    try {
        
        user = await utils.getUser(req);  
        userId = user._id
        const fname = req.body.payload.fname;
        const lname = req.body.payload.lname;
        const email = req.body.payload.email;
        const phone = req.body.payload.phone;
        const address = req.body.payload.address;
        const city = req.body.payload.city;
        const state = req.body.payload.state;
        const zip = req.body.payload.zip;
        const landmark = req.body.payload.landmark;
    
                formData = req.body
                
        await AddressModel.create({
            userId:userId,
            fname:fname,
            lname:lname,
            email:email,
            phone:phone,
            address:address,
            city:city,
            state:state,
            zip:zip,
            landmark:landmark
        })
        
        
       const addressData = await AddressModel.find({userId:userId},{_id:1}).lean()
       const addressLen = addressData.length;
       const addressId = addressData[addressLen-1]
    
        id = userId
    
        await UsersModel.findOneAndUpdate({ _id: id }, {
            $push: {    
                addresses: {
                    address: addressId,
                },
            }
        })
        if(addressLen <= 1){
            await AddressModel.findOneAndUpdate({_id:addressId}, { isActive:true})
        }
        //   const  uniqueUserAddressData = await utils.getUserAddress(user.id) 
          const uniqueUserAddressData = await UsersModel.findOne({userId}).populate('addresses.address').lean();
          
    
        res.status(200).json({
            status:'success',
            message:'address added to database',
            data : uniqueUserAddressData
        })

    } catch (error) {
       next(error)
    }


}

//============================ R A Z O R   P A Y ===============================


exports.intiatePay = async (req, res, next) => {  
    try {
        
        req.body.paymentType = "Online Payment";
        
        const user = await utils.getUser(req)
        const userId = user._id
        const paymentMethod = req.body.payment
        
        const  addressData = await utils.getUserAddress(userId)
        const cartData = await utils.cartDetails(userId);
            //have
            const grandTotal = cartData.grandTotal;
            const couponDiscount = cartData.couponDiscount;
            const totalPayed = cartData.totalPayed;
            const subTotal = cartData.subTotal;          
            req.body = addressData,grandTotal,totalPayed,subTotal,couponDiscount
            // quantity,price,discount;
        
            req.body.products = cartData.products
            const productId = await CartModel.findOne({userId:userId},{_id:0,"products.product":1})
            let id = productId.products
            
            await OrderModel.create(req.body)
          
          const orderData = await OrderModel.findOne({userId:userId}).sort({_id:-1}).limit(1).lean()
          const orderId = orderData._id
          await OrderModel.findOneAndUpdate({_id:orderData._id},{grandTotal:grandTotal})
          const populatedOrderData = await utils.getPopulatedOrder(userId)
        
          await OrderModel.updateOne({userId:userId,_id:orderId},
          {
             couponDiscount:couponDiscount,
             subTotal:subTotal,
             totalPayed:totalPayed,
             orderStatus:"confirmed",
             paymentType:paymentMethod
          //     'products.$.subTotal':subTotal,
          //   'products.$.couponDiscount':couponDiscount,
          //   'products.$.totalPayed':totalPayed
            })
            amountPaid = orderData.totalPaid
            totalAmounts = amountPaid * 100;
            razorData = await razorpay.intiateRazorpay(orderData._id, cartData.totalAmounts);
            await OrderModel.findOneAndUpdate({ _id: orderData._id }, { orderId: razorData.id });
            razorId = process.env.RAZOR_PAY_ID;
            
            // req.session.confirmationData = { orderDataPopulated, amountPaid };
            
           return res.json({ message:'success',totalAmounts,razorData,orderData});
   } catch (error) {
   next(error)
   }
    
}

