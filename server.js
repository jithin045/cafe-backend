require("dotenv").config(); // 🔥 MUST BE FIRST

const app = require("./src/app");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

// Validate env
if (!process.env.MONGO_URL) {
  console.error("❌ MONGO_URL missing in .env");
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY missing in .env");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

connectDB();