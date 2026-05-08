const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// routes
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Cafe API Running 🚀");
});

module.exports = app;