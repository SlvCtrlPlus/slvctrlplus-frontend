import type { App, InjectionKey, Plugin } from "vue";
import { inject } from "vue";
import { io, Socket } from "socket.io-client";

const injectionKey: InjectionKey<Socket> = Symbol("socketIO");

export const useSocketIO = () => inject(injectionKey, null);

export const vueSocketIOClient: Plugin = {
  install: async (app: App, options: any): Promise<void> => {
    const socketIO = io(options.connection, options);

    socketIO.on("connect", () => {
      console.log(`WebSocket connection established: ${socketIO.id}`);
    });

    app.config.globalProperties.$socket = socketIO;
    app.provide(injectionKey, socketIO);
  },
};
