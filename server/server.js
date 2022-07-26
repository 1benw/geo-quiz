import { Server } from 'socket.io';
import shConfig from '../shared_config.json';
import { generateGameCode } from './utils.js';
import { checkAnswer, getQuestion } from './questions/question.js';

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
      answers: [],
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

  socket.on("giveAnswer", (answer) => {
    const game = gameLobbies[socket.data.gameCode];
    if (game && game.currentQuestion >= 0 && !game.answers[game.currentQuestion][socket.id]) {
      const question = game.questions[game.currentQuestion];
      const correct = checkAnswer(question.type, question.data, answer);

      console.log(socket.id, answer, question.question, correct);

      game.answers[game.currentQuestion][socket.id] = {
        correct,
        answer,
      };

      const answeredPlayers = Object.keys(game.answers[game.currentQuestion]);
      const connectedPlayers = game.players.map(p => p.id);

      if (connectedPlayers.every(playerId => answeredPlayers.includes(playerId))) {
        console.log("everyone has answered")
      }
    };
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
  game.answers.push({});

  console.log(game.currentQuestion);

  io.to(gameCode).emit(
    "startQuestion",
    game.currentQuestion,
    newQuestion,
  );
}