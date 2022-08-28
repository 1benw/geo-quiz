import create from "zustand";
import io from "socket.io-client";
import { showNotification } from '@mantine/notifications';

import shConfig from "../../../shared_config.json";

const useGameStore = create((set, get) => ({
  connected: false,
  ready: false,
  disconnectReason: null,
  loading: false,
  loadingText: null,
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

    const socket = io(`${shConfig.server.url}:${shConfig.server.port}`, {
      query,
    });

    set({ disconnectReason: null });

    socket.on("connect", () => {
      console.log("Connected to Server");
      set({ connected: true });
    }).on("disconnect", (reason) => {
      console.log("Disconnected from Server");
      set({
        connected: false,
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
    }).on("ready", (code, gameData) => {
      set({
        ready: true,
        code,
        players: gameData.players,
      });
    }).on("updatePlayers", (players) => {
      console.log("New Player Joined");
      set({ players: players });
    });
  },
  setLoading: (state, text) => {
    set({ loading: state, loadingText: text ?? false });
  }
}));

export default useGameStore;
