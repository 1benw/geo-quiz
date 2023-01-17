import { Server } from 'socket.io';

import shConfig from '../shared_config.json' assert { type: "json" };
import { generateGameCode, calculateScore } from './utils.js';
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
        { id: socket.id, name: nickName, creator: true, score: 0 },
      ],
      started: false,
      questions: [],
      currentQuestion: -1,
      answers: [],
    }

    socket.data.gameCode = gameCode;
    socket.emit("ready", true, gameCode, game);
    socket.join(gameCode);

    gameLobbies[gameCode] = game;

    console.log("Game Created", gameCode);

    socket.on("startGame", () => {
      console.log("Game Started", game.players);
      if (game.currentQuestion < 0) {
        playQuestion(gameCode);
      }
    });
  } else if (joinType === "join" && joinCode) {
    const game = gameLobbies[joinCode];
    if (game) {
      if (game.players.find(p => p.name.toLowerCase() === nickName.toLowerCase())) {
        socket.emit("disconnectReason", "That Nickname is Taken");
        socket.disconnect();
        return;
      }

      game.players.push({
        id: socket.id,
        name: socket.handshake.query.nickName,
        creator: false,
        score: 0,
      });

      console.log('Game Joined', socket.id);

      socket.data.gameCode = joinCode;
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

      game.answers[game.currentQuestion][socket.id] = {
        correct,
        answer,
        timeTaken: Date.now() - question.time,
      };

      const answeredPlayers = Object.keys(game.answers[game.currentQuestion]);
      const connectedPlayers = game.players.map(p => p.id);

      if (connectedPlayers.every(playerId => answeredPlayers.includes(playerId))) {
        // Order player IDs in the time taken to answer
        const answerOrder = [...answeredPlayers].sort((a, b) => game.answers[game.currentQuestion][a].timeTaken - game.answers[game.currentQuestion][b].timeTaken);

        console.log("everyone has answered, order: ", answerOrder)
        // Now the scores can be calculated as everyones time can be considered
        game.players = game.players.map(player => {
          const roundResults = game.answers[game.currentQuestion][player.id];
          roundResults.score = calculateScore(player.id, roundResults.correct, answerOrder);;

          return {
            ...player,
            score: player.score + roundResults.score
          }
        });

        console.log(game.players);
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

  console.log("New Question", game.currentQuestion, newQuestion);

  io.to(gameCode).emit(
    "startQuestion",
    game.currentQuestion,
    newQuestion,
  );
}