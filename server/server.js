import { Server } from 'socket.io';
import fs from 'fs';

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

        io.to(game.code).emit("finishQuestion", game.players, question.displayedAnswer, game.answers[game.currentQuestion]);
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


// fs.readFile('../topojson/countries.json', 'utf8', async function readFileCallback(err, data){
//   if (err){
//       console.log(err);
//   } else {
//   const obj = JSON.parse(data); //now it an object
//   //console.log(obj)

//   obj.objects.ne_10m_admin_0_countries_gbr.geometries = obj.objects.ne_10m_admin_0_countries_gbr?.geometries.map(e => {
//     //console.log(e)

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
//       }
//     }
//   })

//   console.log(obj.objects.ne_10m_admin_0_countries_gbr.geometries)

  


//   // obj.table.push({id: 2, square:3}); //add some data
//   // const json = JSON.stringify(obj); //convert it back to json
//   // fs.writeFile('../topojson/countries2.json', json, 'utf8', () => {

//   // }); // write it back 

//   const s = await fs.promises.stat("../topojson/countries2.json")

//   console.log(s.size / (1024*1024))

//   const s2 = await fs.promises.stat("../topojson/countries.json")

//   console.log(s2.size / (1024*1024))


// }});