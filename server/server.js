import fs from 'fs';
import { Server } from 'socket.io'; // WebSocket Library

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

const QUESTION_TIMEOUT = 25000; // The time you need to answer the question in before it times out

// On New WebSocket Connection From a Client
io.on("connection", (socket) => {
  const { joinType, nickname, joinCode, numQuestions, questionTypes } = socket.handshake.query;

  const rejectConnection = (message) => {
    socket.emit("disconnectReason", message);
    socket.disconnect();
  };

  // If no nickname or the nickname isn't 3 characters long, disconnect them
  if (!nickname || nickname.length < 3) {
    return rejectConnection("Invalid Nickname");
  };

  if (joinType === "create") { // If Creating a New Game
    const maxQuestions = parseInt(numQuestions);
    // If not a number or the amount of questions is over/below the limits, disconnect them
    if (isNaN(maxQuestions) || maxQuestions > 20 || maxQuestions < 1) {
      return rejectConnection("Invalid Number of Questions");
    };

    // Turn back to an array as it gets converted to a string when passed over a URL
    const possibleQuestions = questionTypes?.split(',');

    // Check if exists, check length is > 0 (need at least 1 type of question), 
    // Check if every element in the array is also in the QuestionTypes array
    // Otherwise, throw an error and don't let them create the game
    if (!possibleQuestions || possibleQuestions.length <= 0 || !possibleQuestions.every(q => QuestionTypes.includes(q))) {
      return rejectConnection("Invalid Selection of Question Types");
    };

    // Randomly Generate a Game Code
    const gameCode = generateGameCode();

    const game = {
      state: 0,
      code: gameCode,
      players: [ // An array of all players in the game, initially starting with just the game host
        { id: socket.id, name: nickname, creator: true, score: 0 },
      ],
      possibleQuestions: possibleQuestions,
      questions: [],
      currentQuestion: -1,
      maxQuestion: maxQuestions - 1,
      answers: [],
    };

    // Add the joinCode of the room they are in to the socket data so it can be referred to when they send data to the server
    socket.data.gameCode = gameCode;

    // Send the generated game code and initial game data to the host client so they can share it
    socket.emit("ready", true, gameCode, game);

    // Adds the player websocket to a "room" so that we can emit events to all players in the game lobby at once
    socket.join(gameCode);

    // Add the game to the object with all active games in
    gameLobbies[gameCode] = game;

    socket.on("startGame", () => {
      if (game.currentQuestion < 0) {
        // Generate & Send out 1st Question
        playQuestion(socket.data.gameCode);
      };
    });
  } else { // If Joining an Existing Game
    const game = gameLobbies[joinCode];

    // If no game found with game code, disconnect them and don't let them join
    if (!game) {
      return rejectConnection("Invalid Game Code");
    };

    // If the game has already started, disconnect them and don't let them join
    if (game.state > 0) {
      return rejectConnection("Game Already Started");
    };

    // If there is already someone in the game with the game nickname, don't let them join
    // Compare lower case of both to ignore case differences
    if (game.players.find(p => p.name.toLowerCase() === nickname.toLowerCase())) {
      return rejectConnection("That Nickname is Taken");
    };

    // Add the new player to the array of players already in the game
    game.players.push({
      id: socket.id,
      name: socket.handshake.query.nickname,
      creator: false,
      score: 0,
    });

    // Add the joinCode of the room they are in to the socket data so it can be referred to when they send data to the server
    socket.data.gameCode = joinCode;

    // Adds the player websocket to a "room" so that we can emit events to all players in the game lobby at once
    socket.join(joinCode); 

    // Send the generated game code and initial game data so they can share it
    socket.emit("ready", false, joinCode, game);
    // Update players for EVERYONE in the game
    socket.to(joinCode).emit("updatePlayers", game.players, socket.id);
  };

  socket.on("giveAnswer", (answer) => {
    const game = gameLobbies[socket.data.gameCode];
    // If the game is in the right state, and the player hasn't already send their answer for the round (or been timed out)
    if (game && game.state === 1 && !game.answers[game.currentQuestion][socket.id]) {
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
    // Remove the player who just left from the game
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
  const newQuestion = getQuestion(game.possibleQuestions, game.questions);
  const questionNum = game.currentQuestion + 1;

  game.state = 1;
  game.currentQuestion = questionNum;
  game.questions.push(newQuestion);
  game.answers.push({});

  // If the players have not answered by the time limit, end the round and don't give them any points!
  setTimeout(() => {
    if (game && game.state === 1 && game.currentQuestion === questionNum) {
      // For Every Player
      game.players.forEach(player => {
        if (!game.answers[questionNum][player.id]) {
          game.answers[questionNum][player.id] = {
            correct: false,
            answer: "",
            timeTaken: QUESTION_TIMEOUT,
            timeOut: true,
          }
        }
      });

      isGameRoundComplete(gameCode);
    }
  }, QUESTION_TIMEOUT);

  // Send the startQuestion event to all players in the game
  io.to(gameCode).emit(
    "startQuestion",
    game.currentQuestion,
    newQuestion,
    QUESTION_TIMEOUT,
  );
};

const isGameRoundComplete = (gameId) => {
  const game = gameLobbies[gameId];
  if (game && game.state === 1) {
    const question = game.questions[game.currentQuestion];

    const answeredPlayers = Object.keys(game.answers[game.currentQuestion]);
    const connectedPlayers = game.players.map(p => p.id);

    // If Every Player in Game Has "Answered" or have been timed out
    if (connectedPlayers.every(playerId => answeredPlayers.includes(playerId))) {
      game.state = 2;

      // Order player IDs in the time taken to answer
      const answerOrder = [...answeredPlayers]
        .filter(a => game.answers[game.currentQuestion][a].correct)
        .sort((a, b) => game.answers[game.currentQuestion][a].timeTaken - game.answers[game.currentQuestion][b].timeTaken);

      // Now the scores can be calculated as everyones time can be considered
      game.players = game.players.map(player => {
        const roundResults = game.answers[game.currentQuestion][player.id];
        roundResults.score = calculateScore(player.id, roundResults.correct, answerOrder);;

        return {
          ...player,
          score: player.score + roundResults.score
        }
      });

      // Send the finishQuestion event to all players in the game lobby
      io.to(game.code).emit("finishQuestion", game.players, question.displayedAnswer, game.answers[game.currentQuestion]);

      setTimeout(() => {
        if (game.currentQuestion >= game.maxQuestion) {
          // Emit the finishGame event to all players in the game, 
          // including the list of players now sorted by the order in which they scored to they can be displayed on all players scoreboards
          io.to(game.code).emit("finishGame", game.players.sort((a, b) => b.score - a.score));
          // Disconnect all players from the websocket
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