require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./src/app");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

const server = http.createServer(app);

// 🔥 SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "*", // later restrict to frontend domain
    methods: ["GET", "POST", "PATCH"],
  },
});

// make io accessible everywhere
global.io = io;

// rooms = kitchen separation (optional upgrade)
io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.on("join-kitchen", () => {
    socket.join("kitchen-room");
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});

const start = async () => {
  await mongoose.connect(MONGO_URL);
  console.log("MongoDB Connected");

  server.listen(PORT, () =>
    console.log("Server running on", PORT)
  );
};

start();