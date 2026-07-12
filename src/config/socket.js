const { Server } = require("socket.io");

let io;

function initializeSocket(httpServer) {
  io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(
      `Socket connected: ${socket.id}`
    );

    socket.emit("connectionSuccess", {
      message: "Connected to Socket.IO server",
      socketId: socket.id,
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `Socket disconnected: ${socket.id}. Reason: ${reason}`
      );
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized"
    );
  }

  return io;
}

module.exports = {
  initializeSocket,
  getIO,
};