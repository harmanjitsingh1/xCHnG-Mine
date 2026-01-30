import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = http.createServer(app);
const activeUsers = new Map();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URI,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ role, userId }) => {
    if (!userId) return;
    activeUsers.set(socket.id, userId);
    if (role === "admin") socket.join("admins");
    else socket.join(`user_${userId}`);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.id);
  });
});

export const sendNotificationToAdmins = (data) => {
  io.to("admins").emit("notifyAdmins", data);
};
export const sendNotificationToUser = (userId, data) => {
  io.to(`user_${userId}`).emit("notifyUser", data);
};

export const forceLogoutUser = (userId, reason = "session_expired") => {
  io.to(`user_${userId}`).emit("forceLogout", { reason });
};

export { io, app, httpServer };
