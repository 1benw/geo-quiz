import create from "zustand";
import io from "socket.io-client";
import { showNotification } from '@mantine/notifications';

import shConfig from "../../../shared_config.json";

const useGameStore = create((set, get) => ({
  connected: false,
  socket: null,
  ready: false,
  disconnectReason: null,
  playerId: null,
  isHost: false,
  loading: false,
  loadingText: null,
  currentQuestion: 0,
  questionData: null,
  connect: (newGame, nickName, joinCode) => {
    const query = {
      joinType: newGame ? "create" : "join",
    };

    if (nickName) {
      query.nickName = nickName;
    };

    if (joinCode) {
      query.joinCode = joinCode;
    };

    const socket = io(`http://${window.location.hostname}:${shConfig.server.port}`, {
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
      console.log("Disconnected from Server");
      set({
        connected: false,
        socket: null,
        ready: false,
      });

      switch (reason) {
        case "io server disconnect": // Server was Manually Disconnected
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
      console.log("New Player Joined");
      set({ players: players });
    }).on("presentQuestion", (question, data) => {
      get().setLoading(true, "Loading Next Question");
      set({
        currentQuestion: question,
        questionData: data,
      });

      setTimeout(() => {
        get().setLoading(false);
      }, 2000);
    });
  },
  start: () => {
    const s = get();
    if (s.connected && s.ready && s.isHost) {
      s.socket.emit("startGame");
    }
  },
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
  }
}));

export default useGameStore;
