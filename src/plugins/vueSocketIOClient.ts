import type { App, InjectionKey, Plugin } from "vue";
import { inject } from "vue";
import {
  io,
  type ManagerOptions,
  Socket,
  type SocketOptions,
} from "socket.io-client";

interface SocketPluginOptions extends Partial<ManagerOptions & SocketOptions> {
  connection: string;
}

const injectionKey: InjectionKey<Socket> = Symbol("socketIO");

export const useSocketIO = () => inject(injectionKey, null);

export const vueSocketIOClient: Plugin = {
  install: async (app: App, options: SocketPluginOptions): Promise<void> => {
    const socketIO = io(options.connection, options);

    socketIO.on("connect", () => {
      console.log(`WebSocket connection established: ${socketIO.id}`);
    });

    app.config.globalProperties.$socket = socketIO;
    app.provide(injectionKey, socketIO);
  },
};
