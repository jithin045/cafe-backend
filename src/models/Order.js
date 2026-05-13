const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: String,
    phone: String,
    tableNumber: String,
    paymentMethod: String,

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    tokenNumber: {
      type: Number,
      unique: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PREPARING", "READY", "COMPLETED"],
      default: "PENDING",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    stripeSessionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// IMPORTANT FIX (prevents "find is not a function")
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);