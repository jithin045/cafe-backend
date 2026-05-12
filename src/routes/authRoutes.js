const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// REGISTER (ADMIN / STAFF)
router.post("/register", authController.registerUser);

// LOGIN
router.post("/login", authController.login);

module.exports = router;