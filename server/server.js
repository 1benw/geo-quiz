import { Server } from 'socket.io';
import shConfig from '../shared_config.json';
import { generateGameCode } from './utils.js';
import { getQuestion } from './questions/question.js';

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

    const game = {
      code: gameCode,
      players: [
        { id: socket.id, name: nickName, creator: true },
      ],
      started: false,
      questions: [],
      currentQuestion: -1,
    }

    socket.data.gameCode = gameCode;
    socket.join(gameCode);
    socket.emit("ready", true, gameCode, game);

    gameLobbies[gameCode] = game;

    console.log("Game Created", gameCode);

    socket.on("startGame", () => {
      console.log(game.players)
      if (game.currentQuestion < 0) {
        playQuestion(gameCode);
      }
    });
  } else if (joinType === "join" && joinCode) {
    const game = gameLobbies[joinCode];
    if (game) {
      if (game.players.find(p => p.name === nickName || p.name === nickName.toLowerCase() || p.name === nickName.toUpperCase())) {
        socket.emit("disconnectReason", "That Nickname is Taken");
        socket.disconnect();
        return;
      }

      game.players.push({
        id: socket.id,
        name: socket.handshake.query.nickName,
      });

      console.log('Game Joined', socket.id)

      socket.join(joinCode);
      socket.emit("ready", false, joinCode, game);
      socket.to(joinCode).emit("updatePlayers", game.players, socket.id);
    } else {
      socket.emit("disconnectReason", "Invalid Game Code");
      socket.disconnect();
      return;
    }
  }

  socket.on("giveAnswer", () => {
    const game = gameLobbies[socket.data.gameCode]
    if (game) {

    }
  });
});

io.of("/").adapter.on("leave-room", (room, id) => {
  const game = gameLobbies[room];
  if (game) {
    console.log("Leaving Game", room, id);
    game.players = game.players.filter(p => p.id !== id);

    // If there are no players left, delete the room
    if (game.players.length <= 0) {
      delete gameLobbies[room];
    }
  };
});

const playQuestion = (gameCode) => {
  const game = gameLobbies[gameCode];
  if (!game) {
    return;
  }

  const newQuestion = getQuestion();

  game.currentQuestion++;
  game.questions.push(newQuestion);

  console.log(game.currentQuestion);

  io.to(gameCode).emit(
    "presentQuestion",
    game.currentQuestion,
    newQuestion,
  );
}