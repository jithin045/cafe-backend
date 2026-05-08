const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  updateStatus,
  getOrderById,
  getOrderByToken,
} = require("../controllers/orderController");

// 📦 create order
router.post("/", createOrder);

// 📦 get all orders
router.get("/", getOrders);

// 🔍 get order by id
router.get("/:id", getOrderById);

// 🔍 get order by token
router.get("/token/:token", getOrderByToken);

// 🔄 update status
router.patch("/:id", updateStatus);

module.exports = router;