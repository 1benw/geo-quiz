import create from "zustand";
import io from "socket.io-client";

import shConfig from "../../../shared_config.json";

const useGameStore = create((set) => ({
  connected: false,
  connect: (newGame, nickName, joinCode) => {
    const query = {
      joinType: newGame ? "create" : "join",
    };

    if (nickName) {
      query.nickName = nickName;
    }

    if (joinCode) {
      data.joinCode = joinCode;
    }

    const socket = io(`${shConfig.server.url}:${shConfig.server.port}`, {
      query,
    });

    socket.on("connect", () => {
      console.log("Connected to Server");
      set({ connected: true });
    }).on("disconnect", () => {
      console.log("Disconnected from Server");
      set({ connected: false });
    });
  },
}));

export default useGameStore;
