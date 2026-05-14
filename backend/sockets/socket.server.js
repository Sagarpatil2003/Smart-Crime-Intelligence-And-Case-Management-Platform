const { Server } = require("socket.io");
const alertService = require("../services/alert.service")

let io

exports.initSocket = (server) => {

  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  })

  io.on("connection", (socket) => {

    socket.on("register", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    });

    socket.on("update_location", async ({ userId, location }) => {
      await alertService.storeUserLocation(userId, location);
    });

  });

  alertService.initSocket(io)

  return io
};

