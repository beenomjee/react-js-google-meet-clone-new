import app from "./app.js";
import { connect } from "./db/index.js";
import { Server } from "socket.io";
import http from "http";

const httpApp = http.createServer(app);

const io = new Server(httpApp, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

const rooms = {};

io.on("connection", (socket) => {
  socket.on("user:join", ({ room, name }) => {
    const user = { name };
    // creating if not exixt
    if (!rooms[room])
      rooms[room] = {
        screenSharingData: {
          isRunning: false,
          socketId: null,
        },
      };

    socket.emit("user:join", { roomData: rooms[room], mySocketId: socket.id });
    rooms[room][socket.id] = user;
    // setting these value to broadcast in room
    socket.join(room);
    socket.room = room;
    socket.name = name;
  });

  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", {
      from: socket.id,
      offer,
      name: socket.name,
      screenSharingData: rooms[socket.room].screenSharingData,
    });
  });

  socket.on("candidate", ({ to, candidate }) => {
    io.to(to).emit("candidate", { from: socket.id, candidate });
  });

  socket.on("answer", ({ to, answer, enabledObj }) => {
    io.to(to).emit("answer", {
      from: socket.id,
      answer,
      enabledObj,
      name: socket.name,
    });
  });

  socket.on("mute", ({ enabledObj }) => {
    io.to(socket.room).emit("mute", {
      name: socket.name,
      from: socket.id,
      enabledObj,
    });
  });

  socket.on("message", ({ time, text }) => {
    io.to(socket.room).emit("message", {
      from: socket.id,
      name: socket.name,
      text,
      time,
    });
  });

  socket.on("user:screen:sharing", () => {
    if (!rooms[socket.room].screenSharingData.isRunning) {
      rooms[socket.room].screenSharingData = {
        isRunning: true,
        socketId: socket.id,
      };
      io.to(socket.room).emit("user:screen:sharing", {
        from: socket.id,
        name: socket.name,
      });
    } else {
      socket.emit("user:screen:sharing:reject", {});
    }
  });

  socket.on("user:screen:sharing:stop", ({ isVideoOn }) => {
    rooms[socket.room].screenSharingData = {
      isRunning: false,
      socketId: null,
    };
    io.to(socket.room).emit("user:screen:sharing:stop", {
      from: socket.id,
      name: socket.name,
      isVideoOn,
    });
  });

  socket.on("disconnect", () => {
    try {
      delete rooms[socket.room][socket.id];
      let isLeaveUserIsScreenSharer = false;
      if (
        rooms[socket.room].screenSharingData.isRunning &&
        rooms[socket.room].screenSharingData.socketId === socket.id
      ) {
        isLeaveUserIsScreenSharer = true;
        rooms[socket.room].screenSharingData = {
          isRunning: false,
          socketId: null,
        };
      }

      io.to(socket.room).emit("user:leave", {
        socketId: socket.id,
        name: socket.name,
        isLeaveUserIsScreenSharer,
      });

      if (rooms[socket.room].keys === 0) delete rooms[socket.room];
    } catch (e) {}
  });
});

// port
const port = process.env.PORT || 3002;
httpApp.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Server listening on ${port}`);
  connect();
});
