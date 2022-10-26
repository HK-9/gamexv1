const { create } = require("hbs");
const CouponModel = require("../../model/couponSchema");
const UsersModel = require("../../model/usersSchema");
const utils = require("../../util/utils");
//============================================ C O U P O N   A D D   F O R M  A D M I N   S E C T I O N ==============================================

exports.viewCouponRoute = async (req, res, next) => {
  try {
    res.render("admin/dashboard/coupons", {
      admin: true,
      layout: "adminLayout",
    });
  } catch (error) {
    next(error);
  }
};

//============================================ C O U P O N   S U B M I T  A D M I N  S E C T I O N ==============================================
try {
  exports.submitCouponRoute = async (req, res, next) => {
    const couponName = req.body.name;
    const couponCode = req.body.code;
    const coupondiscount = req.body.discount;
    await CouponModel.create({
      couponName: couponName,
      code: couponCode,
      offer: coupondiscount,
    });
    res.redirect("/admin/coupons");
  };
} catch (error) {
  next(error);
}

//============================================ C O U P O N   R E D E E M  U S E R  S E C T I O N ==============================================

exports.redeemCouponRoute = async (req, res, next) => {
  try {
    const user = await utils.getUser(req);
    const userId = user._id;
    const couponId = req.body.couponId;

    const userData = await UsersModel.findById(userId).lean();
    const isCouponUsed = userData.isCouponUsed;

    if (isCouponUsed == false) {
      //here you are only pushing the coupon Id inorder to use populate method.
      await UsersModel.findOneAndUpdate(
        { _id: userId },
        { couponId: couponId }
      );
      await UsersModel.findOneAndUpdate(
        { _id: userId },
        { isCouponUsed: true }
      );
    }
    // const couponData = await UsersModel.findOne({_id:userId}).populate('coupons.coupon').lean()

    // await UsersModel.updateOne({})
    res.status(200).json({
      status: "success",
      message: "yeah keep up buddy",
    });
  } catch (error) {
    next(error)
  }

};
