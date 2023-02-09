import create from "zustand";
import io from "socket.io-client";
import { showNotification } from '@mantine/notifications';

import shConfig from "../../../shared_config.json";

const initialState = {
  connected: false,
  socket: null,
  ready: false,
  //disconnectReason: null,
  playerId: null,
  isHost: false,
  loading: false,
  loadingText: null,
  currentQuestion: 0,
  questionData: null,
  state: 0,
  latestResults: null,
  latestAnswer: null,
  progressTimer: null,
  progressTimerEnd: null,
};

const useGameStore = create((set, get) => ({
  ...initialState,
  // connected: true,
  // state: 1,
  // playerId: 1,
  // currentQuestion: 1,
  // questionData: {
  //   type: "guess-united-states",
  //   question: "Select",
  //   data: {
  //     id: "WI",
  //   }
  // },
  // players: [
  //   { id: 1, name: "bob", score: 7 },
  //   // { id: 2, name: "Dave", score: 7 },
  //   // { id: 3, name: "Dan", score: 7 },
  //   // { id: 3, name: "bob", score: 7 },
  //   // { id: 3, name: "bob", score: 7 },
  //   // { id: 3, name: "bob", score: 7 },
  //   // { id: 3, name: "bob", score: 7 },
  //   // { id: 3, name: "bob", score: 7 },
  //   // { id: 3, name: "bob", score: 7 },
  //   // { id: 3, name: "bob", score: 7 },
  //   // { id: 3, name: "bob", score: 7 },
  //   // { id: 2, name: "bob", score: 7 },
  // ],
  connect: (newGame, data) => {
    const query = {
      joinType: newGame ? "create" : "join",
      ...data,
    };

    const socket = io(shConfig.socket, {
      query,
    });

    set({
      socket: socket,
      disconnectReason: null
    });

    socket.on("connect", () => {
      console.log("Connected to Server");
      set({ connected: true, playerId: socket.id });
    }).on("disconnect", (reason) => {
      if (get().state !== 3) {
        set({
          ...initialState,
        });
  
        // Handle disconnections differently depending on the reason
        switch (reason) {
          case "io server disconnect": // Server was Manually Disconnected, 
            // Therefore see if there was a reason given e.g. wrong nickname provided
            const disconnectReason = get().disconnectReason;
            if (disconnectReason) {
              showNotification({
                color: "red",
                title: "Error",
                message: disconnectReason,
                disallowClose: true,
              });
              break;
            }
          case "ping timeout":
          case "transport close":
            showNotification({
              color: "red",
              title: "Error",
              message: "Connection Lost",
              disallowClose: true,
            });
            break;
          default:
            showNotification({
              color: "red",
              title: "Error",
              disallowClose: true,
            });
            break;
        };
      }

      console.log("Disconnected from Server");
      socket.disconnect();
    }).on("disconnectReason", (reason) => {
      set({ disconnectReason: reason });
    }).on("ready", (isHost, code, gameData) => {
      set({
        ready: true,
        isHost,
        code,
        players: gameData.players,
      });
    }).on("updatePlayers", (players) => {
      set({ players: players });
    }).on("startQuestion", (question, data, timeout) => {
      get().startQuestion(question, data, timeout);
    }).on("finishQuestion", (players, correctAnswer, results) => {
      get().finishQuestion(players, correctAnswer, results);
    }).on("finishGame", (players) => {
      get().finishGame(players);
    });
  },
  start: () => {
    const s = get();
    if (s.connected && s.ready && s.isHost) {
      s.socket.emit("startGame");
    }
  },

  startQuestion: (question, data, timeout) => {
    get().clearProgressTimer();
    get().setLoading(true, "Loading Next Question");

    set({
      currentQuestion: question,
      questionData: data,
      state: 1,
    });

    get().setProgressTimer(timeout - 500);
    setTimeout(() => get().setLoading(false), 1500);
  },

  sendAnswer: (data) => {
    const s = get();

    if (s.connected && s.ready && s.questionData) {
      s.socket.emit("giveAnswer", data);
      set({ answered: true });
      s.setLoading(true, "Was Your Answer Correct?");
      s.clearProgressTimer();
    }
  },

  finishQuestion: (players, correctAnswer, results) => {
    set({ answered: false });
    setTimeout(() => {
      set({
        state: 2,
        players: players,
        latestAnswer: correctAnswer,
        latestResults: results,
      });

      get().setLoading(false);
      get().setProgressTimer(6.5 * 1000);
    }, 500);
  },

  leaveGame: () => {
    const socket = get().socket;
    if (socket && socket.connected) {
      // Game is over and you are no longer required to stay connected to the websocket
      socket.disconnect();
    };

    set({ ...initialState });
  },
  
  finishGame: (players) => {
    set({
      state: 3,
      players: players,
    });
  },

  // Help Functions

  setLoading: (state, text) => {
    if (state) {
      set({
        loading: true,
        loadingText: text ?? false
      });
    } else {
      set({
        loading: false,
      });
    }
  },
  setProgressTimer: (ms) => {
    set({
      progressTimer: ms,
      progressTimerEnd: Date.now() + ms,
    });
  },
  clearProgressTimer: () => {
    set({
      progressTimer: null,
      progressTimerEnd: null,
    });
  }
}));

export default useGameStore;
