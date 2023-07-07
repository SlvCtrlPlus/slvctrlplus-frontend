import { Socket } from "socket.io-client";
import { ComponentCustomProperties } from "vue";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $socket: typeof Socket;
  }
}
