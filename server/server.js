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
  const { joinType, nickName, joinCode } = socket.handshake.query;
  if (!nickName || nickName < 3) {
    socket.emit("disconnectReason", "Invalid Nickname");
    socket.disconnect();
    return;
  }

  if (joinType === "create") {
    const gameCode = generateGameCode();

    gameLobbies[gameCode] = {
      code: gameCode,
      players: [
        { id: socket.id, name: nickName, creator: true },
      ],
    }

    socket.data.gameCode = gameCode;

    socket.join(gameCode);
    socket.emit("ready", gameCode, gameLobbies[gameCode]);

    console.log("Game Created", gameCode);
  } else if (joinType === "join" && joinCode) {
    // TODO
    if (gameLobbies[joinCode]) {
      if (gameLobbies[joinCode].players.find(p => p.name === nickName || p.name === nickName.toLowerCase() || p.name === nickName.toUpperCase())) {
        socket.emit("disconnectReason", "That Nickname is Taken");
        socket.disconnect();
        return;
      }

      gameLobbies[joinCode].players.push({
        id: socket.id,
        name: socket.handshake.query.nickName,
      });

      console.log('Game Joined', socket.id)
      io.to(joinCode).emit("updatePlayers", gameLobbies[joinCode].players);

      socket.join(joinCode);
      socket.emit("ready", joinCode, gameLobbies[joinCode]);
    } else {
      socket.emit("disconnectReason", "Invalid Game Code");
      socket.disconnect();
      return;
    }
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