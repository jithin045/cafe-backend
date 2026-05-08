const Order = require("../models/Order");

// 🔢 generate next token safely
const getNextToken = async () => {
    const lastOrder = await Order.findOne().sort({ tokenNumber: -1 });

    if (!lastOrder || !lastOrder.tokenNumber) return 101;

    return lastOrder.tokenNumber + 1;
};

//
// 🧾 CREATE ORDER
//
exports.createOrder = async (req, res) => {
  try {
    const nextToken = await getNextToken();

    const order = await Order.create({
      customerName: req.body.customerName,
      phone: req.body.phone,
      tableNumber: req.body.tableNumber,
      paymentMethod: req.body.paymentMethod,

      items: req.body.items,
      totalAmount: req.body.totalAmount,

      tokenNumber: nextToken,

      // DEFAULT STATUS
      status: "PENDING",

      // 🔥 IMPORTANT: allow Stripe flow
      paymentStatus: (req.body.paymentStatus || "PENDING").toUpperCase(),

      // 🔥 STORE STRIPE SESSION ID (NEW)
      stripeSessionId: req.body.stripeSessionId || null,
    });

    return res.status(201).json({
      success: true,
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//
// 📦 GET ALL ORDERS (dashboard)
//
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            orders,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//
// 🔍 GET ORDER BY ID
//
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//
// 🔍 GET ORDER BY TOKEN (for customer tracking)
//
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

        return res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//
// 🔄 UPDATE STATUS (staff)
//
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};