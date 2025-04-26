import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" })
    }
    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
      category
    });
    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const deleteProduct = async (req, res) => {

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];

      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        throw error;
      }
      await Product.findByIdAndDelete(req.params.id);
      if (product.isFeatured) {
        await featuredProductsCache();
      }
      return res.json({ message: "Product deleted successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}


export const getAllProducts = async (req, res) => {

  try {
    const products = await Product.find({});
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const getFeaturedProducts = async (req, res) => {

  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }
    featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    return res.json(featuredProducts);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const getRecommendedProducts = async (req, res) => {

  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        }
      }
    ]);
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const toggleFeaturedProduct = async (req, res) => {

  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await featuredProductsCache();
      return res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const featuredProductsCache = async (req, res) => {

  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in update cache function", error.message);

  }
}