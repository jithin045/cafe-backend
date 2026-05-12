require("dotenv").config(); // MUST BE FIRST

const app = require("./src/app");
const mongoose = require("mongoose");

// =========================
// ENV VARIABLES
// =========================
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

// =========================
// VALIDATION (FAIL FAST)
// =========================
if (!MONGO_URL) {
  console.error("❌ MONGO_URL missing in .env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing in .env");
  process.exit(1);
}

// =========================
// DATABASE CONNECTION
// =========================
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(MONGO_URL);

    console.log("✅ MongoDB Connected Successfully");

    // Start server ONLY after DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:");
    console.error(error.message);

    process.exit(1);
  }
};

// =========================
// HANDLE UNHANDLED ERRORS
// =========================
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// =========================
// START SERVER
// =========================
connectDB();