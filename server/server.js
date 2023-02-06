import fs from 'fs';
import { Server } from 'socket.io';

import shConfig from '../shared_config.json' assert { type: "json" };
import { generateGameCode, calculateScore } from './utils.js';
import { QuestionTypes, checkAnswer, getQuestion } from './questions/question.js';

const gameLobbies = {};

// Create a new WebSocket
export const io = new Server(shConfig.port, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  const { joinType, nickname, joinCode, numQuestions, questionTypes } = socket.handshake.query;

  // Check if nickname is valid
  if (!nickname || nickname < 3) {
    socket.emit("disconnectReason", "Invalid Nickname");
    socket.disconnect();
    return;
  };

  if (joinType === "create") { // If Creating a New Game
    const maxQuestions = parseInt(numQuestions);
    if (isNaN(maxQuestions) || maxQuestions > 20 || maxQuestions < 1) {
      socket.emit("disconnectReason", "Invalid Number of Questions");
      socket.disconnect();
      return;
    };

    // Turn back to an array as it gets converted to a string when passed over a URL
    const possibleQuestions = questionTypes?.split(',');

    // Check if exists, check length is > 0, check if every element in the array is also in the QuestionTypes array
    // Otherwise, throw an error and don't let them create the game
    if (!possibleQuestions || possibleQuestions.length <= 0 || !possibleQuestions.every(q => QuestionTypes.includes(q))) {
      socket.emit("disconnectReason", "Invalid Selection of Question Types");
      socket.disconnect();
      return;
    };

    // Randomly Generate a Game Code
    const gameCode = generateGameCode();

    const game = {
      state: 0,
      code: gameCode,
      players: [
        { id: socket.id, name: nickname, creator: true, score: 0 },
      ],
      possibleQuestions: possibleQuestions,
      questions: [],
      currentQuestion: -1,
      maxQuestion: maxQuestions - 1,
      answers: [],
    };

    socket.data.gameCode = gameCode;
    socket.emit("ready", true, gameCode, game);
    socket.join(gameCode);

    gameLobbies[gameCode] = game;

    console.log("Game Created", gameCode);

    socket.on("startGame", () => {
      if (game.currentQuestion < 0) {
        // Change Game State so no new players can join.
        console.log("Game Started", socket.data.gameCode);
        gameLobbies[socket.data.gameCode].state = 1;

        // Generate & Send out 1st Question
        playQuestion(socket.data.gameCode);
      };
    });
  } else if (joinType === "join" && joinCode) { // If Joining an Existing Game
    const game = gameLobbies[joinCode];

    if (!game) {
      socket.emit("disconnectReason", "Invalid Game Code");
      socket.disconnect();
      return;
    };

    if (game.state > 0) {
      socket.emit("disconnectReason", "Game Already Started");
      socket.disconnect();
      return;
    };

    if (game.players.find(p => p.name.toLowerCase() === nickname.toLowerCase())) {
      socket.emit("disconnectReason", "That Nickname is Taken");
      socket.disconnect();
      return;
    };

    // Add the new player to the array of players in the game
    game.players.push({
      id: socket.id,
      name: socket.handshake.query.nickname,
      creator: false,
      score: 0,
    });

    console.log('Game Joined', socket.id);

    socket.data.gameCode = joinCode;
    socket.join(joinCode);
    socket.emit("ready", false, joinCode, game);
    socket.to(joinCode).emit("updatePlayers", game.players, socket.id);
  } else {
    socket.emit("disconnectReason", "Game Does Not Exist");
    socket.disconnect();
    return;
  };

  socket.on("giveAnswer", (answer) => {
    const game = gameLobbies[socket.data.gameCode];
    if (game && game.currentQuestion >= 0 && !game.answers[game.currentQuestion][socket.id]) {
      const question = game.questions[game.currentQuestion];
      const correct = checkAnswer(question.id, question.data, answer);

      game.answers[game.currentQuestion][socket.id] = {
        correct,
        answer,
        timeTaken: Date.now() - question.time,
      };

      // Check if the round is complete yet (has everyone answered? - if so then end the round)
      isGameRoundComplete(game.code);
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
    } else {
      // Check if the round is over (has everyone still remaining answered? - if so then end the round)
      isGameRoundComplete(game.code);
    }
  };
});

