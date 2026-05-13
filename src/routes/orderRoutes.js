const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  updateStatus,
  getOrderById,
  getOrderByToken,
  getOrderStats,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// =========================
// PUBLIC (CUSTOMER)
// =========================
router.post("/", createOrder);


// =========================
// PROTECTED (STAFF / ADMIN)
// =========================
router.get(
  "/",
  authMiddleware,
  roleMiddleware("staff", "admin"),
  getOrders
);

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("admin"),
  getOrderStats
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("staff", "admin"),
  updateStatus
);


// =========================
// PUBLIC TRACKING
// =========================
router.get("/:id", getOrderById);

router.get("/token/:token", getOrderByToken);

module.exports = router;