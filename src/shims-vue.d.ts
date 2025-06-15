declare module "*.vue";
declare module "*.js";
import type { Socket } from "socket.io-client";

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    $socket: Socket;
  }
}
