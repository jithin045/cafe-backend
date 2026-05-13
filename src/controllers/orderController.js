const Order = require("../models/Order");

// =========================
// TOKEN GENERATOR
// =========================
const getNextToken = async () => {
  const last = await Order.findOne().sort({ tokenNumber: -1 });
  return last?.tokenNumber ? last.tokenNumber + 1 : 101;
};

// =========================
// CREATE ORDER (REALTIME)
// =========================
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      tokenNumber: await getNextToken(),
      status: "PENDING",
    });

    // 🔥 REALTIME → KITCHEN
    global.io.emit("new-order", order);

    return res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// GET ALL ORDERS
// =========================
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// GET ORDER BY ID
// =========================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// GET ORDER BY TOKEN
// =========================
exports.getOrderByToken = async (req, res) => {
  try {
    const order = await Order.findOne({
      tokenNumber: req.params.token,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// UPDATE STATUS (REALTIME)
// =========================
exports.updateStatus = async (req, res) => {
  try {
    const allowed = ["PENDING", "PREPARING", "READY", "COMPLETED"];

    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 🔥 REALTIME UPDATE
    global.io.emit("order-updated", order);

    return res.json({
      success: true,
      order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// STATS
// =========================
exports.getOrderStats = async (req, res) => {
  try {
    const stats = {
      totalOrders: await Order.countDocuments(),
      pendingOrders: await Order.countDocuments({ status: "PENDING" }),
      preparingOrders: await Order.countDocuments({ status: "PREPARING" }),
      readyOrders: await Order.countDocuments({ status: "READY" }),
      completedOrders: await Order.countDocuments({ status: "COMPLETED" }),
    };

    const revenue = await Order.aggregate([
      { $match: { paymentStatus: "PAID" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    return res.json({
      success: true,
      stats: {
        ...stats,
        revenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};