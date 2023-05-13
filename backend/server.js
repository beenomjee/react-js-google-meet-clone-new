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
    if (!rooms[room]) rooms[room] = {};

    socket.emit("user:join", { roomData: rooms[room] });
    rooms[room][socket.id] = user;
    // setting these value to broadcast in room
    socket.join(room);
    socket.room = room;
    socket.name = name;
  });

  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer, name: socket.name });
  });

  socket.on("candidate", ({ to, candidate }) => {
    io.to(to).emit("candidate", { from: socket.id, candidate });
  });

  socket.on("answer", ({ to, answer, enabledObj }) => {
    io.to(to).emit("answer", { from: socket.id, answer, enabledObj });
  });

  socket.on("mute", ({ enabledObj }) => {
    io.to(socket.room).emit("mute", { from: socket.id, enabledObj });
  });

  socket.on("message", ({ time, text }) => {
    io.to(socket.room).emit("message", {
      from: socket.id,
      name: socket.name,
      text,
      time,
    });
  });
  socket.on("disconnect", () => {
    try {
      delete rooms[socket.room][socket.id];
      io.to(socket.room).emit("user:leave", {
        socketId: socket.id,
        name: socket.name,
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
