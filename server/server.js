import { Server } from 'socket.io';
import shConfig from '../shared_config.json';
import { generateGameCode } from './utils.js';

const gameLobbies = {};

export const io = new Server(shConfig.server.port, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  if (socket.handshake.query.joinType === "create") {
    const gameCode = generateGameCode();

    gameLobbies[gameCode] = {
      createdBy: socket.id,
      players: [
        { id: socket.id, name: socket.handshake.query.nickName },
      ],
    }

    socket.data.gameCode = gameCode;

    socket.join(gameCode);

    console.log("Game Created", gameCode);
  } else if (socket.handshake.query.joinType === "join") {
    // TODO
  }
});

io.of("/").adapter.on("leave-room", (room, id) => {
  if (gameLobbies[room]) {
    console.log("Leaving Game", room, id);
    gameLobbies[room].players = gameLobbies[room].players.filter(p => p.id !== id);

    // If there are no players left, delete the room
    if (gameLobbies[room].players.length <= 0) {
      delete gameLobbies[room];
    }
  };
});