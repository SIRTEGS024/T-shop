import Coupon from "../models/coupon.model.js";

export const createNewCoupon = async (req, res) => {
  try {
    const { userId } = req.body;
    await Coupon.findOneAndDelete({ userId })
    const newCoupon = new Coupon({
      code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      discountPercentage: 10,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userId: userId
    });
    await newCoupon.save();
   return res.status(200).json({ newCoupon });
  } catch (error) {
    return res.status(500).json({ message: "Error creating coupon" });
  }

}

export const getCoupon = async (req, res) => {

  try {
    const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
    return res.json(coupon || null);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      coupon.save();
      return res.status(404).json({ message: "Coupon expired" });
    }
    return res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      expirationDate: coupon.expirationDate
    })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
