import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";


async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once"
  });
  return coupon.id
}


export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid or empty products array" });
    }
    let totalAmount = 0;
    const lineItems = products.map(product => {
      const amount = Math.round(product.price * 100);
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image]
          },
          unit_amount: amount
        },
        quantity: product.quantity || 1,
      }
    });
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
      if (coupon) {
        totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100)
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon ? [
        {
          coupon: await createStripeCoupon(coupon.discountPercentage)
        }
      ] : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price
          }))
        ),
      },
    });
    return res.status(200).json({ id: session.id, totalAmount: totalAmount });
  } catch (error) {
    return res.status(500).json({ message: "Error processing checkout", error: error.message });
  }
}

export const checkoutSuccess = async (req, res) => {

  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId
          },
          {
            isActive: false
          }
        )
      }
      const products = JSON.parse(session.metadata.products);
      await Order.findOneAndUpdate(
        { stripeSessionId: sessionId },
        {
          userId: session.metadata.userId,
          products: products.map(product => ({
            product: product.id,
            quantity: product.quantity,
            price: product.price,
          })),
          totalAmount: session.amount_total / 100,
          stripeSessionId: sessionId,
        },
        { upsert: true, new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Payment successful, order created and coupon deactivated if used"
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error processing successful checkout", error: error.message });
  }
}