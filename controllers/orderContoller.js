const ProductsModel = require("../model/productsSchema");
const CartModel = require("../model/cartSchenma");
const UsersModel = require("../model/usersSchema");
const CouponModel = require("../model/couponSchema");
const OrderModel = require("../model/orderSchema");

//put code here for cod and payment.
exports.confirmOrderRoute = async (req, res, next) => {
  const user = await utils.getUser(req);
  const userId = user._id;
  const paymentMethod = req.body.payment;

  const addressData = await utils.getUserAddress(userId);
  console.log("addressData", addressData);
  const cartData = await utils.cartDetails(userId);
  //have
  const grandTotal = cartData.grandTotal;
  const couponDiscount = cartData.couponDiscount;
  const totalPayed = cartData.totalPayed;
  const subTotal = cartData.subTotal;
  // console.log('@discount',couponDiscount)

  (req.body = addressData), grandTotal, totalPayed, subTotal, couponDiscount;
  // quantity,price,discount;

  req.body.products = cartData.products;
  const productId = await CartModel.findOne(
    { userId: userId },
    { _id: 0, "products.product": 1 }
  );
  let id = productId.products;

  await OrderModel.create(req.body);

  const orderData = await OrderModel.findOne({ userId: userId })
    .sort({ _id: -1 })
    .limit(1)
    .lean();
  const orderId = orderData._id;
  await OrderModel.findOneAndUpdate(
    { _id: orderData._id },
    { grandTotal: grandTotal }
  );
  const populatedOrderData = await utils.getPopulatedOrder(userId);

  await OrderModel.updateOne(
    { userId: userId, _id: orderId },
    {
      couponDiscount: couponDiscount,
      subTotal: subTotal,
      totalPayed: totalPayed,
      orderStatus: "confirmed",
      paymentType: paymentMethod,
      //     'products.$.subTotal':subTotal,
      //   'products.$.couponDiscount':couponDiscount,
      //   'products.$.totalPayed':totalPayed
    }
  );
  res.status(200).json({
    status: "success",
    data: {
      payment: paymentMethod,
      orderData,
      cartData,
      populatedOrderData,
    },
  });
};

//==================================== C O D  P A G E  R E N D E R  R O U T E ====================================
exports.renderCodRoute = async (req, res, next) => {
  try {
    const logged = await utils.partialCheck(req);
    const user = await utils.getUser(req);
    const userId = user._id;
    const orderData = await OrderModel.findOne({ userId: userId })
      .sort({ _id: -1 })
      .limit(1)
      .lean();
    const orderId = orderData._id;
    const populatedOrderData = await OrderModel.findOne({
      userId: userId,
      _id: orderId,
    })
      .populate("products.product")
      .lean();
    console.log("lastelement@", orderData, populatedOrderData, orderId);
    const priceOrder = await CartModel.findOne({ userId }).populate("products");

    res.render("users/codDelivery", {
      layout: "tempLayout",
      userLoggedIn: logged,
      orderData,
      populatedOrderData,
      priceOrder,
    });
  } catch (error) {
    next(error);
  }
};
