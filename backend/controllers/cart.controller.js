import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {

  try {
    const { productId } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find(item => item._id.toString() === productId.toString());

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }
    await user.save();
    return res.json(user.cartItems);

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const getCartProducts = async (req, res) => {

  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(cartItem => cartItem._id.toString() === product._id.toString());
      return { ...product.toJSON(), quantity: item.quantity }
    });
    return res.json(cartItems);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const removeAllFromCart = async (req, res) => {

  try {
    const {id:productId } = req.params;
    const user = req.user;
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter(item => item._id.toString() !== productId.toString());
    }
    await user.save();
    return res.json(user.cartItems);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const updateQuantity = async (req, res) => {

  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find(item => item._id.toString() === productId.toString());
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(item => item._id.toString() !== productId.toString());
        await user.save();
        return res.json(user.cartItems);
      }
      existingItem.quantity = quantity;
      await user.save();
      return res.json(user.cartItems);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

