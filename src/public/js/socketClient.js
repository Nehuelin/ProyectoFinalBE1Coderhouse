const socket = io();

socket.on("connect", () => {
  console.log(
    `Connected to Socket.IO: ${socket.id}`
  );
});

socket.on(
  "connectionSuccess",
  (data) => {
    console.log(data.message);
  }
);

socket.on("disconnect", (reason) => {
  console.log(
    `Disconnected from Socket.IO: ${reason}`
  );
});

socket.on("connect_error", (error) => {
  console.error(
    "Socket.IO connection error:",
    error.message
  );
});

socket.on("productsUpdated", (data) => {
  console.log(
    "Products update received:",
    data
  );
});