const playQuestion = (gameCode) => {
  const game = gameLobbies[gameCode];
  if (!game) {
    return;
  }

  // The new randomly generated Question
  const newQuestion = getQuestion(game.possibleQuestions);

  game.state = 2;
  game.currentQuestion++;
  game.questions.push(newQuestion);
  game.answers.push({});

  console.log("New Question", game.currentQuestion, newQuestion);

  io.to(gameCode).emit(
    "startQuestion",
    game.currentQuestion,
    newQuestion,
  );
};

const isGameRoundComplete = (gameId) => {
  const game = gameLobbies[gameId];
  if (game && game.state === 2) {
    const question = game.questions[game.currentQuestion];

    const answeredPlayers = Object.keys(game.answers[game.currentQuestion]);
    const connectedPlayers = game.players.map(p => p.id);

    // If Every Player in Game Has Answered
    if (connectedPlayers.every(playerId => answeredPlayers.includes(playerId))) {
      game.state = 3;

      // Order player IDs in the time taken to answer
      const answerOrder = [...answeredPlayers]
        .filter(a => game.answers[game.currentQuestion][a].correct)
        .sort((a, b) => game.answers[game.currentQuestion][a].timeTaken - game.answers[game.currentQuestion][b].timeTaken);

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
      io.to(game.code).emit("finishQuestion", game.players, question.displayedAnswer, game.answers[game.currentQuestion]);

      setTimeout(() => {
        if (game.currentQuestion >= game.maxQuestion) {
          console.log("GAME HAS COMPLETE");
          io.to(game.code).emit("finishGame", game.players.sort((a, b) => b.score - a.score));
          io.to(game.code).disconnectSockets();
        } else {
          playQuestion(game.code);
        };
      }, 7 * 1000);
    };
  };
};




























// fs.readFile('../topojson/ne_50m_admin_0_countries.json', 'utf8', async function readFileCallback(err, data){
//   if (err){
//       console.log(err);
//   } else {
//   const obj = JSON.parse(data); //now it an object
//   //console.log(obj)

//   obj.objects.ne_50m_admin_0_countries.geometries = obj.objects.ne_50m_admin_0_countries?.geometries.map(e => {
//     //console.log(e)

//     if (e.properties.LABELRANK >= 5) {
//       console.log(e.properties.NAME)
//     }

//     return {
//       ...e,
//       properties: {
//         ADM0_A3_GB: e.properties.ADM0_A3_GB,
//         NAME: e.properties.NAME,
//         NAME_LONG: e.properties.NAME_LONG,
//         NAME_EN: e.properties.NAME_EN,
//         NAME_SORT: e.properties.NAME_SORT,
//         FORMAL_EN: e.properties.FORMAL_EN,
//         CONTINENT: e.properties.CONTINENT,
//         REGION_UN: e.properties.REGION_UN,
//         SUBREGION: e.properties.SUBREGION,
//         TYPE: e.properties.TYPE,
//         TLC: e.properties.TLC,
//         featurecla: e.properties.featurecla,
//         scalerank: e.properties.scalerank,
//         POP_EST: e.properties.POP_EST,
//         POP_RANK: e.properties.POP_EST,
//         POP_YEAR: e.properties.POP_YEAR,
//         INCOME_GRP: e.properties.INCOME_GRP,
//         ECONOMY: e.properties.ECONOMY,
//         NAME_CIAWF: e.properties.NAME_CIAWF,
//         LABEL_X: e.properties.LABEL_X,
//         LABEL_Y: e.properties.LABEL_Y,
//         FCLASS_ISO: e.properties.FCLASS_ISO,
//         ISO_A2: e.properties.ISO_A2,
//         ISO_A3: e.properties.ISO_A3,
//         ISO_N3: e.properties.ISO_N3,
//         FCLASS_ISO: e.properties.FCLASS_ISO,
//         FCLASS_TLC: e.properties.FCLASS_TLC,
//         LABELRANK: e.properties.LABELRANK,
//       }
//     }
//   })

//   //console.log(obj.objects.ne_50m_admin_0_countries.geometries)

  


//   // obj.table.push({id: 2, square:3}); //add some data
//   const json = JSON.stringify(obj); //convert it back to json
//   fs.writeFile('../topojson/ne_50m_admin_0_countries2.json', json, 'utf8', () => {

//   }); // write it back 

//   const s = await fs.promises.stat("../topojson/ne_50m_admin_0_countries2.json")

//   console.log(s.size / (1024*1024))

//   const s2 = await fs.promises.stat("../topojson/ne_50m_admin_0_countries.json")

//   console.log(s2.size / (1024*1024))


// }});