const express = require("express");
const app = express();
const socketIO = require("socket.io");
const server = require("http").createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
const cors = require("cors");
app.use(cors());

const emailIdArray = new Map();
const socketIdArray = new Map();
const emailIceIdArray = new Map();
const socketIceIdArray = new Map();

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("userConnect", (userData) => {
    socket.join(userData.roomId);
    socket.broadcast
      .to(userData.roomId)
      .emit("userMessage", { emailId: userData.emailId });
    emailIdArray.set(userData.emailId, socket.id);
    socketIdArray.set(socket.id, userData.emailId);
  });

  socket.on("createOffer", (data) => {
    console.log(
      emailIdArray.get(data.toEmail),
      socketIdArray.get(socket.id),
      "Offer"
    );
    socket.to(emailIdArray.get(data.toEmail)).emit("peerOffer", {
      from: socketIdArray.get(socket.id),
      offer: data.offer,
    });
  });

  socket.on("peerAccept", (data) => {
    console.log("Peer Accept", emailIdArray.get(data.to), data.to);
    socket.to(emailIdArray.get(data.to)).emit("callUser", {
      answer: data.answer,
      from: socketIdArray.get(socket.id),
    });
  });

  socket.on("connectCall", (data) => {
    console.log(data);
    socket.to(emailIdArray.get(data.to)).emit("iceCndidateInfo", {
      iceCandidate: data.ice_candidate,
      from: socketIdArray.get(socket.id),
    });
  });

  // socket.on("connectCall", (data) => {
  //   socket.to(emailIdArray.get(data.to)).emit("callUser", {
  //     answer: data.answer,
  //     from: socketIdArray.get(socket.id),
  //   });
  // });

  socket.on("candidate", (data) => {
    console.log("candidate", data);
    // emailIceIdArray.set(data.emailId, data.iceCandidate);
  });

  // socket.on("callUser", (data) => {
  //   console.log("Test", data.emailId, emailIdArray.get(data.emailId));
  //   socket.to(emailIdArray.get(data.emailId)).emit("userIncomingCall", {
  //     from: socketIdArray.get(socket.id),
  //     offer: data.offer,
  //   });
  // });

  socket.on("callAccept", (data) => {
    const { from, ans } = data;
    const socketId = emailIdArray.get(data.from);
    socket.to(socketId).emit("callAccept", {
      from,
      ans,
    });
  });
});

server.listen(3002, () => {
  console.log("Server running on 3002");
});
