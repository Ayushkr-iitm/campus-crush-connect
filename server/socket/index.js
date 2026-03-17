const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Match = require("../models/Match");
const Message = require("../models/Message");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication token missing"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // eslint-disable-next-line no-console
    console.log("Socket connected:", socket.userId);

    socket.on("join_match", async (matchId) => {
      const match = await Match.findById(matchId);
      if (!match) return;
      if (match.user1.toString() !== socket.userId && match.user2.toString() !== socket.userId) {
        return;
      }
      socket.join(`match:${matchId}`);
    });

    socket.on("typing", ({ matchId, isTyping }) => {
      socket.to(`match:${matchId}`).emit("typing", {
        userId: socket.userId,
        isTyping
      });
    });

    socket.on("send_message", async ({ matchId, message }) => {
      if (!message || !message.trim()) return;
      const match = await Match.findById(matchId);
      if (!match) return;
      if (match.user1.toString() !== socket.userId && match.user2.toString() !== socket.userId) {
        return;
      }

      const receiverId = match.user1.toString() === socket.userId ? match.user2 : match.user1;

      const msgDoc = await Message.create({
        matchId,
        senderId: socket.userId,
        receiverId,
        message: message.trim()
      });

      io.to(`match:${matchId}`).emit("new_message", {
        _id: msgDoc._id,
        matchId,
        senderId: socket.userId,
        receiverId,
        message: msgDoc.message,
        timestamp: msgDoc.createdAt
      });
    });

    socket.on("disconnect", () => {
      // eslint-disable-next-line no-console
      console.log("Socket disconnected:", socket.userId);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};

