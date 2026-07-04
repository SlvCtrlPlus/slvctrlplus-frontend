import type { App, InjectionKey, Plugin } from 'vue';
import { inject } from 'vue';
import { io, type ManagerOptions, type SocketOptions } from 'socket.io-client';
import type { AppSocket } from '@/types/socket';

interface SocketPluginOptions extends Partial<ManagerOptions & SocketOptions> {
  connection: string;
}

const injectionKey: InjectionKey<AppSocket> = Symbol('socketIO');

export const useSocketIO = () => inject(injectionKey, null);

export const useRequiredSocketIO = (): AppSocket => {
  const socket = inject(injectionKey, null);
  if (!socket) throw new Error('Socket not available');
  return socket;
};

export const vueSocketIOClient: Plugin = {
  install: async (app: App, options: SocketPluginOptions): Promise<void> => {
    const socketIO: AppSocket = io(options.connection, options);

    socketIO.on('connect', () => {
      console.log(`WebSocket connection established: ${socketIO.id}`);
    });

    app.config.globalProperties.$socket = socketIO;
    app.provide(injectionKey, socketIO);
  },
};
