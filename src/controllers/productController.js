const Product = require("../models/Product");

// Create Product (Admin use)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Products (Menu)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ available: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};